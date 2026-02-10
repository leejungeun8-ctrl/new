
import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, COL_RECRUIT, COL_USERS } from '../firebase';
import { RecruitApplication, UserProfile } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<RecruitApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'users'>('applications');
  const [selectedApp, setSelectedApp] = useState<RecruitApplication | null>(null);
  
  // Filtering & Selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appSnap, userSnap] = await Promise.all([
          getDocs(query(collection(db, COL_RECRUIT), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, COL_USERS), orderBy('createdAt', 'desc')))
        ]);

        setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() } as RecruitApplication)));
        setUsers(userSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: RecruitApplication['status']) => {
    try {
      const docRef = doc(db, COL_RECRUIT, appId);
      await updateDoc(docRef, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  // Status statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApps.map(app => app.id!)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 행 클릭 이벤트(상세보기) 방지
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Excel Export Handler
  const downloadExcel = () => {
    const selectedData = applications.filter(app => selectedIds.has(app.id!));
    if (selectedData.length === 0) {
      alert('다운로드할 지원서를 선택해 주세요.');
      return;
    }

    const exportData = selectedData.map(app => ({
      '성명': app.userName,
      '이메일': app.email,
      '성별': app.gender === 'male' ? '남성' : '여성',
      '생년월일': app.birthDate,
      '연락처': app.phone,
      '주소': `${app.address} ${app.detailAddress}`,
      '지원분야': app.desiredField,
      '희망급여(만원)': app.expectedSalary,
      '자기소개서': app.selfIntro, // 추가된 항목
      '상태': app.status === 'pending' ? '심사중' : 
             app.status === 'reviewed' ? '검토완료' :
             app.status === 'accepted' ? '합격' : '불합격',
      '제출일': new Date(app.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "지원서_목록");
    
    // 파일명 생성: 지원서_목록_2024-01-01.xlsx
    const fileName = `지원서_목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">인사 관리 시스템</h1>
          <p className="text-slate-500 mt-1">RecruitPro 관리자님, 오늘의 지원 현황입니다.</p>
        </div>
        
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-8 py-2.5 rounded-xl font-black transition text-sm ${activeTab === 'applications' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            지원서 관리
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 py-2.5 rounded-xl font-black transition text-sm ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            회원 데이터
          </button>
        </div>
      </div>

      {activeTab === 'applications' && (
        <>
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">전체 지원서</p>
              <p className="text-4xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">검토 대기</p>
              <p className="text-4xl font-black text-amber-500">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">최종 합격</p>
              <p className="text-4xl font-black text-emerald-500">{stats.accepted}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">불합격 처리</p>
              <p className="text-4xl font-black text-red-500">{stats.rejected}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter & Action Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input 
                    type="text" 
                    placeholder="지원자 이름 또는 이메일 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-600 flex-1 md:flex-none md:min-w-[140px]"
                  >
                    <option value="all">모든 상태</option>
                    <option value="pending">심사 대기</option>
                    <option value="reviewed">검토 완료</option>
                    <option value="accepted">합격</option>
                    <option value="rejected">불합격</option>
                  </select>
                  
                  <button 
                    onClick={downloadExcel}
                    disabled={selectedIds.size === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition shadow-sm ${
                      selectedIds.size > 0 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Excel ({selectedIds.size})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="pl-6 py-4 w-12">
                          <input 
                            type="checkbox" 
                            checked={filteredApps.length > 0 && selectedIds.size === filteredApps.length}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">지원자 정보</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">지원 분야 / 급여</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">제출일</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">심사 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">검색 조건에 맞는 지원서가 없습니다.</td>
                        </tr>
                      ) : (
                        filteredApps.map((app) => (
                          <tr 
                            key={app.id} 
                            onClick={() => setSelectedApp(app)}
                            className={`cursor-pointer transition-all group ${selectedApp?.id === app.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                          >
                            <td className="pl-6 py-5">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.has(app.id!)}
                                onClick={(e) => toggleSelect(app.id!, e)}
                                onChange={() => {}} // dummy to avoid warning
                                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                  {app.photoUrl ? (
                                    <img src={app.photoUrl} className="w-full h-full object-cover" alt={app.userName} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 group-hover:text-indigo-600 transition">{app.userName}</div>
                                  <div className="text-[10px] font-medium text-slate-400 font-mono">{app.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm font-black text-slate-700">{app.desiredField || '미지정'}</div>
                              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">{Number(app.expectedSalary).toLocaleString()}만원</div>
                            </td>
                            <td className="px-6 py-5 text-xs text-slate-500 font-medium">{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-5 text-center">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm border ${
                                app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                app.status === 'reviewed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {app.status === 'pending' ? '심사 중' : 
                                 app.status === 'reviewed' ? '검토 완료' :
                                 app.status === 'accepted' ? '합격' : '불합격'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Details Area */}
            <div className="lg:col-span-1">
              {selectedApp ? (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4">
                      <button onClick={() => setSelectedApp(null)} className="text-white/40 hover:text-white transition bg-white/10 p-2 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-32 bg-slate-800 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl mb-4">
                        {selectedApp.photoUrl ? (
                          <img src={selectedApp.photoUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                             <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-black mb-1">{selectedApp.userName}</h2>
                      <div className="inline-flex bg-indigo-500/20 px-3 py-1 rounded-full text-xs font-black text-indigo-300 uppercase tracking-widest">{selectedApp.desiredField}</div>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    {/* Status Management */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">심사 단계 업데이트</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(selectedApp.id!, s as any)}
                            className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm border ${
                              selectedApp.status === s 
                              ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-xl shadow-slate-900/20' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {s === 'pending' ? '심사중' : s === 'reviewed' ? '검토완료' : s === 'accepted' ? '합격' : '불합격'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50/30 p-4 rounded-2xl">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">성별</p>
                        <p className="text-sm font-black text-slate-800">{selectedApp.gender === 'male' ? '남성' : '여성'}</p>
                      </div>
                      <div className="bg-indigo-50/30 p-4 rounded-2xl">
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">생년월일</p>
                        <p className="text-sm font-black text-slate-800">{selectedApp.birthDate}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        연락처 및 주소
                      </h4>
                      <p className="text-xs font-black text-slate-900 mb-1">{selectedApp.phone}</p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedApp.address}</p>
                      <p className="text-xs font-bold text-indigo-600 mt-1">{selectedApp.detailAddress}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        자기 소개서
                      </h4>
                      <div className="bg-slate-50 p-6 rounded-3xl text-sm leading-loose text-slate-600 border border-slate-100 max-h-60 overflow-y-auto">
                        {selectedApp.selfIntro}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">심사 결과 확정</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center h-64 flex flex-col items-center justify-center animate-pulse">
                  <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">지원서를 선택하여<br/>상세 내역을 확인하세요</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {users.map((u) => (
            <div key={u.uid} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {u.displayName?.charAt(0) || '?'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-900 truncate">{u.displayName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tighter truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-sm border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                  {u.role === 'admin' ? 'ADMINISTRATOR' : 'APPLICANT'}
                </span>
                <span className="text-[9px] text-slate-400 font-black">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
