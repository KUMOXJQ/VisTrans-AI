const defaultComfyUIUrl = "http://localhost:8188";
const websocketUrl = "ws://127.0.0.1:8188/ws?clientId=user001";
const L20url = "https://u262838-9d27-f3a17cc1.bjc1.seetacloud.com:8443";

const L20websocketUrl =
  "wss://u262838-9d27-f3a17cc1.bjc1.seetacloud.com:8443/ws?clientId=user001";

// const websocketUrl ="wss://u262838-9d27-f3a17cc1.bjc1.seetacloud.com:8443/ws?clientId=solartworkflowtest9596964589135122";

let uploadedFileName = "";

// 选择图片后显示
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const imgElement = document.getElementById("uploadedImage");

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgElement.src = e.target.result;
      imgElement.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// 激活按钮
function activateButton() {
  const targetButton = document.getElementById("targetButton");
  isButtonClicked = true;
}

// 上传图片
function uploadImage() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];
  uploadedFileName = file.name;
  const formData = new FormData();
  formData.append("image", file);

  // axios
  //   .post(`${defaultComfyUIUrl}/upload/image`, formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   })
  //   .then(() => {
  //     console.log("Image uploaded successfully.");
  //     activateButton();
  //   })
  //   .catch(console.error);
  // 使用 fetch API 上传图片 nodejs中的multer
  fetch("/upload/imageToComfyUI", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      uploadedFileName = data.imageName;
      console.log("Uploaded file:", data);
      console.log("使用nodejs中的multer上传图片成功");
      activateButton(); // 激活按钮的逻辑保留
    })
    .catch(console.error);
}

// 发送 JSON 请求
function sendJsonRequest() {
  fetch("./workflows/api/kumoLocal/newSst.json")
    .then((response) => response.json())
    .then((data) => {
      data.prompt["99"].inputs.seed = Date.now();
      data.prompt["726"].inputs.image = uploadedFileName;
      console.log("JSON request Image Name:", data.prompt["726"].inputs.image);

      axios
        .post(`${defaultComfyUIUrl}/prompt`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(() => console.log("JSON request sent successfully."))
        .catch(console.error);
    })
    .catch(console.error);
}

// 按钮逻辑
const targetButton = document.getElementById("targetButton");
const overlay = document.getElementById("overlay");
const closeModalBtn = document.getElementById("close-modal");
let isButtonClicked = false;

targetButton.addEventListener("click", () => {
  if (!isButtonClicked) {
    overlay.style.display = "block";
  } else {
    isButtonClicked = true;
    targetButton.innerHTML = "这张不行，给我再来一个！";

    const progressBarContainer = document.getElementById(
      "progressBarContainer"
    );
    const progressBar = document.getElementById("progressBar");

    progressBarContainer.style.display = "block";
    progressBar.style.width = "0%";

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        progressBarContainer.style.opacity = "0";
      }
    }, 500);
  }
});

closeModalBtn.addEventListener("click", () => {
  overlay.style.display = "none";
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.style.display = "none";
  }
});

// 加载生成图片
function loadAndSaveImage(resultImageName) {
  const externalImageUrl = `${defaultComfyUIUrl}/view?filename=${resultImageName}&type=output`;

  axios
    .get(externalImageUrl, { responseType: "blob" })
    .then((response) => {
      console.log("ResultImage loaded successfully.", response);
      const imageUrl = URL.createObjectURL(response.data);
      console.log("ResultImage URL:", imageUrl);
      const externalImage = document.getElementById("externalImage");
      externalImage.src = imageUrl;
      externalImage.style.display = "block";

      // 保存图片到本地
      saveImageLocally(resultImageName);
    })
    .catch(console.error);

  // fetch(`/fetch/imageFotOutput?imageUrl=${externalImageUrl}`);
  // 新的请求图片并保存在本地。
}

// 新增保存图片到本地的函数
function saveImageLocally(resultImageName) {
  const externalImageUrl = `${defaultComfyUIUrl}/view?filename=${resultImageName}&type=output`;
  console.log("开始保存图片到本地:");
  console.log("resultImageName 值:", resultImageName);
  console.log("resultImageName 类型:", typeof resultImageName);
  axios
    .post("/saveImage", resultImageName, {
      headers: { "Content-Type": "text/plain" }, // 明确指定 Content-Type
    }) // 将图片名发送到后端
    .then((response) => {
      console.log("Image saved on server:", response.data);
    })
    .catch(console.error);
}

// WebSocket 连接 websocketUrl = "ws://127.0.0.1:8188/ws?clientId=user001";
const socket = new WebSocket(L20websocketUrl);

socket.onopen = () => {
  console.log("WB连接成功.");
  socket.send("WB请求");
};

// 接收到消息时的回调函数
socket.onmessage = function (event) {
  // 将接收到的消息解析为JSON对象
  console.log("Message from server:", event.data);
  const messageData = JSON.parse(event.data);

  // 检查消息类型是否为 'execution_start'
  if (messageData.type === "execution_start") {
    // 如果是 'execution_start'，将计数器归一
    messageCount = 1;
  } else if (
    messageData.type !== "status" &&
    messageData.type !== "cup.queue" &&
    messageData.type !== "cup.diff" &&
    messageData.type !== "crystools.monitor"
  ) {
    // 否则，增加消息计数
    messageCount++;
    console.log("Message Count:", messageCount);
  }
  // 更新页面上的消息计数显示
  // document.getElementById("messageCount").innerText = messageCount;
  // 在页面上显示接收到的消息
  if (
    messageData.type !== "cup.queue" &&
    messageData.type !== "cup.diff" &&
    messageData.type !== "crystools.monitor"
  ) {
    const messageDiv = document.getElementById("messages");
    // messageDiv.innerHTML = <p>${event.data}</p>;
    console.log("Message received:", event.data);
  }

  // 检查消息类型是否为 "executed"
  if (messageData.type === "executed") {
    const images = messageData.data.output.images;
    if (images == null) {
      console.log("此时images为空");
    } else {
      console.log("此时的data", messageData);
      // console.log(`Image Name: ${images}`);
      // 遍历 images 列表，查找并更新 filename
      images.forEach((image) => {
        if (image == null) {
          return;
        }
        const resultImageName = image.filename;
        console.log("resultImageNameInWebsocket: " + resultImageName);
        loadAndSaveImage(resultImageName);
      });
    }
  }
};

socket.onclose = () => {
  console.log("WebSocket connection closed. Reconnecting...");
  setTimeout(connectWebSocket, 3000); // 3 秒后重连
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// 下载图片
function downloadImage() {
  const externalImage = document.getElementById("externalImage");
  const link = document.createElement("a");
  link.href = externalImage.src;
  link.download = "result.png";
  link.click();
}
