import { getAccessToken, refreshAccessToken } from './auth';

export const fetchWithAuth = async (url, options = {}) => {
  let token = getAccessToken();

  if (!token) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('No valid token available');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (response.status === 403) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('Token refresh failed');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
  }

  return response;
};