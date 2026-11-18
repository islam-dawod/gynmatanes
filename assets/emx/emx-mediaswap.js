/* =========================================================
   EMX media-swap — image <-> Vimeo video
   - image first; auto-switch to video when scrolled into view
   - arrow button toggles manually (locks auto afterwards)
   ========================================================= */
(function () {
  "use strict";

  function initOne(box) {
    if (box.__emxInit) return; box.__emxInit = true;

    var id = box.getAttribute("data-vimeo-id");
    var h = box.getAttribute("data-vimeo-h") || "";
    var imgWrap = box.querySelector(".emx-ms-img");
    var img = imgWrap && imgWrap.querySelector("img");
    var vid = box.querySelector(".emx-ms-video");
    var btn = box.querySelector(".emx-ms-toggle");
    var loaded = false, userLock = false;

    function syncRadius() {
      if (!img) return;
      var r = getComputedStyle(img).borderRadius;
      if (r && r !== "0px") vid.style.borderRadius = r;
    }

    function loadVideo() {
      if (loaded) return;
      var src = "https://player.vimeo.com/video/" + id + "?h=" + h +
        "&autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&dnt=1&playsinline=1";
      var f = document.createElement("iframe");
      f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("title", "ד\"ר עמאד מטאנס");
      f.src = src;
      vid.appendChild(f);
      loaded = true;
    }

    function showVideo() { syncRadius(); loadVideo(); box.classList.add("emx-show-video"); }

    function showImage() {
      box.classList.remove("emx-show-video");
      var f = vid.querySelector("iframe");      // remove to stop playback/audio
      if (f) { vid.removeChild(f); loaded = false; }
    }

    if (btn) {
      btn.addEventListener("click", function () {
        userLock = true;
        if (box.classList.contains("emx-show-video")) showImage(); else showVideo();
      });
    }

    if (img) {
      if (img.complete) syncRadius();
      else img.addEventListener("load", syncRadius);
    }

    // auto-switch to video once the block scrolls well into view
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5 && !userLock &&
              !box.classList.contains("emx-show-video")) {
            showVideo();
          }
        });
      }, { threshold: [0, 0.5, 1] });
      io.observe(box);
    }
  }

  function relocatePortrait(box) {
    if (!box || box.querySelector(".emx-ms-portrait")) return;
    var img = document.querySelector('img[src*="marcpe"]');
    if (!img) return;
    var origWidget = img.closest(".elementor-widget");
    var holder = document.createElement("div");
    holder.className = "emx-ms-portrait";
    holder.appendChild(img);                 // move the portrait into the media box
    box.appendChild(holder);
    if (origWidget && !origWidget.querySelector("img")) origWidget.style.display = "none";
  }

  function boot() {
    var boxes = document.querySelectorAll(".emx-mediaswap");
    boxes.forEach(initOne);
    if (boxes[0]) relocatePortrait(boxes[0]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
