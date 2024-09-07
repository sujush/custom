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

export default function SignupPage() {
  const [nickname, setNickname] = useState('')  // 닉네임 상태 추가
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname, userType }),
      })
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
              <Label htmlFor="nickname">닉네임</Label>  {/* 닉네임 입력 필드 추가 */}
              <Input
                id="nickname"
                type="text"
                placeholder=""
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
                placeholder=""
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
              <Label htmlFor="userType">사용자 유형</Label>
              <Select onValueChange={setUserType} required>
                <SelectTrigger>
                  <SelectValue placeholder="사용자 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">의뢰인</SelectItem>
                  <SelectItem value="inspector">검사자</SelectItem>
                </SelectContent>
              </Select>
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