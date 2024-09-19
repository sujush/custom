'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox' // Checkbox 컴포넌트 추가
import { fetchWithAuth } from '@/app/utils/api';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.customs-inspection.net';

export default function SignupPage() {
  const [nickname, setNickname] = useState('')  // 닉네임 상태 추가
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('')
  const [error, setError] = useState('')
  const [isAgreed, setIsAgreed] = useState(false) // 개인정보 동의 여부 상태 추가
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!isAgreed) {
      setError('개인정보 수집 및 이용에 대한 동의를 해주세요.')
      return
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname, userType }),
        credentials: 'include'
      });

      if (response.ok) {
        console.log('회원가입 성공:', email, userType)
        router.push('/login')  // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        const errorData = await response.json()
        setError(errorData.message || '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.')
      }
    } catch (err) {
      console.error('회원가입 오류:', err)
      setError('회원가입 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Select onValueChange={(value) => setUserType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="사용자 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">의뢰인</SelectItem>
                  <SelectItem value="inspector">검사자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 개인정보 수집 및 이용 동의 */}
            <div className="space-y-2">
              <div className="p-4 bg-gray-200 rounded">
                <h3 className="text-lg font-semibold">개인정보 수집 및 이용 동의</h3>
                <div className="text-sm">
                  <p>1. 수집하는 개인정보의 항목</p>
                  <p>본 사이트는 최초 회원 가입 또는 서비스 이용 시 이용자로부터 아래와 같은 개인정보를 수집하고 있습니다.</p>
                  <ul className="list-disc list-inside">
                    <li>필수항목: 닉네임, 이메일주소, 비밀번호, 휴대폰번호, 계좌번호</li>
                  </ul>
                  <p>2. 개인정보의 수집 및 이용목적</p>
                  <p>회원관리 및 본인확인, 개인정보 처리 및 정보주체의 개인정보 열람, 정정, 삭제 요구시 본인 확인을 위함</p>
                  <p>3. 개인정보의 보유 및 이용기간</p>
                  <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                  <ul className="list-disc list-inside">
                    <li>계약 또는 청약철회 등에 관련 기록: 5년</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                    <li>신용정보의 수집/처리 및 이용 등에 관한 기록: 3년</li>
                  </ul>
                  <p>4. 제3자에게의 개인정보 제공</p>
                  <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
                  <ul className="list-disc list-inside">
                    <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    <li>유료 서비스 제공에 따른 요금 정산을 위하여 필요한 경우</li>
                    <li>통계작성, 학술연구나 시장조사를 위해 특정 개인을 식별할 수 없는 형태로 가공하여 제공하는 경우</li>
                    <li>이용자들이 사전에 동의한 경우</li>
                  </ul>
                </div>
              </div>
              <Checkbox
                id="agreement"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(checked === true)}
              />
              <Label htmlFor="agreement">개인정보 수집 및 이용에 동의합니다.</Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              회원가입
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </p>
          <Link href="/" passHref>
            <Button variant="outline">메인페이지로 이동</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
