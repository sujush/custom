// app/layout.tsx

import './globals.css';

export const metadata = {
  title: '검사 대행 찾기',
  description: '세관 검사 대행 서비스 매칭 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
