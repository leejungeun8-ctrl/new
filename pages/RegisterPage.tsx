
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, COL_USERS } from '../firebase';
import { UserRole } from '../types';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, COL_USERS, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: Date.now(),
      });

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일 주소입니다.');
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">새 계정 만들기</h1>
          <p className="text-slate-500 mt-2">RecruitPro의 모든 기능을 시작해보세요.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">이름</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">이메일 주소</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="6자 이상 입력"
            />
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">계정 유형</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.USER)}
                className={`py-3 rounded-xl border text-sm font-bold transition ${
                  role === UserRole.USER 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                지원자
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`py-3 rounded-xl border text-sm font-bold transition ${
                  role === UserRole.ADMIN 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                관리자
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">* 관리자 권한을 선택하면 지원서 심사가 가능합니다.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 mt-6"
          >
            {loading ? '처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
