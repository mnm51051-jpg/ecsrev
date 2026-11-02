import axios from 'axios';
import getConfig from 'next/config';
import { getBaseUrl } from '../../lib/request';

const allowedMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
const requestHeaderNames = [
  'accept',
  'content-type',
  'cookie',
  'if-match',
  'if-none-match',
  'origin',
  'range',
  'referer',
  'user-agent',
  'x-csrf-token',
  'x-requested-with',
];
const responseHeaderNames = new Set([
  'accept-ranges',
  'cache-control',
  'content-disposition',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
  'retry-after',
  'set-cookie',
  'x-csrf-token',
]);

const getConfiguredOrigin = value => {
  try {
    const configuredUrl = new URL(value);
    return configuredUrl.protocol === 'http:' || configuredUrl.protocol === 'https:'
      ? configuredUrl.origin
      : null;
  } catch (error) {
    return null;
  }
};

const configuredOrigin = getConfiguredOrigin(getBaseUrl());
const isRobloxHost = hostname => {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');
  return normalizedHostname === 'roblox.com' || normalizedHostname.endsWith('.roblox.com');
};

const UrlUtilities = {
  isSafe: rawUrl => {
    if (typeof rawUrl !== 'string' || !configuredOrigin) return false;

    try {
      const targetUrl = new URL(rawUrl);
      return targetUrl.origin === configuredOrigin &&
        !targetUrl.username &&
        !targetUrl.password &&
        !isRobloxHost(targetUrl.hostname);
    } catch (error) {
      return false;
    }
  },
};

const actualHandler = async (req, res) => {
  try {
    const runtimeConfig = getConfig();
    const serverBackend = runtimeConfig.serverRuntimeConfig?.backend || {};
    const requestHeaders = {};

    for (const headerName of requestHeaderNames) {
      const headerValue = req.headers[headerName];
      if (typeof headerValue !== 'undefined') requestHeaders[headerName] = headerValue;
    }

    const authHeaderValue = serverBackend.authorization;
    if (typeof authHeaderValue === 'string' && authHeaderValue.trim()) {
      const authHeaderName = serverBackend.authorizationHeader || 'authorization';
      requestHeaders[authHeaderName] = authHeaderValue;
    }

    const result = await axios.request({
      method: req.method,
      url: req.query.url,
      data: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      maxRedirects: 0,
      responseType: 'arraybuffer',
      headers: requestHeaders,
      validateStatus: () => true,
    });

    for (const [headerName, headerValue] of Object.entries(result.headers)) {
      if (responseHeaderNames.has(headerName.toLowerCase())) {
        res.setHeader(headerName, headerValue);
      }
    }

    return res.status(result.status).send(result.data);
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: 'The configured first-party API is unavailable.',
    });
  }
};

export default async function handler(req, res) {
  const backendConfig = getConfig().publicRuntimeConfig?.backend || {};
  if (backendConfig.proxyEnabled !== true) {
    return res.status(404).json({ success: false });
  }

  if (!allowedMethods.has(req.method)) {
    res.setHeader('Allow', Array.from(allowedMethods).join(', '));
    return res.status(405).json({ success: false });
  }

  if (!UrlUtilities.isSafe(req.query?.url)) {
    return res.status(403).json({ success: false });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    req.body = Buffer.concat(chunks);
    return await actualHandler(req, res);
  } catch (error) {
    return res.status(400).json({ success: false });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export {
  UrlUtilities,
};
