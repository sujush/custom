"use client"

import './globals.css';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/app/utils/api';

export const metadata = {
  title: '세관 검사 대행자 찾기',
  description: '세관 검사 대행 서비스 매칭 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/user`);
        if (response.ok) {
          const data = await response.json();
          setNickname(data.nickname);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* 헤더 부분에 닉네임 표시 */}
        <header className="flex justify-between p-4 bg-gray-200">
          <div className="text-lg font-bold">세관 검사 대행자 찾기</div>
          <div className="text-sm">
            {nickname ? `안녕하세요, ${nickname}님` : ''}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
