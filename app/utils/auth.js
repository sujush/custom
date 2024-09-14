'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.customs-inspection.net';

// localStorage 접근 전 window 객체 확인
const isClient = typeof window !== 'undefined';

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (isClient) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = (): string | null => {
  return isClient ? localStorage.getItem('accessToken') : null;
};

export const getRefreshToken = (): string | null => {
  return isClient ? localStorage.getItem('refreshToken') : null;
};

export const removeTokens = () => {
  if (isClient) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const checkAuth = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      } else {
        console.error('Invalid response format from refresh token endpoint');
        removeTokens();
        return null;
      }
    } else {
      console.error('Failed to refresh token:', response.status, await response.text());
      removeTokens();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeTokens();
    return null;
  }
};

export const logout = () => {
  removeTokens();
  // 필요한 경우 추가적인 로그아웃 로직을 여기에 구현
};