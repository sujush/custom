'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { checkAuth } from '@/app/utils/auth'
import { fetchWithAuth } from '@/app/utils/api';

const areas = ['구항', '신항', '남동']
const warehouses = {
  '구항': ['성민 보세창고', '더로지스2보세창고', '백마보세창고', '백마제2보세창고', '베델로지스틱스 보세창고', '조양 보세창고'],
  '신항': ['동방 보세창고', '영진공사 보세창고', '디앤더블유보세창고', '지앤케이보세창고'],
  '남동': ['하나로 보세창고']
}

interface Inspector {
  nickname: string;
  email: string;
  fee: number;
  accountNumber: string;
  bankName: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.customs-inspection.net';

export default function ClientPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [inspectorInfo, setInspectorInfo] = useState<Inspector[] | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login?redirectTo=/client')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area)
    setSelectedWarehouse('')
    setSelectedTime('')
    setInspectorInfo(null)
  }

  const handleWarehouseSelect = (warehouse: string) => {
    setSelectedWarehouse(warehouse)
    setSelectedTime('')
    setInspectorInfo(null)
  }

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time)
    if (selectedWarehouse) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/inspector?warehouse=${selectedWarehouse}&time=${time}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setInspectorInfo(data)
        } else {
          setInspectorInfo(null)
        }
      } catch (error) {
        console.error('Error fetching inspector info:', error)
        setInspectorInfo(null)
      }
    }
  }

  if (!isAuthenticated) {
    return null // 또는 로딩 표시
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">의뢰인 페이지</h1>
      {!selectedArea ? (
        <div className="grid grid-cols-3 gap-4">
          {areas.map((area) => (
            <Card key={area} className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => handleAreaSelect(area)}>
              <CardContent className="flex items-center justify-center h-20">
                <h3 className="text-xl font-semibold">{area}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedWarehouse ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">{selectedArea} 창고 목록</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {warehouses[selectedArea as keyof typeof warehouses]?.map((warehouse: string) => (
              <Card key={warehouse} className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => handleWarehouseSelect(warehouse)}>
                <CardContent className="flex items-center justify-center h-20 relative">
                  <h3 className="text-lg">{warehouse}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : !selectedTime ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">{selectedWarehouse} 검사 시간 선택</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => handleTimeSelect('오전')}>
              <CardContent className="flex items-center justify-center h-20">
                <h3 className="text-lg">오전 검사</h3>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => handleTimeSelect('오후')}>
              <CardContent className="flex items-center justify-center h-20">
                <h3 className="text-lg">오후 검사</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">{selectedWarehouse} {selectedTime} 검사자 정보</h2>
          {inspectorInfo && inspectorInfo.length > 0 ? (
            inspectorInfo.map((inspector, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <p><strong>닉네임:</strong> {inspector.nickname}</p>
                  <p><strong>이메일:</strong> {inspector.email}</p>
                  <p><strong>검사비용:</strong> {inspector.fee}원</p>
                  <p><strong>연락처:</strong> {inspector.accountNumber}</p>
                  <p><strong>계좌번호:</strong> {inspector.bankName}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>해당 시간에 가능한 검사자가 없습니다.</p>
          )}
        </div>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        메인으로 돌아가기
      </Link>
    </div>
  )
}