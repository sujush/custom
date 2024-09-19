// app/layout.tsx

import './globals.css';

export const metadata = {
  title: '세관 검사 대행자 찾기',
  description: '세관 검사 대행 서비스 매칭 플랫폼',
};

async function getUserInfo() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      credentials: 'include', // 쿠키를 포함하여 사용자 정보를 가져옵니다.
    });
    if (response.ok) {
      const data = await response.json();
      return data.nickname;
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error);
  }
  return ''; // 오류 발생 시 빈 문자열 반환
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nickname = await getUserInfo(); // 서버에서 사용자 정보를 가져옵니다.

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
