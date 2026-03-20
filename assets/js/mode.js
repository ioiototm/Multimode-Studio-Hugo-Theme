(function(){
  const buttons = document.querySelectorAll(".mode");
  const cards = document.querySelectorAll(".card");
  const normalize = value => (value || "all").toString().trim().toLowerCase();
  const splitModes = node => {
    const attr = node.getAttribute("data-modes") || "";
    if(!attr) return [];
    return attr.split(",").map(m=>m.trim().toLowerCase()).filter(Boolean);
  };
  const emptyState = document.getElementById("feed-empty");
  function apply(mode){
    const activeMode = normalize(mode);
    document.documentElement.setAttribute("data-mode", activeMode);
    let visible = 0;
    cards.forEach(c=>{
      const cardModes = splitModes(c);
      const match = activeMode === "all" || cardModes.includes(activeMode);
      c.style.display = match ? "" : "none";
      if(match) visible++;
    });
    if(emptyState) emptyState.hidden = visible > 0;
    buttons.forEach(b=>{
      const btnMode = normalize(b.dataset.mode);
      const isActive = btnMode === activeMode;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", isActive);
    });
  }
  const start = normalize(new URLSearchParams(location.search).get("mode"));
  apply(start);
  buttons.forEach(b=> b.addEventListener("click", ()=>{
    const m = normalize(b.dataset.mode);
    const url = new URL(location);
    url.searchParams.set("mode", m);
    history.replaceState(null, "", url);
    apply(m);
    
    // Scroll to feed if the button is in the hero section
    if (b.closest('.hero-tags')) {
        const feed = document.getElementById('feed');
        if (feed) {
            setTimeout(() => {
                const yOffset = -80; // Offset for sticky nav
                const y = feed.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }, 50);
        }
    }
  }));
})();

(function(){
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  if(!toggle) return;

  const KEY = "multimode-theme";
  const media = window.matchMedia("(prefers-color-scheme: light)");

  const syncPrefAttr = ()=> root.setAttribute("data-prefers", media.matches ? "light" : "dark");
  syncPrefAttr();
  const handleSchemeChange = event=>{
    syncPrefAttr();
    if(!localStorage.getItem(KEY)){
      root.removeAttribute("data-theme");
      updateToggle(event.matches ? "light" : "dark");
    }
  };
  if(media.addEventListener) media.addEventListener("change", handleSchemeChange);
  else if(media.addListener) media.addListener(handleSchemeChange);

  function updateToggle(reference){
    const current = root.dataset.theme || reference;
    toggle.dataset.theme = current;
    toggle.setAttribute("aria-pressed", current === "light");
  }

  function applyTheme(theme){
    if(theme){
      root.dataset.theme = theme;
      localStorage.setItem(KEY, theme);
    } else {
      root.removeAttribute("data-theme");
      localStorage.removeItem(KEY);
    }
    updateToggle(media.matches ? "light" : "dark");
  }

  const stored = localStorage.getItem(KEY);
  if(stored){
    applyTheme(stored);
  } else {
    root.removeAttribute("data-theme");
    updateToggle(media.matches ? "light" : "dark");
  }

  toggle.addEventListener("click", ()=>{
    const reference = root.dataset.theme || (media.matches ? "light" : "dark");
    const next = reference === "light" ? "dark" : "light";
    applyTheme(next);
  });
})();
