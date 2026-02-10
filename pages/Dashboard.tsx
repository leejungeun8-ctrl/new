
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COL_RECRUIT } from '../firebase';
import { RecruitApplication, UserProfile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface DashboardProps {
  userProfile: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [applications, setApplications] = useState<RecruitApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userProfile) return;
      try {
        const q = query(
          collection(db, COL_RECRUIT),
          where('userId', '==', userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecruitApplication));
        const sortedDocs = docs.sort((a, b) => b.createdAt - a.createdAt);
        setApplications(sortedDocs);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userProfile]);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">나의 지원 현황</h1>
          <p className="text-slate-500 mt-1">{userProfile?.displayName}님, 성공적인 취업을 RecruitPro가 응원합니다.</p>
        </div>
        <Link 
          to="/apply" 
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          새 지원서 작성하기
        </Link>
      </header>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">전체 지원</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}<span className="text-sm font-bold text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">심사 중</p>
          <p className="text-3xl font-black text-indigo-600">{stats.pending}<span className="text-sm font-bold text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">최종 합격</p>
          <p className="text-3xl font-black text-emerald-500">{stats.accepted}<span className="text-sm font-bold text-slate-400 ml-1">건</span></p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">아직 제출된 지원서가 없습니다.</h3>
          <p className="text-slate-500 mb-10">지금 바로 첫 번째 지원서를 작성하고<br/>나미나라공화국의 새로운 일원이 되어보세요!</p>
          <Link to="/apply" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition">
            지금 지원하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">지원 이력 히스토리</h2>
          </div>
          <div className="grid gap-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-20 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
                      {app.photoUrl ? (
                        <img src={app.photoUrl} alt="지원 사진" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-tighter">지원 분야</span>
                        <h4 className="text-xl font-black text-slate-900">{app.desiredField}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <span>{new Date(app.createdAt).toLocaleDateString()} 제출</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>희망급여: {app.expectedSalary}만원</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:pl-8 border-slate-100">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">진행 상태</p>
                      <p className={`text-sm font-black ${
                        app.status === 'accepted' ? 'text-emerald-500' :
                        app.status === 'rejected' ? 'text-red-500' :
                        app.status === 'reviewed' ? 'text-indigo-500' :
                        'text-amber-500'
                      }`}>
                        {app.status === 'pending' ? '서류 심사 중' : 
                         app.status === 'reviewed' ? '서류 검토 완료' :
                         app.status === 'accepted' ? '최종 합격' : '불합격'}
                      </p>
                    </div>
                    <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm border transition-colors ${
                      app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      app.status === 'reviewed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {app.status === 'pending' ? 'PENDING' : app.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
