const API_STORAGE_KEY = 'inventariopro_api_url';

export function defaultApiUrl() {
  // The existing REST examples call /productos directly on the site host.
  return window.location.origin.replace(/\/$/, '');
}

export function getApiUrl() {
  const saved = (localStorage.getItem(API_STORAGE_KEY) || '').replace(/\/$/, '');
  const previousDefault = `${window.location.origin.replace(/\/$/, '')}/api/public`;
  if (saved === previousDefault) {
    localStorage.setItem(API_STORAGE_KEY, defaultApiUrl());
    return defaultApiUrl();
  }
  return saved || defaultApiUrl();
}

export function setApiUrl(url) {
  const cleanUrl = url.trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(cleanUrl)) {
    throw new Error('La URL debe comenzar con http:// o https://');
  }
  localStorage.setItem(API_STORAGE_KEY, cleanUrl);
  return cleanUrl;
}

export async function apiRequest(endpoint, { method = 'GET', body } = {}) {
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const configuredUrl = getApiUrl();
  const bases = [configuredUrl];

  // GET requests are safe to retry. Try common deployment layouts if the
  // saved URL is stale: API at the website root, /api/public, or sibling folder.
  if (method === 'GET') {
    bases.push(
      window.location.origin,
      new URL('/api/public', window.location.href).href.replace(/\/$/, ''),
      new URL('../api/public', window.location.href).href.replace(/\/$/, ''),
      `${window.location.origin.replace(/\/$/, '')}/index.php`,
      new URL('/api/public/index.php', window.location.href).href.replace(/\/$/, ''),
      new URL('../api/public/index.php', window.location.href).href.replace(/\/$/, '')
    );
    if (window.location.hostname === 'www.sistemainventario.com') {
      bases.push('http://api.sistemainventario');
    }
  }
  const candidates = [...new Set(bases.map(base => base.replace(/\/$/, '')))];
  const failures = [];

  for (const base of candidates) {
    const url = base.endsWith('/index.php')
      ? `${base}?route=${encodeURIComponent(cleanEndpoint)}`
      : `${base}/${cleanEndpoint}`;
    let response;
    try {
      response = await fetch(url, {
        method,
        headers: body === undefined ? { Accept: 'application/json' } : {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      if (method !== 'GET') {
        let crossOrigin = false;
        try { crossOrigin = new URL(url).origin !== window.location.origin; } catch { /* reported below */ }
        if (crossOrigin) {
          throw new Error(`El navegador bloqueó ${method} a ${url}. Si las consultas GET sí funcionan, la API debe aceptar OPTIONS y devolver Access-Control-Allow-Origin, Access-Control-Allow-Methods y Access-Control-Allow-Headers. Actualiza api/public/index.php en el servidor.`);
        }
      }
      failures.push(`${url} (sin respuesta)`);
      continue;
    }

    const text = await response.text();
    let result;
    try { result = text ? JSON.parse(text) : null; }
    catch {
      failures.push(`${url} (HTTP ${response.status}, respuesta no JSON)`);
      continue;
    }

    if (response.ok) {
      if (method === 'GET' && base !== configuredUrl) localStorage.setItem(API_STORAGE_KEY, base);
      return result;
    }

    const message = [result?.message || result?.error, result?.detail].filter(Boolean).join(' — ') || `Error HTTP ${response.status}`;
    const fields = Array.isArray(result?.fields) ? `: ${result.fields.join(', ')}` : '';
    if (method === 'GET' && response.status === 404) {
      failures.push(`${url} (${message})`);
      continue;
    }
    throw new Error(`${message}${fields}`);
  }

  throw new Error(`No encontré el endpoint ${cleanEndpoint}. Probé: ${failures.join(' · ')}. En Configuración puedes fijar la URL base correcta de la API.`);
}

// Compatibility for the original small user-list module.
export const api = { get: endpoint => apiRequest(endpoint) };
export { API_STORAGE_KEY };
