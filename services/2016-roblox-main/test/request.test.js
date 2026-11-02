/** @jest-environment node */

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: { backend: {} },
  publicRuntimeConfig: {
    backend: {
      sameOriginBackend: true,
      proxyEnabled: false,
      baseUrl: 'https://ecsrev.example.test',
      apiFormat: '/apisite/{0}{1}',
    },
  },
}));

import { getBackendUrl, getBaseUrl, getFullUrl, getUrlWithProxy } from '../lib/request';

const originalWindow = global.window;

afterEach(() => {
  if (typeof originalWindow === 'undefined') {
    delete global.window;
  } else {
    global.window = originalWindow;
  }
});

describe('same-origin backend URLs', () => {
  it('resolves server-side requests against the configured site origin', () => {
    delete global.window;

    expect(getBaseUrl()).toBe('https://ecsrev.example.test');
    expect(getFullUrl('users', '/v1/users')).toBe('https://ecsrev.example.test/apisite/users/v1/users');
  });

  it('keeps browser URLs relative to the active site', () => {
    global.window = { location: { origin: 'https://preview.example.test' } };

    expect(getBaseUrl()).toBe('https://preview.example.test');
    expect(getBackendUrl('/auth/application')).toBe('/auth/application');
    expect(getBackendUrl('http://localhost:5000/auth/application')).toBe('/auth/application');

    const apiUrl = getFullUrl('users', '/v1/users');
    expect(apiUrl).toBe('/apisite/users/v1/users');
    expect(getUrlWithProxy(apiUrl)).toBe(apiUrl);
  });
});
