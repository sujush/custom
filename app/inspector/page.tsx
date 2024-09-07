'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { checkAuth, getToken } from '@/app/utils/auth'

const areas = ['구항', '신항', '남동']
const warehouses: { [key: string]: string[] } = {
  '구항': ['성민 보세창고', '더로지스2보세창고', '백마보세창고', '백마제2보세창고', '베델로지스틱스 보세창고', '조양 보세창고'],
  '신항': ['동방 보세창고', '영진공사 보세창고', '디앤더블유보세창고', '지앤케이보세창고'],
  '남동': ['하나로 보세창고']
}

interface Inspection {
  date: string;
  warehouse: string;
  time: string;
  nickname: string;
  email: string;
  fee: number;
  accountNumber: string;
  bankName: string;
}

export default function InspectorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [fee, setFee] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [myInspections, setMyInspections] = useState<Inspection[]>([])
  const [userInfo, setUserInfo] = useState({ nickname: '', email: '' })

  const router = useRouter()

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login?redirectTo=/inspector')
    } else {
      fetchUserInfo()
      setIsAuthenticated(true)
      fetchMyInspections()
    }
  }, [router])

  const fetchMyInspections = async () => {
    try {
      const token = getToken()
      const response = await fetch('http://localhost:5000/api/my-inspections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Received inspection data:', data);  // 받은 데이터 로그
        setMyInspections(data)
      }
    } catch (error) {
      console.error('Error fetching my inspections:', error)
    }
  }
  
  const fetchUserInfo = async () => {
    try {
      const token = getToken()
      const response = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area)
    setSelectedWarehouse('')
    setSelectedTime('')
    setShowConfirmation(false)
    setConfirmed(false)
    setError('')
  }

  const handleWarehouseSelect = (warehouse: string) => {
    setSelectedWarehouse(warehouse)
    setSelectedTime('')
    setShowConfirmation(false)
    setConfirmed(false)
    setError('')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fee || !accountNumber || !bankName) {
      setError('모든 내용을 입력해주세요')
      return
    }
    setError('')
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    try {
      const token = getToken()
      const response = await fetch('http://localhost:5000/api/inspector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          warehouse: selectedWarehouse,
          time: selectedTime,
          nickname: userInfo.nickname,
          email: userInfo.email,
          fee,
          accountNumber,
          bankName
        }),
      })

      if (response.ok) {
        console.log('Data sent successfully')
        setConfirmed(true)
        setShowConfirmation(false)
        fetchMyInspections()  // 새로운 검사 정보를 반영하기 위해 다시 fetch
      } else {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        setError(errorData.message || '서버 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Network error:', error)
      setError('네트워크 오류가 발생했습니다.')
    }
  }

  if (!isAuthenticated) {
    return null // 또는 로딩 표시
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">검사자 페이지</h1>

      {/* 사용자 정보 표시 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">사용자 정보</h2>
        <p>닉네임: {userInfo.nickname}</p>
        <p>이메일: {userInfo.email}</p>
      </div>


      {/* 내 검사 일정 UI */}
      {myInspections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">내 검사 일정</h2>
          {myInspections.map((inspection: Inspection, index: number) => (
            <Card key={index} className="mb-4">
              <CardContent className="p-4">
                <p>{`${inspection.date} ${inspection.warehouse} ${inspection.time}검사`}</p>
                <p>닉네임: {inspection.nickname}</p>
                <p>이메일: {inspection.email}</p>
                <p>검사비용: {inspection.fee}원</p>
                <p>연락처: {inspection.accountNumber}</p>
                <p>계좌번호: {inspection.bankName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}



      {!confirmed ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">검사 정보 입력</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {areas.map((area) => (
              <Card key={area} className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${selectedArea === area ? 'border-2 border-blue-500' : ''}`} onClick={() => handleAreaSelect(area)}>
                <CardContent className="flex items-center justify-center h-20">
                  <h3 className="text-xl font-semibold">{area}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedArea && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {warehouses[selectedArea as keyof typeof warehouses].map((warehouse) => (
                <Card key={warehouse} className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${selectedWarehouse === warehouse ? 'border-2 border-blue-500' : ''}`} onClick={() => handleWarehouseSelect(warehouse)}>
                  <CardContent className="flex items-center justify-center h-20">
                    <h3 className="text-lg">{warehouse}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedWarehouse && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${selectedTime === '오전' ? 'border-2 border-blue-500' : ''}`} onClick={() => handleTimeSelect('오전')}>
                  <CardContent className="flex items-center justify-center h-20">
                    <h3 className="text-lg">오전 검사</h3>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer hover:shadow-lg transition-shadow duration-300 ${selectedTime === '오후' ? 'border-2 border-blue-500' : ''}`} onClick={() => handleTimeSelect('오후')}>
                  <CardContent className="flex items-center justify-center h-20">
                    <h3 className="text-lg">오후 검사</h3>
                  </CardContent>
                </Card>
              </div>
              {selectedTime && (
                <>
                  <div>
                    <Label htmlFor="fee">검사비용</Label>
                    <Input id="fee" type="number" value={fee} onChange={(e) => setFee(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">연락처</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="bankName">계좌번호-보안우려가 있으므로 가상계좌 추천</Label>
                    <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit">확인</Button>
                </>
              )}
            </form>
          )}
          {showConfirmation && (
            <div className="mt-4">
              <p>확정하시겠습니까?</p>
              <Button onClick={handleConfirm} className="mt-2">확인</Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">검사 일정 확정</h2>
          <Card>
            <CardContent className="p-4">
              <p>{`${selectedWarehouse} ${selectedTime}검사 가능`}</p>
              <p>닉네임: {userInfo.nickname}</p>
              <p>이메일: {userInfo.email}</p>
              <p>검사비용: {fee}원</p>
              <p>연락처: {accountNumber}</p>
              <p>계좌번호: {bankName}</p>
            </CardContent>
          </Card>
        </div>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        메인으로 돌아가기
      </Link>
    </div>
  )
}