
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const today = new Date();

  useEffect(() => {
    // 세션에서 기존 저장된 이름이 있다면 가져옴
    const savedName = localStorage.getItem('temp_apply_name');
    if (savedName) setUserName(savedName);
  }, []);

  const handleConfirm = () => {
    if (agreed === true) {
      localStorage.setItem('privacy_consent_status', 'true');
      alert('개인정보 수집 및 이용에 동의하셨습니다.');
      navigate(-1); // 이전 화면(지원서 작성)으로 복귀
    } else if (agreed === false) {
      alert('동의하지 않으실 경우 입사 지원이 제한될 수 있습니다.');
      navigate(-1);
    } else {
      alert('동의 여부를 선택해 주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-[800px] mx-auto bg-white shadow-2xl p-10 md:p-16 border border-slate-300">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold border-2 border-slate-800 inline-block px-8 py-3 mb-2">
            개인정보 수집·이용 및 제공·조회 동의서
          </h1>
          <p className="text-slate-500 text-sm">(입사지원자 제출용)</p>
        </div>

        {/* Policy Box */}
        <div className="border border-slate-800 p-6 text-sm leading-relaxed text-slate-800 space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 border border-slate-800 flex items-center justify-center">v</div>
            <span className="font-bold">개인정보취급방침</span>
          </div>
          
          <p>귀 회사는 지원자의 개인정보를 중요시하며, “개인정보보호법”에 관한 법률을 준수하고 있습니다.</p>
          <p>회사는 개인정보취급방침을 통하여 지원자께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>

          <section>
            <h2 className="font-bold mb-1">1. 수집하는 개인정보 항목</h2>
            <p>○ 회사는 채용 진행을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul className="list-disc ml-5 mt-1">
              <li>입사지원 관련사항 : 이름, 생년월일, 연락처, 주소, 전자메일, 경력, 자격증 등</li>
              <li>개인정보 수집은 서류제출로 이루어집니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-1">2. 개인정보의 수집 및 이용목적</h2>
            <p>○ 회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <ul className="list-disc ml-5 mt-1">
              <li>채용분야별 입사지원부문</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold mb-1">3. 개인정보의 보유 및 이용기간</h2>
            <p>○ 회사는 개인정보 수집 및 이용목적이 달성된 후에는 예외 없이 해당정보를 지체 없이 파기합니다.</p>
          </section>

          <section>
            <h2 className="font-bold mb-1">4. 개인정보의 파기절차 및 방법</h2>
            <p>가. 입사지원 등을 위해 제출하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 1년간 저장된 후 파기되어집니다.</p>
            <p>나. 파기방법으로는 전자적 파일형태로 저장된 개인정보의 경우, 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
          </section>

          <section>
            <h2 className="font-bold mb-1">5. 수집한 개인정보의 위탁</h2>
            <p>○ 회사는 지원자의 동의 없이 지원자의 정보를 외부 업체에 위탁하지 않으며, 향후 그러한 필요가 생길 경우 위탁 대상자와 위탁업무 내용에 대해 지원자에게 통지 및 필요한 경우 사전 동의를 받도록 하겠습니다.</p>
          </section>

          <section>
            <h2 className="font-bold mb-1">6. 이용자의 권리와 그 행사방법</h2>
            <p>○ 입사지원을 통한 개인정보의 수집, 이용, 제공에 대해 귀하께서 동의하신 내용을 귀하는 언제든지 철회하실 수 있습니다. 경영지원과 입사지원담당자에게 전자메일 등으로 연락하시면 즉시 개인정보의 삭제 등 필요한 조치를 하겠습니다.</p>
          </section>
        </div>

        {/* Consent Section */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <p className="font-bold text-lg">본인은 상기 개인정보의 수집·이용에 대해</p>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="consent" 
                checked={agreed === true} 
                onChange={() => setAgreed(true)}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="font-bold text-slate-700 group-hover:text-indigo-600">동의함</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="consent" 
                checked={agreed === false} 
                onChange={() => setAgreed(false)}
                className="w-5 h-5 accent-red-600"
              />
              <span className="font-bold text-slate-700 group-hover:text-red-600">동의하지 않음</span>
            </label>
          </div>
        </div>

        {/* Warning Box */}
        <div className="border border-slate-300 bg-slate-50 p-4 text-[13px] text-slate-600 mb-12">
          ※ 귀하는 상기 개인정보의 수집·이용에 대한 동의를 거부할 수 있습니다. 다만, 이에 대한 동의를 하지 않을 경우에는 입사지원신청에 대한 채용업무 과정에서 불이익을 받을 수 있음을 알려드립니다.
        </div>

        {/* Signature */}
        <div className="text-center space-y-6">
          <div className="text-lg font-bold">
            {today.getFullYear()} 년 {today.getMonth() + 1} 월 {today.getDate()} 일
          </div>
          <div className="flex items-center justify-center gap-4 text-xl font-bold">
            <span>입사지원자 :</span>
            <span className="border-b border-slate-800 min-w-[100px] text-indigo-600 font-serif italic">{userName || '________'}</span>
            <span className="text-slate-400 font-normal">(인)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-16 flex justify-center">
          <button 
            onClick={handleConfirm}
            className="bg-slate-900 text-white px-12 py-4 rounded-xl font-black hover:bg-slate-800 transition shadow-xl"
          >
            확인 및 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentPage;
