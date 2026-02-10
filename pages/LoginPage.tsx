
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPw?: string) => {
    if (e) e.preventDefault();
    
    const loginEmail = customEmail || email;
    const loginPw = customPw || password;

    if (!loginEmail || !loginPw) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPw);
      navigate('/');
    } catch (err: any) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (testEmail: string, testPw: string) => {
    setEmail(testEmail);
    setPassword(testPw);
    handleLogin(undefined, testEmail, testPw);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">환영합니다!</h1>
          <p className="text-slate-500 mt-2">로그인하여 입사지원서를 관리하세요.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">이메일 주소</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : null}
            로그인
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">테스트용 로그인</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTestLogin('hhh@rrr.com', '123456')}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition flex flex-col items-center gap-1"
            >
              <span>일반 회원</span>
              <span className="text-[9px] font-normal opacity-60">hhh@rrr.com</span>
            </button>
            <button
              onClick={() => handleTestLogin('aaa@rrrr.com', '123456')}
              className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition flex flex-col items-center gap-1"
            >
              <span>관리자</span>
              <span className="text-[9px] font-normal opacity-60">aaa@rrrr.com</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
