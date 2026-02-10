
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  userProfile: UserProfile | null;
}

const Navbar: React.FC<NavbarProps> = ({ userProfile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          RecruitPro
        </Link>

        <div className="flex items-center gap-6">
          {userProfile ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium">대시보드</Link>
                <Link to="/lessons" className="text-slate-600 hover:text-indigo-600 font-medium">강의자료</Link>
                {userProfile.role === UserRole.USER && (
                  <Link to="/apply" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">지원하기</Link>
                )}
              </div>
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{userProfile.displayName}</p>
                  <p className="text-xs text-slate-400 capitalize">{userProfile.role === UserRole.ADMIN ? '관리자' : '지원자'}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-slate-100 transition"
                  title="로그아웃"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-600 font-medium hover:text-indigo-600">로그인</Link>
              <Link to="/register" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
