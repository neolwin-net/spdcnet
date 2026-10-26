(() => {
  "use strict";

  const INDEX_URL = "contents.json";
  const categories = ["Lab Writeups", "Networking Notes", "EVE-NG Images"];
  const state = { resources: [], filter: "all", query: "", sort: "newest" };
  const $ = (selector) => document.querySelector(selector);

  const grid = $("#resource-grid");
  const emptyState = $("#empty-state");
  const searchInput = $("#search-input");
  const sortSelect = $("#sort-select");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const navLinks = [...document.querySelectorAll("[data-category]")];

  $("#current-year").textContent = new Date().getFullYear();

  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "RESOURCE";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "RESOURCE";
    return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(date).toUpperCase();
  }

  function isPdf(resource) {
    const type = String(resource.type || "").toLowerCase();
    const file = String(resource.file || resource.url || "").toLowerCase();
    return type === "pdf" || file.split("?")[0].endsWith(".pdf");
  }

  function resourceUrl(resource) {
    const url = String(resource.file || resource.url || "").trim();
    if (!url) return "";
    if (/^(https?:|mailto:|#)/i.test(url)) return url;
    return url.replace(/^\.\//, "");
  }

  function iconMarkup(pdf) {
    return pdf
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V21H7z"/><path d="M14 3.5v4h4M9.5 13h5M9.5 16h5"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h5"/></svg>';
  }

  function updateCounts(resources) {
    const counts = {
      all: resources.length,
      pdf: resources.filter(isPdf).length,
      labs: resources.filter(r => r.category === "Lab Writeups").length,
      notes: resources.filter(r => r.category === "Networking Notes").length,
      images: resources.filter(r => r.category === "EVE-NG Images").length
    };
    $("#stat-total").textContent = counts.all;
    $("#stat-pdf").textContent = counts.pdf;
    $("#stat-labs").textContent = counts.labs;
    $("#stat-notes").textContent = counts.notes;
    $("#count-all").textContent = counts.all;
    $("#count-labs").textContent = counts.labs;
    $("#count-notes").textContent = counts.notes;
    $("#count-images").textContent = counts.images;
  }

  function cardMarkup(resource) {
    const title = safeText(resource.title || "Untitled resource");
    const category = safeText(resource.category || "Uncategorized");
    const description = safeText(resource.description || "Technical reference material.");
    const tags = Array.isArray(resource.tags) ? resource.tags.slice(0, 4) : [];
    const pdf = isPdf(resource);
    const href = resourceUrl(resource);
    const external = /^https?:/i.test(href);
    const action = href
      ? '<a class="card-link" href="' + safeText(href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' + (pdf ? "Open PDF" : "View resource") + ' <span aria-hidden="true">↗</span></a>'
      : '<span class="card-meta">COMING SOON</span>';
    const tagsMarkup = tags.map(tag => '<span class="tag">' + safeText(tag) + '</span>').join("");
    const type = pdf ? "PDF DOCUMENT" : safeText(String(resource.type || "REFERENCE").toUpperCase());
    return '<article class="resource-card glass"><div class="card-top"><span class="file-type"><span class="file-icon">' + iconMarkup(pdf) + '</span>' + type + '</span><time class="card-date">' + formatDate(resource.updated || resource.date) + '</time></div><div class="category-label">' + category + '</div><h3>' + title + '</h3><p>' + description + '</p><div class="tag-list">' + tagsMarkup + '</div><div class="card-bottom"><span class="card-meta">' + (resource.version ? safeText(resource.version) : (pdf ? "PDF RESOURCE" : "TECHNICAL RESOURCE")) + '</span>' + action + '</div></article>';
  }

  function visibleResources() {
    const q = state.query.trim().toLowerCase();
    const filtered = state.resources.filter(resource => {
      const categoryMatch = state.filter === "all" || resource.category === state.filter;
      const haystack = [resource.title, resource.description, resource.category, resource.type, ...(Array.isArray(resource.tags) ? resource.tags : [])].join(" ").toLowerCase();
      return categoryMatch && (!q || haystack.includes(q));
    });
    filtered.sort((a, b) => {
      if (state.sort === "title") return String(a.title || "").localeCompare(String(b.title || ""));
      if (state.sort === "category") return String(a.category || "").localeCompare(String(b.category || "")) || String(a.title || "").localeCompare(String(b.title || ""));
      return new Date(b.updated || b.date || 0) - new Date(a.updated || a.date || 0);
    });
    return filtered;
  }

  function render() {
    const results = visibleResources();
    grid.innerHTML = results.length
      ? results.map(cardMarkup).join("")
      : "";
    emptyState.hidden = results.length !== 0;
    grid.hidden = results.length === 0;
    $("#result-count").textContent = results.length + (results.length === 1 ? " RESOURCE" : " RESOURCES");
    filterButtons.forEach(button => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.category === state.filter || (state.filter === "all" && link.dataset.category === "all"));
    });
  }

  function setFilter(filter) {
    state.filter = filter;
    render();
    const url = new URL(window.location.href);
    if (filter === "all") url.hash = "home";
    else url.hash = "library";
    history.replaceState(null, "", url);
  }

  filterButtons.forEach(button => button.addEventListener("click", () => setFilter(button.dataset.filter)));
  navLinks.forEach(link => link.addEventListener("click", () => {
    const category = link.dataset.category;
    if (category) setFilter(category);
    const nav = $(".main-nav");
    nav.classList.remove("open");
    $("#mobile-menu").setAttribute("aria-expanded", "false");
  }));
  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    render();
  });
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    render();
  });
  $("#clear-filters").addEventListener("click", () => {
    state.query = "";
    searchInput.value = "";
    setFilter("all");
  });
  $("#mobile-menu").addEventListener("click", () => {
    const nav = $(".main-nav");
    const open = nav.classList.toggle("open");
    $("#mobile-menu").setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape") {
      searchInput.blur();
      $(".main-nav").classList.remove("open");
      $("#mobile-menu").setAttribute("aria-expanded", "false");
    }
  });

  fetch(INDEX_URL, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Could not load contents.json");
      return response.json();
    })
    .then(data => {
      const resources = Array.isArray(data) ? data : data.resources;
      if (!Array.isArray(resources)) throw new Error("The content index must contain a resources array.");
      state.resources = resources.filter(item => item && typeof item === "object" && item.title);
      updateCounts(state.resources);
      render();
    })
    .catch(error => {
      console.error(error);
      grid.hidden = false;
      grid.innerHTML = '<div class="loading-card glass">The resource index could not be loaded. Check that <code>contents.json</code> exists at the site root and contains valid JSON.</div>';
      $("#result-count").textContent = "INDEX UNAVAILABLE";
    });
})();