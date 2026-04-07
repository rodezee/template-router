class TemplateRouter extends HTMLElement {
  constructor() {
    super();
    this.routes = [];
    this.layout = "";
    this._initialContent = "";
  }

  connectedCallback() {
    // Store the template definitions before they get cleared by rendering
    this._initialContent = this.innerHTML;
    this.init();
    
    // Global event listeners
    window.addEventListener("popstate", () => this.render());
    
    this.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.href) {
        const url = new URL(link.href);
        // Only intercept if it's the same domain
        if (url.origin === window.location.origin) {
          e.preventDefault();
          if (window.location.pathname !== url.pathname) {
            history.pushState(null, "", url.pathname);
            this.render();
          }
        }
      }
    });

    this.render();
  }

  init() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this._initialContent, 'text/html');

    // 1. Get Layout Template
    const layoutTmpl = doc.querySelector('template#layout');
    this.layout = layoutTmpl ? layoutTmpl.innerHTML : "{content}";

    // 2. Map Routes
    const routesTmpl = doc.querySelector('template#routes');
    if (routesTmpl) {
      // Access .content for nested templates
      const routeElements = routesTmpl.content.querySelectorAll('template[path]');
      this.routes = Array.from(routeElements).map(tmpl => ({
        path: tmpl.getAttribute('path'),
        title: tmpl.getAttribute('title') || 'Untitled',
        template: tmpl.innerHTML,
        regex: this.pathToRegex(tmpl.getAttribute('path'))
      }));
    }
  }

  pathToRegex(path) {
    // Converts "/path/:param" to a regex with named capture groups
    const pattern = path.replace(/:(\w+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  interpolate(str, params) {
    return str.replace(/{(\w+)}/g, (original, key) => {
      // If the key exists in our params (even if it's empty string or 0), use it.
      // Otherwise, return the original {key} string so it doesn't break code blocks.
      return Object.hasOwn(params, key) ? params[key] : original;
    });
  }

  render() {
    const path = window.location.pathname;
    let match = null;
    let activeRoute = null;

    for (const route of this.routes) {
      const result = path.match(route.regex);
      if (result) {
        match = result.groups || {};
        activeRoute = route;
        break;
      }
    }

    if (activeRoute) {
      document.title = activeRoute.title;
      
      // Step 1: Fill route-specific variables
      const routeContent = this.interpolate(activeRoute.template, match);
      
      // Step 2: Fill layout variables (content, title, and params)
      this.innerHTML = this.interpolate(this.layout, {
        ...match,
        content: routeContent,
        title: activeRoute.title
      });
    } else {
      this.innerHTML = `<main class="container"><h1>404</h1><p>Page not found.</p><a href="/">Go Home</a></main>`;
    }
  }
}

// Define the custom element as template-router
customElements.define("template-router", TemplateRouter);
