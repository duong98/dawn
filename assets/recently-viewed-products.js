class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();
    this.section = this.dataset.section || ""; 
    this.maxItems = parseInt(this.dataset.maxItems || "20", 10);
    this.hasLoaded = false;
    this.observer = null;
    this.storedHandlesKey = "recentlyViewedProducts";
  }

  connectedCallback() {
    // save the current product handle automatically
    if (this.dataset.currentHandle) {
      this.saveProductHandle(this.dataset.currentHandle);
    }
    this.initObserver();
  }

  initObserver() {
    if (this.observer) this.observer.unobserve(this);

    this.observer = new IntersectionObserver(
      (entries, observer) => {
        const entry = entries[0];
        if (!entry.isIntersecting || this.hasLoaded) return;

        this.hasLoaded = true;
        observer.unobserve(this);
        this.loadProducts();
      },
      { rootMargin: "0px 0px 400px 0px" }
    );

    this.observer.observe(this);
  }

  saveProductHandle(handle) {
    if (!handle) return;

    let handles = JSON.parse(localStorage.getItem(this.storedHandlesKey) || "[]");

    // Remove handle if it exists, then add to start
    handles = handles.filter((h) => h !== handle);
    handles.unshift(handle);

    // Keep only latest `maxItems`
    handles = handles.slice(0, this.maxItems);

    localStorage.setItem(this.storedHandlesKey, JSON.stringify(handles));
  }

  getStoredHandles() {
    return JSON.parse(localStorage.getItem(this.storedHandlesKey) || "[]");
  }

  async loadProducts() {
    const handles = this.getStoredHandles();
    if (handles.length === 0) {
      // Fallback message
      this.innerHTML = `
        <div class="recently-viewed-empty">
          You haven't viewed any products yet.
        </div>
      `;
      return;
    }

    const query = handles.map((h) => `handle:${h}`).join(" OR ");
    const searchUrl = `${Shopify.routes.root}search?section_id=${this.section}&type=product&q=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await fetch(searchUrl);
      const text = await response.text();
      const html = document.createElement('div');
      html.innerHTML = text;
      const newContent = html.querySelector(`#viewed-products-${this.section}`);
      this.innerHTML = newContent.innerHTML;
      this.classList.remove('hidden');
    } catch (err) {
      console.error("Error loading recently viewed products:", err);
      this.innerHTML = `
        <div class="recently-viewed-error">
          Unable to load recently viewed products.
        </div>
      `;
    }
  }
}

// Register the custom element
customElements.define("recently-viewed-products", RecentlyViewedProducts);
