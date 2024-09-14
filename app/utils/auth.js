'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.customs-inspection.net';

// localStorage 접근 전 window 객체 확인
const isClient = typeof window !== 'undefined';

export const setTokens = (accessToken, refreshToken) => {
  if (isClient) {
    console.log('Storing tokens:', accessToken, refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = () => {
  return isClient ? localStorage.getItem('accessToken') : null;
};

export const getRefreshToken = () => {
  return isClient ? localStorage.getItem('refreshToken') : null;
};

export const removeTokens = () => {
  if (isClient) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const checkAuth = () => {
  const token = getAccessToken();
  return !!token;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return accessToken;
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

export const logout = () => {
  removeTokens();
  // 필요한 경우 추가적인 로그아웃 로직을 여기에 구현
};