import axios from 'axios';
import config from '../lib/config';
let _csrf = '';

const getVercelOrigin = () => {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (typeof domain !== 'string' || domain.trim() === '') return '';
  const normalizedDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return normalizedDomain ? `https://${normalizedDomain}` : '';
};

const getBaseUrl = () => {
  const backend = config.publicRuntimeConfig.backend;
  if (backend.sameOriginBackend && typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (typeof backend.baseUrl === 'string' && backend.baseUrl.trim()) {
    return backend.baseUrl.replace(/\/+$/, '');
  }
  return backend.sameOriginBackend ? getVercelOrigin() : '';
};

const getBackendUrl = url => {
  const rawUrl = String(url || '');
  const backend = config.publicRuntimeConfig.backend;
  const isAbsoluteUrl = /^https?:\/\//i.test(rawUrl);

  if (backend.sameOriginBackend && typeof window !== 'undefined') {
    if (rawUrl.startsWith('//')) return rawUrl;
    if (isAbsoluteUrl) {
      const target = new URL(rawUrl);
      const isLocalhost = target.hostname === 'localhost' || target.hostname === '127.0.0.1';
      if (isLocalhost || target.origin === window.location.origin) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
      return rawUrl;
    }
    return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  }

  if (isAbsoluteUrl || rawUrl.startsWith('//')) return rawUrl;
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  const baseUrl = getBaseUrl();
  if (!baseUrl) return path;
  return new URL(path, `${baseUrl.replace(/\/+$/, '')}/`).toString();
};

const getFullUrl = (apiSite, fullUrl) => {
  const apiUrl = config.publicRuntimeConfig.backend.apiFormat.replace(/\{0\}/g, apiSite).replace(/\{1\}/g, fullUrl);
  return getBackendUrl(apiUrl);
}

const getUrlWithProxy = (url) => {
  if (config.publicRuntimeConfig.backend.proxyEnabled && typeof window !== 'undefined') {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

const request = async (method, url, data, csrfRetries = 0) => {
  const isBrowser = typeof window !== 'undefined';
  try {
    let headers = {
      'x-csrf-token': _csrf,
    }
    if (!isBrowser) {
      // Auth header, if required
      const authHeaderValue = config.serverRuntimeConfig.backend.authorization;
      if (typeof authHeaderValue === 'string')
        headers[config.serverRuntimeConfig.backend.authorizationHeader || 'authorization'] = authHeaderValue;
      // Custom user agent
      headers['user-agent'] = 'Roblox2016/1.0';
    }
    const result = await axios.request({
      method,
      url: getUrlWithProxy(url),
      data: data,
      headers: headers,
      maxRedirects: 0,
    });
    return result;
  } catch (e) {
    if (e.response) {
      let resp = e.response;
      if (resp.status === 403 && resp.headers['x-csrf-token'] && csrfRetries < 3) {
        _csrf = resp.headers['x-csrf-token'];
        return await request(method, url, data, csrfRetries + 1);
      }
    }
    if (isBrowser) {
      // attempt to make errors easier to diagnose
      if (e.response) {
        // check for regular
        if (e.response.data && e.response.data.errors && e.response.data.errors.length) {
          let err = e.response.data.errors[0]
          e.message = e.message + ': ' + (err.code + ': ' + err.message);
        }
      }
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
}

export default request;

export {
  getFullUrl,
  getBackendUrl,
  getBaseUrl,
  getUrlWithProxy,
}
