'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NoticePage() {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">이용 방법 및 공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 이용 방법 섹션 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">이용 방법</h2>
              <h3 className="font-bold">- 의뢰인</h3>
              <p className="mb-4">
                의뢰인으로 회원 가입 후 메인페이지의 검사 가능 창고 요약을 확인해서 본인이 원하는 창고에 검사 건이 있는지를 확인한 뒤 의뢰인 페이지에서 검사대행자의 인적사항을 확인하고 컨택합니다.
              </p>
              <h3 className="font-bold">- 검사자</h3>
              <p>
                검사자로 회원 가입 후 검사자 페이지에서 창고 선택 후 검사가능한 시간대를 선택한 뒤에, 검사 대행비용 및 연락처 등을 기입합니다.
              </p>
            </div>
  
            {/* 공지사항 섹션 */}
            <div>
              <h2 className="text-xl font-semibold mb-2">공지사항</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>본 사이트는 단순히 의뢰인과 검사자의 중개만 목적으로 하며 관련된 모든 분쟁에 있어 어떤 책임도 지지 않습니다.</li>
                <li>검사서류는 타 사의 영업비밀을 포함하고 있을 수 있습니다. 그에 관한 책임은 오로지 의뢰인에게 있습니다.</li>
                <li>검사 의뢰 시 서류 제출은 의뢰인이 직접 하고, 검사에 필요한 최소한의 정보만 공유하는 것이 바람직합니다.</li>
                <li>검사자의 사정으로 검사가 지연되거나 불발될 수 있습니다. 이에 관하여 본 사이트는 아무 책임이 없습니다.</li>
                <li>검사 비용 및 지불방식은 당사자간 협의에 따릅니다. 계산서 미발행 등은 본인의 책임으로 하며, 본 사이트는 귀책이 없습니다.</li>
                <li>먹튀, 검사 대상 물품 훼손, 분실 그 외 검사와 관련한 모든 사항에 있어 본 사이트는 아무 관계 및 책임이 없습니다.</li>
                <li>계좌번호는 편의상 기재 가능하며, 미기재하여도 무방합니다. 이 경우 지불 방식은 당사자간 별도 협의하시기 바랍니다.</li>
                <li>은행계좌번호 공개 시 각종 금융범죄에 활용될 수 있으며, 그에 따른 귀책은 공개 당사자인 본인에게 있습니다.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center">
          <Link href="/" passHref>
            <Button>메인으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }