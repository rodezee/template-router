class TemplateRouter extends HTMLElement {
  constructor() {
    super();
    this.routes = [];
    this._initialContent = "";
  }

  connectedCallback() {
    // Save original templates before they are cleared by the first render
    this._initialContent = this.innerHTML;
    this.init();
    
    // Global navigation listeners
    window.addEventListener("popstate", () => this.render());
    
    this.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.href) {
        const url = new URL(link.href);
        // Only intercept internal links
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
    
    // 1. Map the Layout
    const layoutTmpl = doc.querySelector('template#tr-layout');
    this.layout = layoutTmpl ? layoutTmpl.innerHTML : "{{ content }}";

    // 2. Map the Routes
    const routesTmpl = doc.querySelector('template#tr-routes');
    if (routesTmpl) {
      // We use .content to reach inside the nested templates
      const routeElements = routesTmpl.content.querySelectorAll('template[path]');
      this.routes = Array.from(routeElements).map(tmpl => ({
        path: tmpl.getAttribute('path'),
        title: tmpl.getAttribute('title') || 'Home',
        template: tmpl.innerHTML,
        regex: this.pathToRegex(tmpl.getAttribute('path'))
      }));
    }
  }

  pathToRegex(path) {
    // Converts "/profile/:name" into a regex with a named capture group
    const pattern = path.replace(/:(\w+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  interpolate(str, params) {
    // Replaces {{ key }} or {{key}} with values from params object
    return str.replace(/{{\s*(\w+)\s*}}/g, (original, key) => {
      return Object.hasOwn(params, key) ? params[key] : original;
    });
  }

  render() {
    const path = window.location.pathname;
    let match = {};

    const activeRoute = this.routes.find(r => {
      const result = path.match(r.regex);
      if (result) {
        match = result.groups || {};
        return true;
      }
      return false;
    });

    if (activeRoute) {
      document.title = activeRoute.title;
      const contentHtml = this.interpolate(activeRoute.template, match);

      this.innerHTML = this.interpolate(this.layout, {
        ...match,
        content: contentHtml,
        title: activeRoute.title
      });

      // AUTO-SCOPING SCRIPT INJECTION
      this.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");

        // Copy attributes (like src if you use it)
        Array.from(oldScript.attributes).forEach(attr => 
          newScript.setAttribute(attr.name, attr.value)
        );

        // THE MAGIC: Wrap the code in an IIFE automatically
        const wrappedCode = `(function() { 
          ${oldScript.innerHTML} 
        })();`;

        newScript.appendChild(document.createTextNode(wrappedCode));

        // Replace the old non-executed script with the new wrapped one
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    } else {
      this.innerHTML = `<main class="container"><h1>404</h1><a href="/">Home</a></main>`;
    }
  }
}

customElements.define("template-router", TemplateRouter);
