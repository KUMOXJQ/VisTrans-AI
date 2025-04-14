function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file.type.startsWith("image/")) {
    alert("请上传一张图片");
    return;
  }

  const previewContainer = document.querySelector(".preview-container");
  const previewImage = document.getElementById("preview-image");
  const errorMessage = document.querySelector(".error-message");

  // 显示预览图片
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewContainer.style.display = "block";
    errorMessage.style.display = "none";
  };
  reader.readAsDataURL(file);

  // 隐藏文件输入
  // 注意：这里其实已经通过CSS隐藏了，但如果你需要动态控制，可以取消CSS中的display: none;
  // event.target.style.display = 'none';
}

// 如果你想要在页面加载时就隐藏文件输入，但保持可访问性（例如通过点击标签），
// 你可以保持HTML中的style="display: none;"，并在CSS中去掉它。
// 或者，你可以在JavaScript中添加以下代码来确保文件输入在DOM加载后就被隐藏：
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("image-upload");
  // 如果你确实需要在JS中隐藏它（尽管在HTML中已经隐藏了）
  // fileInput.style.display = 'none';
});
