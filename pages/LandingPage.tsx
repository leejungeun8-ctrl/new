
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 md:py-32 flex flex-col items-center text-center animate-custom-fade">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          채용의 새로운 기준, RecruitPro 2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-8">
          나의 미래를 위한<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic">가장 완벽한</span> 첫걸음
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed opacity-0 animate-custom-fade" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          서류 제출부터 심사 결과 확인까지, RecruitPro와 함께라면 
          복잡한 채용 과정이 간편하고 투명해집니다. 지금 바로 당신의 꿈을 제출하세요.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-custom-fade" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <Link 
            to="/register" 
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition shadow-2xl shadow-slate-200 flex items-center gap-3 group"
          >
            지원자로 시작하기
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link 
            to="/login" 
            className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition"
          >
            이미 계정이 있나요?
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 opacity-0 animate-custom-fade" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">간편한 서류 제출</h3>
          <p className="text-slate-500 text-sm leading-relaxed">복잡한 양식 없이 AI 사진 생성과 주소 검색으로 빠르게 입사지원서를 완성할 수 있습니다.</p>
        </div>

        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">실시간 상태 확인</h3>
          <p className="text-slate-500 text-sm leading-relaxed">내 지원서가 현재 어떤 단계에 있는지, 합격 여부까지 대시보드에서 실시간으로 확인하세요.</p>
        </div>

        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">무료 강의 자료</h3>
          <p className="text-slate-500 text-sm leading-relaxed">입사에 도움이 되는 다양한 직무 관련 강의와 학습 자료를 무료로 열람할 수 있습니다.</p>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="py-12 text-center text-slate-400 text-xs">
        © 2024 RecruitPro Human Resource Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
