'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">필수 숙지 공지사항</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>검사 의뢰 시 정확한 정보를 입력해주세요.</li>
            <li>검사자와의 연락은 플랫폼 내에서만 이루어져야 합니다.</li>
            <li>검사 비용은 검사 완료 후 지불해주세요.</li>
            <li>불편사항이나 문의사항은 고객센터로 연락주세요.</li>
          </ul>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Link href="/" passHref>
          <Button>메인으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}