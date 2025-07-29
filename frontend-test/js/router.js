// Simple hash router
const routes = {};

function route(path, cb) {
  routes[path] = cb;
}

function router() {
  const hash = location.hash.replace('#', '') || '/dashboard';
  const cb = routes[hash] || routes['/404'];
  if (cb) cb();
}

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', router);
