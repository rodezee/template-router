class TemplateRouter extends HTMLElement {
  constructor() {
    super();
    this.routes = [];
    this._initialContent = "";
  }

  connectedCallback() {
    this._initialContent = this.innerHTML;
    this.init();
    
    window.addEventListener("popstate", () => this.render());
    
    this.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.href) {
        const url = new URL(link.href);
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
    const layoutTmpl = doc.querySelector('template#layout');
    this.layout = layoutTmpl ? layoutTmpl.innerHTML : "{{ content }}";

    const routesTmpl = doc.querySelector('template#routes');
    if (routesTmpl) {
      this.routes = Array.from(routesTmpl.content.querySelectorAll('template[path]')).map(tmpl => ({
        path: tmpl.getAttribute('path'),
        title: tmpl.getAttribute('title') || 'Home',
        template: tmpl.innerHTML,
        regex: this.pathToRegex(tmpl.getAttribute('path'))
      }));
    }
  }

  pathToRegex(path) {
    const pattern = path.replace(/:(\w+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  interpolate(str, params) {
    // Flexible regex for {{ key }} or {{key}}
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
    } else {
      this.innerHTML = `<main class="container"><h1>404</h1><a href="/">Home</a></main>`;
    }
  }
}

customElements.define("template-router", TemplateRouter);
