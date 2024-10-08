'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { checkAuth, removeTokens } from '@/app/utils/auth';

interface WarehouseData {
  warehouse: string;
  time: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.customs-inspection.net';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availableWarehouses, setAvailableWarehouses] = useState<WarehouseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(checkAuth());
    fetchAvailableWarehouses();
  }, []);

  const fetchAvailableWarehouses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/available-warehouses`);
      if (!response.ok) {
        throw new Error('Failed to fetch available warehouses');
      }
      const data: WarehouseData[] = await response.json();
      console.log('Fetched data:', data); // 디버깅을 위한 로그
      setAvailableWarehouses(data);
    } catch (error: unknown) {
      console.error('Error fetching available warehouses:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeTokens();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="w-1/3"></div>
          <h1 className="text-3xl font-bold text-center w-1/3">
            검사 대행 찾기
          </h1>
          <div className="w-1/3 flex justify-end">
            {isLoggedIn ? (
              <Button onClick={handleLogout} className="bg-white text-black hover:bg-gray-200">
                로그아웃
              </Button>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button variant="outline" className="mr-2 text-black bg-white border-white hover:bg-gray-200">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button className="bg-white text-black hover:bg-gray-200">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-600">
              이용 목적을 선택해주세요
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link href="/client" passHref>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="flex items-center justify-center h-40">
                  <h3 className="text-2xl font-medium text-gray-900">의뢰인</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inspector" passHref>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="flex items-center justify-center h-40">
                  <h3 className="text-2xl font-medium text-gray-900">검사자</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
          <Card className="mt-8">
            <CardContent>
              <h3 className="text-xl font-medium mb-4">
                검사 가능 창고 요약
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : availableWarehouses.length > 0 ? (
                <ul className="space-y-2">
                  {availableWarehouses.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.warehouse}</span>
                      <span className="text-green-600 font-medium">{item.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>검사 가능한 창고가 없습니다.</p>
              )}
            </CardContent>
          </Card>

          {/* "이용 방법 및 필독사항" 링크 추가 */}
          <div className="mt-8 text-center">
            <Link href="/notice" passHref>
              <a className="text-blue-600 hover:underline">이용 방법 및 필독사항</a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
