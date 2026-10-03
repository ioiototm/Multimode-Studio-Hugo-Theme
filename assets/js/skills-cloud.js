(function () {
  document.querySelectorAll(".skills-cloud-section").forEach(function (section) {
    var cloud = section.querySelector(".skills-cloud");
    // reshuffle on every page load (Hugo's build-time shuffle is the no-JS fallback)
    var items = Array.prototype.slice.call(cloud.children);
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    items.forEach(function (li) { cloud.appendChild(li); });
    var out = section.querySelector(".skill-readout-text");
    var filters = section.querySelectorAll(".skill-filter");
    var idle = out.textContent;
    var pinned = null;

    function describe(btn) {
      var name = btn.querySelector(".skill-name").textContent;
      var modes = btn.dataset.modes.split(" ").join(" + ");
      var text = name + " // " + modes + " // " + btn.dataset.levelLabel;
      if (btn.dataset.note) text += " // " + btn.dataset.note;
      return text;
    }
    function show(btn) { out.textContent = btn ? describe(btn) : idle; }

    cloud.querySelectorAll(".skill-word").forEach(function (btn) {
      btn.addEventListener("mouseenter", function () { show(btn); });
      btn.addEventListener("focus", function () { show(btn); });
      btn.addEventListener("mouseleave", function () { show(pinned); });
      btn.addEventListener("blur", function () { show(pinned); });
      btn.addEventListener("click", function () {
        if (pinned) pinned.classList.remove("pinned");
        pinned = pinned === btn ? null : btn;
        if (pinned) pinned.classList.add("pinned");
        show(pinned);
      });
    });

    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var mode = f.dataset.mode;
        filters.forEach(function (o) { o.setAttribute("aria-pressed", o === f ? "true" : "false"); });
        cloud.dataset.filter = mode;
        cloud.querySelectorAll(".skill-word").forEach(function (btn) {
          var match = mode === "all" || btn.dataset.modes.split(" ").indexOf(mode) !== -1;
          btn.classList.toggle("dim", !match);
        });
      });
    });
  });
})();
