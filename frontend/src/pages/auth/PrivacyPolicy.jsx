import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-4 border-b pb-2">개인정보처리방침</h2>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">1. 서문</h3>
        <p className="text-gray-700">
          보드게임 어시스턴스(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여,
          적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한
          절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을
          수립·공개합니다.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">2. 목차</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li><a href="#section1" className="hover:underline">제1조 총칙</a></li>
          <li><a href="#section2" className="hover:underline">제2조 개인정보의 처리목적, 수집 항목, 보유 및 이용기간</a></li>
          <li><a href="#section3" className="hover:underline">제3조 개인정보의 파기절차 및 방법</a></li>
          <li><a href="#section4" className="hover:underline">제4조 정보주체 및 법정대리인의 권리·의무 및 행사방법</a></li>
          <li><a href="#section5" className="hover:underline">제5조 개인정보의 안전성 확보조치</a></li>
          <li><a href="#section6" className="hover:underline">제6조 개인정보 자동 수집장치의 설치 운영 및 거부</a></li>
          <li><a href="#section7" className="hover:underline">제7조 개인정보 보호책임자 및 개인정보 열람청구</a></li>
          <li><a href="#section8" className="hover:underline">제8조 권익침해 구제방법</a></li>
          <li><a href="#section9" className="hover:underline">제9조 개인정보처리방침 고지</a></li>
        </ul>
      </section>

    <section id="section1" className="mb-6">
        <h3 className="text-xl font-semibold mb-2">3. 제1조 총칙</h3>
        <p className="text-gray-700 mb-2">
          보드게임 어시스턴스(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여,
          적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한
          절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을
          수립·공개합니다.
        </p>
       <div className="bg-gray-50 border-l-4 border-blue-500 p-4 text-sm text-gray-800 space-y-3">
            <div>
            <strong>주요 개인정보 처리 표시</strong><br />
            ※ 세부사항은 개인정보 처리방침 본문 확인
            </div>

            <div>
            <strong>1️⃣ 수집하는 개인정보 항목</strong><br />
            - 필수항목: 이름, 이메일, 비밀번호, 회사명
            </div>

            <div>
            <strong>2️⃣ 개인정보 수집 및 이용 목적</strong><br />
            - 회원가입 및 관리<br />
            - 서비스 제공 및 개선
            </div>

            <div>
            <strong>3️⃣ 개인정보의 보유 및 이용기간</strong><br />
            - 회원 탈퇴 시까지 또는 관련 법령에 따라 보관
            </div>

            <div className="mt-2 text-gray-600">
            ※ 본인은 위 내용을 확인하였으며, 개인정보 수집 및 이용에 동의합니다.
            </div>
        </div>  
      </section>

      <section id="section2" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">4. 제2조 개인정보의 처리목적, 수집 항목, 보유 및 이용기간</h3>
        
        <div className="space-y-4 text-gray-700">
            <p> 1. 회사는 보드게임 기획, 개발, 퍼블리시 등을 위하여 필요한 범위에서 최소한의 개인정보만을 수집합니다.</p>
            <p> 2.회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>

            <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-3 py-2">구분</th>
                    <th className="border px-3 py-2">수집 항목</th>
                    <th className="border px-3 py-2">이용 목적</th>
                    <th className="border px-3 py-2">보유 및 이용기간</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td className="border px-3 py-2 text-center">회원가입</td>
                    <td className="border px-3 py-2">이름, 이메일, 비밀번호, 회사명</td>
                    <td className="border px-3 py-2">회원관리 및 서비스 제공</td>
                    <td className="border px-3 py-2">회원 탈퇴 시까지</td>
                </tr>
                <tr>
                    <td className="border px-3 py-2 text-center">서비스 개선</td>
                    <td className="border px-3 py-2">로그인 이력, 활동 내역 등</td>
                    <td className="border px-3 py-2">서비스 품질 향상 및 통계</td>
                    <td className="border px-3 py-2">동의 받은 기간 또는 법령상 기간</td>
                </tr>
                </tbody>
            </table>
            </div>

            <div className="text-sm text-gray-600">
            ※ 보유기간 예외: 법령에 특별한 규정이 있을 경우 관련 법령에 따라 보관<br />
            ※ 위 정보는 가입 당시 정보뿐만 아니라 정보 수정으로 변경된 정보를 포함합니다.
            </div>

            <div>
            <p className="mt-4">
                3. 회사는 아래의 경우에 정보주체의 동의 없이 개인정보를 수집할 수 있으며 그 수집 목적의 범위에서 이용할 수 있습니다:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
                <li>가. 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                <li>나. 정보주체와 체결한 계약을 이행하거나 계약 체결 과정에서 요청에 따라 필요한 경우</li>
                <li>다. 명백히 정보주체 또는 제3자의 급박한 생명·신체·재산 보호를 위해 필요한 경우</li>
                <li>라. 개인정보처리자의 정당한 이익이 정보주체의 권리보다 우선하는 경우<br />&nbsp;&nbsp;&nbsp;&nbsp;(상당한 관련성과 합리적인 범위를 초과하지 않는 경우)</li>
                <li>마. 공중위생 등 공공의 안정과 안녕을 위하여 긴급히 필요한 경우</li>
            </ul>
            </div>
        </div>
      </section>


        <section id="section3" className="mb-6">
            <h3 className="text-xl font-semibold mb-3">5. 제3조 개인정보의 파기절차 및 방법</h3>
            
            <div className="space-y-4 text-gray-700">
                <p>1. 회사는 개인정보 보유기간의 경과, 개인정보 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <p>2.정보주체로부터 동의 받은 개인정보 보유기간이 경과하거나 처리 목적이 달성되었음에도 불구하고, 다른 법령에 따라 개인정보를 계속 보존해야 하는 경우에는 해당 정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.</p>
                <div>
                <p>3.개인정보 파기 절차 및 방법은 다음과 같습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                    <strong>가. 파기절차</strong>: 정보주체의 개인정보는 보유기간이 경과하거나 처리 목적이 달성된 후 복구 또는 재생할 수 없도록 파기됩니다.  
                    단, 법령에 따라 개인정보를 계속 보존해야 하는 경우에는 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 변경하여,  
                    법령에서 정한 기간 동안 저장 후 파기됩니다.
                    </li>
                    <li>
                    <strong>나. 파기방법</strong>: 전자적 파일 형태로 기록·저장된 개인정보는 복구할 수 없도록 영구 삭제하며,  
                    종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
                    </li>
                </ul>
                </div>
            </div>
        </section>

        <section id="section4" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">6. 제4조 정보주체 및 법정대리인의 권리·의무 및 행사방법</h3>

        <div className="space-y-4 text-gray-700 text-sm">
            <ul className="list-decimal list-inside space-y-2">
            <li>정보주체는 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
            <li>만 14세 미만 아동에 관한 개인정보의 열람 등 요구는 법정대리인이 직접 해야 하며, 만 14세 이상의 미성년자는 본인 또는 법정대리인을 통해 권리를 행사할 수 있습니다.</li>
            <li>권리 행사는 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통해 가능하며, 회사는 지체 없이 조치하겠습니다.</li>
            <li>권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통해서도 가능합니다.</li>
            <li>개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 따라 제한될 수 있습니다.</li>
            <li>개인정보의 정정 및 삭제 요구는 다른 법령에서 수집 대상으로 명시되어 있는 경우에는 삭제를 요구할 수 없습니다.</li>
            <li>회사는 정보주체의 요구가 본인 또는 정당한 대리인인지 여부를 확인합니다.</li>
            </ul>
        </div>
        </section>

        <section id="section5" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">7. 제5조 개인정보의 안전성 확보조치</h3>

        <div className="space-y-4 text-gray-700 text-sm">
            <p> 회사는 개인정보의 안정성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>

            <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
                <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 전담조직 운영, 정기적 직원 교육
            </li>
            <li>
                <strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근권한 관리,  
                접근통제시스템 설치, 개인정보의 암호화, 보안프로그램 설치 및 갱신
            </li>
            </ul>
        </div>
        </section>

        <section id="section6" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">8. 제6조 개인정보 자동 수집장치의 설치 운영 및 그 거부에 관한 사항</h3>
        <div className="space-y-4 text-gray-700 text-sm">
            <p>회사는 정보주체에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다.</p>
            <p>쿠키는 웹사이트를 운영하는 서버(http)가 정보주체의 브라우저에게 보내는 소량의 정보이며, 정보주체의 PC 또는 모바일에 저장됩니다.</p>
            <p>정보주체는 웹 브라우저 옵션을 통해 쿠키 허용, 차단 등의 설정이 가능하며, 쿠키 저장을 거부하면 맞춤형 서비스 이용에 제한이 생길 수 있습니다.</p>

            <div>
            <h4 className="font-semibold mt-2">쿠키 설정 안내</h4>
            <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>웹 브라우저</strong></li>
                <ul className="list-disc ml-6">
                <li>크롬: 설정 &gt; 개인정보 보호 및 보안 &gt; 인터넷 사용 기록 삭제</li>
                <li>엣지: 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</li>
                </ul>
                <li><strong>모바일 브라우저</strong></li>
                <ul className="list-disc ml-6">
                <li>크롬: 설정 &gt; 개인정보 보호 및 보안 &gt; 인터넷 사용 기록 삭제</li>
                <li>사파리: 기기 설정 &gt; 사파리 &gt; 고급 &gt; 모든 쿠키 차단</li>
                <li>삼성 인터넷: 설정 &gt; 인터넷 사용 기록 &gt; 인터넷 사용 기록 삭제</li>
                </ul>
            </ul>
            </div>
        </div>
        </section>

        <section id="section7" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">9. 제7조 개인정보 보호책임자 및 개인정보 열람청구</h3>
        <div className="space-y-4 text-gray-700 text-sm">
            <p>회사는 개인정보 처리에 관한 업무를 총괄하고, 관련 문의·불만처리·피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정합니다.</p>
            <p>정보주체는 「개인정보 보호법」 제35조에 따라 아래 부서를 통해 개인정보 열람 청구가 가능합니다.</p>
            <p>아래 보호책임자 및 담당자에게 언제든지 문의주시면 도움을 드릴 수 있습니다.</p>

            <div className="overflow-x-auto mt-2">
            <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-3 py-2">구분</th>
                    <th className="border px-3 py-2">담당자 정보</th>
                    <th className="border px-3 py-2">연락처</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td className="border px-3 py-2 text-center">개인정보 보호책임자</td>
                    <td className="border px-3 py-2">홍길동 (보드게임 어시스턴스)</td>
                    <td className="border px-3 py-2">privacy@boardgame.co.kr</td>
                </tr>
                <tr>
                    <td className="border px-3 py-2 text-center">개인정보 열람청구 부서</td>
                    <td className="border px-3 py-2">개인정보담당팀</td>
                    <td className="border px-3 py-2">070-1234-5678</td>
                </tr>
                <tr>
                    <td className="border px-3 py-2 text-center">담당자 문의</td>
                    <td className="border px-3 py-2">담당자 이메일: help@boardgame.co.kr</td>
                    <td className="border px-3 py-2">전화: 02-9876-5432</td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
        </section>

        <section id="section8" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">10. 제8조 권익침해 구제방법</h3>
        <div className="text-gray-700 text-sm space-y-2">
            <p>
            정보주체는 개인정보침해로 인한 피해구제나 상담을 위해 다음 기관에 문의하거나 분쟁조정을 신청할 수 있습니다:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
            <li>개인정보분쟁조정위원회: <strong>1833-6972</strong> — <a href="https://www.kopico.go.kr" className="text-blue-600 hover:underline">www.kopico.go.kr</a></li>
            <li>개인정보침해신고센터: <strong>118</strong> — <a href="https://privacy.kisa.or.kr" className="text-blue-600 hover:underline">privacy.kisa.or.kr</a></li>
            <li>대검찰청: <strong>1301</strong> — <a href="https://www.spo.go.kr" className="text-blue-600 hover:underline">www.spo.go.kr</a></li>
            <li>경찰청: <strong>182</strong> — <a href="https://ecrm.police.go.kr" className="text-blue-600 hover:underline">ecrm.police.go.kr</a></li>
            </ul>
        </div>
        </section>

        <section id="section9" className="mb-6">
        <h3 className="text-xl font-semibold mb-3">11. 제9조 개인정보처리방침 고지</h3>
        <p className="text-gray-700 text-sm">
            이 개인정보 처리방침은 <strong>2025년 8월 1일</strong>부터 적용됩니다.
        </p>
        </section>


    </div>
  );
};

export default PrivacyPolicy;
