'use client';

export const setTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const removeTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const checkAuth = () => {
  const token = getAccessToken();
  return !!token;
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      setTokens(accessToken, newRefreshToken);
      return accessToken;
    } else {
      removeTokens();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeTokens();
    return null;
  }
};