const express = require("express");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
// 引入body-parser
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.text()); // 支持解析 text/plain 类型的请求体
app.use(express.json());

// 设置静态文件目录，使图片可以通过 URL 访问
app.use("/saved_images", express.static(path.join(__dirname, "saved_images")));

const PORT = 4000;
// 添加multer
const multer = require("multer");
const { log } = require("console");

// 数据库部分
const mongoose = require("mongoose"); // 引入mongoose
// MongoDB 连接
mongoose.connect("mongodb://localhost:27017/imageGallery", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 定义图片的 Schema 和 Model
const imageSchema = new mongoose.Schema({
  imageName: String, // 图片名称
  filePath: String, // 图片本地路径
  timestamp: { type: Date, default: Date.now }, // 上传时间
});

const Image = mongoose.model("Image", imageSchema);

// 设置文件存储目录
const upload = multer({ dest: "uploads/" });
const defaultComfyUIUrl = "http://localhost:8188";

const saveDirectory = path.join(__dirname, "saved_images");

// 确保保存目录存在
if (!fs.existsSync(saveDirectory)) {
  fs.mkdirSync(saveDirectory, { recursive: true });
}

// 设置静态文件目录
app.use(express.static("public"));

// 后端查询数据库中的图片并返回给前端
app.get("/api/images", async (req, res) => {
  try {
    // 从数据库查询所有图片
    const images = await Image.find(); // Image是你定义的图片模型
    console.log("Images fetched from database:", images); // 打印数据库中的图片数据

    // 将绝对路径转换为相对路径，确保前端可以访问
    const result = images.map((image) => {
      return {
        imageName: image.imageName,
        filePath: `/saved_images/${path.basename(image.filePath)}`, // 生成相对路径
      };
    });
    console.log("处理后的数据:", result); //
    // 返回处理后的图片路径
    res.json(result);
  } catch (error) {
    console.error("Error fetching images from database:", error);
    res.status(500).send({ error: "Failed to fetch images" });
  }
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "gallery.html"));
});

// 后端路由：保存图片
app.post("/saveImage", (req, res) => {
  const imageName = req.body;

  if (!imageName || typeof imageName !== "string") {
    return res
      .status(400)
      .json({ error: "Image name is required and must be a string" });
  }
  console.log("Request body received imageName:", imageName);

  const imageUrl = `http://127.0.0.1:8188/view?filename=${imageName}&type=output`;
  const savePath = path.join(saveDirectory, imageName);

  // 下载并保存图片
  axios
    .get(imageUrl, { responseType: "stream" })
    .then((response) => {
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        console.log(`Image saved to: ${savePath}`);

        // 保存图片信息到数据库
        const newImage = new Image({
          imageName,
          filePath: savePath,
        });

        await newImage.save();

        res.json({ message: "Image saved successfully", path: savePath });
      });

      writer.on("error", (error) => {
        console.error("Error writing file:", error);
        res.status(500).json({ error: "Error saving image" });
      });
    })
    .catch((error) => {
      console.error("Error fetching the image:", error);
      res.status(500).json({ error: "Error fetching image" });
    });
});

// 这个接口仅仅实现了上传图片保存在uploads目录下，而不会上传到comfyui
app.post("/upload/image", upload.single("image"), (req, res) => {
  console.log("Uploaded file:", req.file);
  res.send({
    message: "File uploaded successfully.",
    filename: req.file.filename,
  });
});

// 新的接口，上传图片到 ComfyUI
app.post("/upload/imageToComfyUI", upload.single("image"), (req, res) => {
  // 检查是否有文件
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }
  // 创建新的 FormData
  const formData = new FormData();
  // 读取上传的文件
  const filePath = path.join(__dirname, req.file.path);
  console.log("File path:", filePath);

  // 将文件附加到 FormData
  formData.append("image", fs.createReadStream(filePath));
  console.log("ImageName:", req.file.filename);
  // 使用 axios 向 ComfyUI 服务发送请求
  axios
    .post(`${defaultComfyUIUrl}/upload/image`, formData, {
      headers: formData.getHeaders(), // 设置 multipart 的 headers
    })
    .then((response) => {
      //   console.log("Image uploaded to ComfyUI successfully:", response.data);

      // 删除本地临时文件
      fs.unlinkSync(filePath);

      // 返回成功响应给前端
      res.send({
        imageName: req.file.filename,
        message: "Image uploaded to ComfyUI successfully.",
        comfyResponse: response.data,
      });
    })
    .catch((error) => {
      console.error("Error uploading to ComfyUI:", error);

      // 删除本地临时文件
      fs.unlinkSync(filePath);

      // 返回错误响应
      res.status(500).send({
        message: "Failed to upload image to ComfyUI.",
        error: error.message,
      });
    });
});

// 路由：加载图片并缓存到本地
app.get("/loadExternalImage", async (req, res) => {
  const { resultImageName } = req.query;

  if (!resultImageName) {
    return res.status(400).send({ error: "resultImageName is required" });
  }

  const externalImageUrl = `${defaultComfyUIUrl}/view?filename=${resultImageName}&type=output`;
  const cachedFilePath = path.join(imageCacheDir, resultImageName);

  // 检查缓存中是否已经存在图片
  if (fs.existsSync(cachedFilePath)) {
    console.log("Serving cached image:", cachedFilePath);
    return res.sendFile(cachedFilePath);
  }

  try {
    // 下载图片
    const response = await axios.get(externalImageUrl, {
      responseType: "stream",
    });
    const writer = fs.createWriteStream(cachedFilePath);

    // 写入本地缓存
    response.data.pipe(writer);

    writer.on("finish", () => {
      console.log(`Image ${resultImageName} cached at ${cachedFilePath}`);
      res.sendFile(cachedFilePath);
    });

    writer.on("error", (err) => {
      console.error("Error writing the image to cache:", err);
      res.status(500).send({ error: "Failed to cache the image" });
    });
  } catch (error) {
    console.error("Error downloading the image:", error);
    res.status(500).send({ error: "Failed to download the image" });
  }
});

// 示例 API 路由
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
