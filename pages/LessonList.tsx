
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, COL_LESSON, STR_LESSON } from '../firebase';
import { Lesson, UserProfile, UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface LessonListProps {
  userProfile: UserProfile | null;
}

const LessonList: React.FC<LessonListProps> = ({ userProfile }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Lesson State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COL_LESSON), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setUploading(true);

    try {
      let fileUrl = '';
      if (file) {
        const storageRef = ref(storage, `${STR_LESSON}/${Date.now()}_${file.name}`);
        const res = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(res.ref);
      }

      await addDoc(collection(db, COL_LESSON), {
        title,
        content,
        instructor: userProfile.displayName,
        fileUrl,
        createdAt: Date.now()
      });

      alert('자료가 추가되었습니다.');
      setShowAddModal(false);
      setTitle('');
      setContent('');
      setFile(null);
      fetchLessons();
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">학습 및 강의자료</h1>
          <p className="text-slate-500 mt-1">입사 준비에 도움이 되는 유용한 자료들입니다.</p>
        </div>
        {userProfile?.role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            자료 추가
          </button>
        )}
      </header>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 italic">등록된 자료가 없습니다.</div>
          ) : (
            lessons.map(lesson => (
              <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{lesson.title}</h3>
                  <p className="text-slate-600 line-clamp-3 text-sm mb-4 leading-relaxed">{lesson.content}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-600">{lesson.instructor}</span> • {new Date(lesson.createdAt).toLocaleDateString()}
                  </div>
                  {lesson.fileUrl && (
                    <a 
                      href={lesson.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                    >
                      첨부파일 다운로드
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">신규 자료 등록</h2>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">제목</label>
                <input 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="예: 기술 면접 대비 가이드라인"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">내용 요약</label>
                <textarea 
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="자료에 대한 설명을 입력하세요."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">첨부 파일</label>
                <input 
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {uploading ? '등록 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonList;
