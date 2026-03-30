(function(){
  const buttons = document.querySelectorAll(".mode");
  const feedGrid = document.getElementById("feed");
  const overflowGrid = document.getElementById("feed-overflow");
  const loadMoreWrap = document.getElementById("feed-load-more");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const normalize = value => (value || "all").toString().trim().toLowerCase();
  const splitModes = node => {
    const attr = node.getAttribute("data-modes") || "";
    if(!attr) return [];
    return attr.split(",").map(m=>m.trim().toLowerCase()).filter(Boolean);
  };
  const emptyState = document.getElementById("feed-empty");
  let expanded = false;

  function getAllCards(){
    const main = feedGrid ? Array.from(feedGrid.querySelectorAll(".card")) : [];
    const overflow = overflowGrid ? Array.from(overflowGrid.querySelectorAll(".card")) : [];
    return { main, overflow, all: main.concat(overflow) };
  }

  function apply(mode){
    const activeMode = normalize(mode);
    document.documentElement.setAttribute("data-mode", activeMode);
    const { main, overflow, all } = getAllCards();
    let visibleMain = 0;
    let visibleOverflow = 0;
    main.forEach(c=>{
      const cardModes = splitModes(c);
      const match = activeMode === "all" || cardModes.includes(activeMode);
      c.style.display = match ? "" : "none";
      if(match) visibleMain++;
    });
    overflow.forEach(c=>{
      const cardModes = splitModes(c);
      const match = activeMode === "all" || cardModes.includes(activeMode);
      c.style.display = match ? "" : "none";
      if(match) visibleOverflow++;
    });
    const totalVisible = visibleMain + visibleOverflow;
    if(emptyState) emptyState.hidden = totalVisible > 0;
    // Show/hide load more button
    if(loadMoreWrap){
      if(expanded || visibleOverflow === 0){
        loadMoreWrap.hidden = true;
      } else {
        loadMoreWrap.hidden = false;
      }
    }
    buttons.forEach(b=>{
      const btnMode = normalize(b.dataset.mode);
      const isActive = btnMode === activeMode;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", isActive);
    });
  }

  // Load more handler
  if(loadMoreBtn){
    loadMoreBtn.addEventListener("click", ()=>{
      expanded = true;
      if(overflowGrid) overflowGrid.hidden = false;
      if(loadMoreWrap) loadMoreWrap.hidden = true;
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

// Nav scroll indicator for mobile
(function(){
  const tabs = document.querySelector(".menu.tabs");
  const navRight = document.querySelector(".nav-right");
  if(!tabs || !navRight) return;
  function check(){
    const canScroll = tabs.scrollWidth > tabs.clientWidth;
    const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 2;
    navRight.classList.toggle("has-scroll-right", canScroll && !atEnd);
  }
  tabs.addEventListener("scroll", check, {passive:true});
  window.addEventListener("resize", check, {passive:true});
  check();
})();
