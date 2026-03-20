/* Gallery / Slideshow */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".gallery-viewer").forEach((gallery) => {
    const slides = gallery.querySelectorAll(".gallery-slide");
    const thumbs = gallery.querySelectorAll(".gallery-thumb");
    const counter = gallery.querySelector(".gallery-counter");
    const prev = gallery.querySelector(".gallery-prev");
    const next = gallery.querySelector(".gallery-next");
    let current = 0;
    const total = slides.length;

    if (!total) return;

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      slides.forEach((s) => s.classList.remove("active"));
      thumbs.forEach((t) => t.classList.remove("active"));
      slides[current].classList.add("active");
      if (thumbs[current]) {
        thumbs[current].classList.add("active");
        thumbs[current].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
      if (counter) counter.textContent = `${current + 1} / ${total}`;
    }

    prev.addEventListener("click", () => goTo(current - 1));
    next.addEventListener("click", () => goTo(current + 1));
    thumbs.forEach((t) =>
      t.addEventListener("click", () => goTo(+t.dataset.index))
    );

    // Click main image to open lightbox
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (!img) return;
      img.addEventListener("click", () => {
        const lb = document.createElement("div");
        lb.className = "gallery-lightbox";
        lb.innerHTML = `<img src="${img.src}" alt="${img.alt || ""}">`;
        lb.addEventListener("click", () => lb.remove());
        document.body.appendChild(lb);
      });
    });

    // Keyboard navigation when gallery is in viewport
    document.addEventListener("keydown", (e) => {
      const rect = gallery.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "Escape") {
        const lb = document.querySelector(".gallery-lightbox");
        if (lb) lb.remove();
      }
    });

    // Initialize counter
    goTo(0);
  });
});
