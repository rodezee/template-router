
# ➤ Template Router

A lightweight, zero-dependency, declarative SPA (Single Page Application) router built entirely with **Native Web Components** and **HTML5 Templates**.

No build steps. No `npm install`. No complex JavaScript configuration. Just pure HTML.

## ✨ Features

-   **Zero Dependencies:** 100% Vanilla JavaScript.
    
-   **Declarative Routing:** Define your routes and layouts directly in your HTML using `<template>` tags.
    
-   **Dynamic Parameters:** Support for named URL parameters (e.g., `/profile/:username`).
    
-   **Layout Support:** Define a global site wrapper with `{{ title }}` and `{{ content }}` slots.
    
-   **SEO Friendly:** Automatically updates `document.title` on every route change.
    
-   **Painless Navigation:** Intercepts internal links automatically for a smooth SPA experience.
    
-   **Template-Safe:** Uses `{{ key }}` syntax to avoid collisions with CSS/JS braces.
    

----------

## 🚀 CDN

Simply include this in your index.html and you are ready to go!

```html
<script type="module" src="https://esm.sh/gh/rodezee/template-router"></script>
```

## 📦 Quick Start

### 1. Create your `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <title>My App</title>
    <script type="module" src="https://esm.sh/gh/rodezee/template-router"></script>
  </head>
  <body>
    <template-router>
      <template id="tr-routes">
        <template path="/" title="Home">
          <h1>Welcome Home</h1>
        </template>
        
        <template path="/hello/:name" title="Greeting">
          <h1>Hello, {{ name }}!</h1>
        </template>
      </template>

      <template id="tr-layout">
        <nav>
          <a href="/">Home</a>
          <a href="/hello/World">Say Hi</a>
        </nav>
        <main>
          {{ content }}
        </main>
      </template>
    </template-router>
  </body>
</html>

```

### 2. No CDN then add `template-router.js`

If you don't want to use the CDN method, you can copy the source code into a file named `template-router.js`. The router will automatically initialize when the `<template-router>` tag is parsed.

----------

## 🛠 How it Works

The Template Router uses the **Shadow-DOM-less Custom Elements API** to parse your templates before they are rendered.

### 1. Route Matching

Routes are converted into Regular Expressions. When a URL change is detected, the router finds the matching `<template>`:

-   Path: `/profile/:first/:last`
    
-   URL: `/profile/John/Doe`
    
-   Result: `{{ first }}` becomes "John", `{{ last }}` becomes "Doe".
    

### 2. Two-Step Interpolation

1.  **Content Step:** The variables in the route template are replaced with URL parameters.
    
2.  **Layout Step:** The resulting HTML is injected into the `{{ content }}` slot of your layout, and the `{{ title }}` is updated.
    

### 3. Navigation Interception

The router listens for clicks on `<a>` tags. If the link is internal (same origin), it prevents a full page reload and updates the browser history using `history.pushState()`.

----------

## 📖 API Reference

### `<template-router>`

The main wrapper element. It must contain two specific templates.

#### `<template id="routes">`

Contains nested `<template>` tags representing pages.

-   **`path` attribute**: The URL path (e.g., `/`, `/about`, `/user/:id`).
    
-   **`title` attribute**: The text used for `document.title` and the `{{ title }}` variable.
    

#### `<template id="layout">`

Defines the "shell" of your application.

-   **`{{ content }}`**: Mandatory placeholder for the active route's content.
    
-   **`{{ title }}`**: Optional placeholder for the current route's title.
    

----------

## 🚀 Deployment

Since this is a Single Page Application (SPA) using the `History API`, your web server must be configured to serve `index.html` for all requests that don't match a static file.

### Example for Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

```

### Example for Netlify:
Simply include a file in the root of your repository, named:
_redirects
```
/*    index.html    200

```

----------

## 🤝 Contributing

Feel free to fork, submit PRs, or open issues!

## 📜 License

MIT

