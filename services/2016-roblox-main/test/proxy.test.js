jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    backend: {
      baseUrl: 'http://localhost:5000',
      proxyEnabled: true,
    },
  },
}));

import proxyHandler, { UrlUtilities } from "../pages/api/proxy";
import validateAndAddCookie from "../pages/api/validate-and-add-cookie";

describe('UrlUtilities.isSafe()', () => {
  it('allows paths on the configured first-party API origin', () => {
    expect(UrlUtilities.isSafe('http://localhost:5000/apisite/auth/v2/login')).toBe(true);
  });

  it('normalizes URL casing', () => {
    expect(UrlUtilities.isSafe('HTTP://LOCALHOST:5000/apisite/auth/v2/login')).toBe(true);
  });

  it('rejects different origins, ports, and lookalike hosts', () => {
    for (const url of [
      'https://localhost:5000/apisite/auth/v2/login',
      'http://localhost:5001/apisite/auth/v2/login',
      'http://127.0.0.1:5000/apisite/auth/v2/login',
      'http://localhost.example.test/apisite/auth/v2/login',
    ]) {
      expect(UrlUtilities.isSafe(url)).toBe(false);
    }
  });

  it('never allows Roblox or third-party origins', () => {
    for (const url of [
      'https://www.roblox.com/v2/login',
      'https://auth.roblox.com/v2/login',
      'https://api.example.test/v1/users',
    ]) {
      expect(UrlUtilities.isSafe(url)).toBe(false);
    }
  });

  it('rejects malformed URLs and embedded credentials', () => {
    expect(UrlUtilities.isSafe('not a url')).toBe(false);
    expect(UrlUtilities.isSafe('http://user@localhost:5000/path')).toBe(false);
  });
});

describe('proxy route', () => {
  it('rejects Roblox targets before reading or forwarding the request body', async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await proxyHandler({
      method: 'POST',
      query: { url: 'https://auth.roblox.com/v2/login' },
    }, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalled();
  });
});

describe('validate-and-add-cookie endpoint', () => {
  it('rejects cookie login without setting a session cookie', () => {
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    validateAndAddCookie({ method: 'POST' }, response);

    expect(response.status).toHaveBeenCalledWith(410);
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(response.setHeader).not.toHaveBeenCalledWith('Set-Cookie', expect.anything());
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
