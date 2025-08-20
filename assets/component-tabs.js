class ProductTabs extends HTMLElement {
  connectedCallback() {
    this.tabButtons = this.querySelectorAll("[data-tab-button]");
    this.tabContents = this.querySelectorAll("[data-tab-content]");

    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tabButton));
    });
  }

  switchTab(target) {
    // Reset all buttons
    this.tabButtons.forEach((b) => {
      b.classList.remove("button--primary");
      b.classList.add("button--secondary");
    });

    // Reset all contents
    this.tabContents.forEach((c) => c.classList.remove("is-active"));

    // Activate clicked button
    const activeButton = this.querySelector(`[data-tab-button="${target}"]`);
    activeButton.classList.remove("button--secondary");
    activeButton.classList.add("button--primary");

    // Show target content
    const activePanel = this.querySelector(`[data-tab-content="${target}"]`);
    if (activePanel) activePanel.classList.add("is-active");
  }
}

customElements.define("product-tabs", ProductTabs);
