$(document).ready(function () {
  $("#slide-button").click(function () {
    $("#top-box").css("transform", "translateY(-100%)"); // 下滑动画
    $("#main-content").removeClass("hidden").addClass("visible"); // 显示主要内容
    $("#main-content").css("transform", "translateY(-100%)");
  });

  //   $(window).on("scroll", function () {
  //     if ($(this).scrollTop() > 50) {
  //       // 如果滚动超过50px
  //       $("#top-box").css("transform", "translateY(-100%)"); // 下滑动画
  //       $("#main-content").removeClass("hidden").addClass("visible");
  //       $("#main-content").css("transform", "translateY(-100%)"); // 显示主要内容
  //     } else {
  //       $("#top-box").css("transform", "translateY(0)"); // 重置动画
  //       $("#main-content").removeClass("visible").addClass("hidden");
  //       $("#main-content").css("transform", "translateY(100%)"); // 隐藏主要内容
  //     }
  //   });
});
