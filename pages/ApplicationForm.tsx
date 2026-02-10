
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, COL_RECRUIT } from '../firebase';
import { UserProfile, EducationEntry, ExperienceEntry } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ApplicationFormProps {
  userProfile: UserProfile | null;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [loading, setLoading] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  
  const [userName, setUserName] = useState(userProfile?.displayName || '');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(userProfile?.email || '');
  
  const [education, setEducation] = useState<EducationEntry[]>([
    { admissionYear: '', graduationYear: '', schoolMajor: '', certificates: '' },
    { admissionYear: '', graduationYear: '', schoolMajor: '', certificates: '' },
    { admissionYear: '', graduationYear: '', schoolMajor: '', certificates: '' },
  ]);

  const [experience, setExperience] = useState<ExperienceEntry[]>([
    { period: '', companyDept: '', duties: '' },
    { period: '', companyDept: '', duties: '' },
    { period: '', companyDept: '', duties: '' },
  ]);

  const [selfIntro, setSelfIntro] = useState('');
  const [desiredField, setDesiredField] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');

  const job_categories = [
    { "group": "기술", "options": ["디자인", "F&B(조리)"] },
    { "group": "고객서비스", "options": ["유기시설 운영", "하강레저시설 운영", "바리스타", "판매서비스", "F&B(서비스)"] },
    { "group": "호텔", "options": ["접객서비스", "객실서비스"] },
    { "group": "선박승무", "options": ["선박 운항 및 기관 담당", "고객안내 및 승무서비스"] }
  ];

  useEffect(() => {
    const consentStatus = localStorage.getItem('privacy_consent_status');
    if (consentStatus === 'true') {
      setIsPrivacyAgreed(true);
    }
    return () => {
      localStorage.removeItem('privacy_consent_status');
      localStorage.removeItem('temp_apply_name');
    };
  }, []);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPhotoPreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressSearch = () => {
    if (!(window as any).daum) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        let fullAddr = data.roadAddress;
        let extraAddr = '';
        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddr += data.bname;
          if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
        }
        setAddress(fullAddr);
        const detailInput = document.getElementById('detailAddress') as HTMLInputElement;
        if (detailInput) detailInput.focus();
      }
    }).open();
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEdu = [...education];
    (newEdu[index] as any)[field] = value;
    setEducation(newEdu);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const newExp = [...experience];
    (newExp[index] as any)[field] = value;
    setExperience(newExp);
  };

  const generateDummyData = async () => {
    const names = ['김철수', '이영희', '박지민', '최성우', '정다은'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';
    const randomBirth = `199${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 9)}`;
    const randomPhone = `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    setUserName(randomName);
    setGender(randomGender);
    setBirthDate(randomBirth);
    setPhone(randomPhone);
    setAddress('경기도 용인시 처인구 포곡읍 에버랜드로 199');
    setDetailAddress('나미나라 아파트 101동 202호');
    setSelfIntro('저는 남다른 열정과 끈기를 가진 인재입니다. 나미나라공화국에서의 새로운 도전을 통해 저의 역량을 발휘하고 싶습니다. 항상 긍정적인 자세로 팀원들과 협력하며 최고의 성과를 내기 위해 노력하겠습니다. 감사합니다.');
    
    const randomCat = job_categories[Math.floor(Math.random() * job_categories.length)];
    const randomOption = randomCat.options[Math.floor(Math.random() * randomCat.options.length)];
    setDesiredField(randomOption);
    setExpectedSalary((Math.floor(Math.random() * 2000) + 3000).toString());

    setEducation([
      { admissionYear: '2015-03-02', graduationYear: '2019-02-15', schoolMajor: '한국대학교 경영학과', certificates: 'TOEIC 900점' },
      { admissionYear: '2012-03-02', graduationYear: '2015-02-10', schoolMajor: '서울고등학교', certificates: '컴퓨터활용능력 1급' },
      { admissionYear: '', graduationYear: '', schoolMajor: '', certificates: '' },
    ]);

    setExperience([
      { period: '2019-03 ~ 2022-05', companyDept: '나미테크 기술팀', duties: '프론트엔드 개발' },
      { period: '2018-01 ~ 2018-02', companyDept: '한국은행 인턴', duties: '문서 관리 및 지원' },
      { period: '', companyDept: '', duties: '' }
    ]);

    setIsGeneratingPhoto(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `A professional corporate portrait of a ${randomGender === 'male' ? 'man' : 'woman'} in their mid-20s for a job application ID photo, wearing business attire, neutral studio background, centered, high quality, soft lighting.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          const compressed = await compressImage(dataUrl);
          setPhotoPreview(compressed);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating dummy photo:", error);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const handleOpenPrivacy = () => {
    localStorage.setItem('temp_apply_name', userName);
    navigate('/privacy-consent');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!desiredField) {
      alert('지원 분야를 선택해 주세요.');
      return;
    }
    if (!isPrivacyAgreed) {
      alert('개인정보 수집 및 이용 동의가 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const photoUrl = photoPreview || '';

      await addDoc(collection(db, COL_RECRUIT), {
        userId: userProfile.uid,
        userName: userName,
        email: email,
        gender,
        birthDate,
        address,
        detailAddress,
        phone,
        photoUrl, 
        education: education.filter(e => e.schoolMajor),
        experience: experience.filter(e => e.companyDept),
        selfIntro,
        desiredField,
        expectedSalary,
        status: 'pending',
        createdAt: Date.now(),
      });

      alert('입사지원서가 성공적으로 제출되었습니다! 개인 대시보드로 이동합니다.');
      navigate('/');
    } catch (error: any) {
      console.error("Error submitting application:", error);
      if (error.message && error.message.includes('1048487 bytes')) {
        alert('사진 용량이 너무 큽니다. 더 작은 사진을 사용해주세요.');
      } else {
        alert('제출 중 오류가 발생했습니다. (Firestore 저장 실패)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mb-20">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <div className="absolute top-4 right-4">
            <button 
              type="button" 
              onClick={generateDummyData}
              disabled={isGeneratingPhoto}
              className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 border border-amber-200 disabled:opacity-50"
            >
              {isGeneratingPhoto ? (
                <div className="w-4 h-4 border-2 border-amber-700/20 border-t-amber-700 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              )}
              {isGeneratingPhoto ? '데이터 생성중...' : '테스트 데이터 생성'}
            </button>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">입 사 지 원 서</h1>
          <p className="text-slate-500">나미나라공화국 남이섬과 함께할 인재를 기다립니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">증명사진 첨부</label>
              <div 
                onClick={() => !isGeneratingPhoto && fileInputRef.current?.click()}
                className={`w-40 h-52 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition group overflow-hidden relative ${isGeneratingPhoto ? 'cursor-wait' : ''}`}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-slate-400 mt-2">사진 업로드</span>
                  </>
                )}
                {isGeneratingPhoto && (
                  <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                    <p className="text-[10px] font-black text-indigo-600">AI 사진 생성중</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">인적 사항</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">성명</label>
                  <input type="text" required value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">성별</label>
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                      <button type="button" onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender === 'male' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>남성</button>
                      <button type="button" onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender === 'female' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>여성</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">생년월일</label>
                    <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">현 주소</label>
                    <button type="button" onClick={handleAddressSearch} className="text-[11px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1 shadow-sm">주소 검색</button>
                  </div>
                  <input type="text" required value={address} readOnly onClick={handleAddressSearch} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer" placeholder="주소를 선택하세요." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">상세 주소</label>
                  <input type="text" value={detailAddress} onChange={e => setDetailAddress(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="상세 주소" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">연락처 (핸드폰)</label>
                  <input 
                    type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                    placeholder="010-0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">이메일</label>
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-10">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">학력 사항</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-left">
                    <th className="pb-3 pr-2">입학년도</th>
                    <th className="pb-3 px-2">졸업년도</th>
                    <th className="pb-3 px-2 w-1/2">학교/전공</th>
                    <th className="pb-3 pl-2">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1"><input type="date" value={edu.admissionYear} onChange={e => updateEducation(idx, 'admissionYear', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" /></td>
                      <td className="py-1 px-1"><input type="date" value={edu.graduationYear} onChange={e => updateEducation(idx, 'graduationYear', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" /></td>
                      <td className="py-1 px-1"><input type="text" value={edu.schoolMajor} onChange={e => updateEducation(idx, 'schoolMajor', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" placeholder="학교/전공" /></td>
                      <td className="py-1 pl-1"><input type="text" value={edu.certificates} onChange={e => updateEducation(idx, 'certificates', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" placeholder="자격증 등" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-500 pl-3">경력 사항</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-left">
                    <th className="pb-3 pr-2 w-1/4">근무기간</th>
                    <th className="pb-3 px-2 w-1/4">직장명/부서</th>
                    <th className="pb-3 pl-2 w-1/2">주요업무</th>
                  </tr>
                </thead>
                <tbody>
                  {experience.map((exp, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1"><input type="text" value={exp.period} onChange={e => updateExperience(idx, 'period', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" placeholder="예: 2020.01~2022.12" /></td>
                      <td className="py-1 px-1"><input type="text" value={exp.companyDept} onChange={e => updateExperience(idx, 'companyDept', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" placeholder="직장/부서명" /></td>
                      <td className="py-1 pl-1"><input type="text" value={exp.duties} onChange={e => updateExperience(idx, 'duties', e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg" placeholder="담당 업무 기술" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-l-4 border-purple-600 pl-3">자기 소개</h3>
          <textarea required value={selfIntro} onChange={e => setSelfIntro(e.target.value)} className="w-full min-h-[250px] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm leading-loose" placeholder="자신의 경험과 가치관을 구체적으로 서술해 주세요." />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-l-4 border-purple-600 pl-3">
            <h3 className="text-lg font-bold text-slate-900">지원 분야</h3>
            <span className="text-xs text-slate-400 font-medium">* 하나만 선택 가능합니다.</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {job_categories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <h4 className="text-sm font-black text-slate-700 tracking-tight">{cat.group}</h4>
                </div>
                <div className="flex flex-col gap-2.5">
                  {cat.options.map(option => (
                    <label 
                      key={option} 
                      className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none group ${
                        desiredField === option 
                        ? 'border-purple-600 bg-purple-50/30 shadow-sm' 
                        : 'border-slate-50 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="desiredField"
                        value={option}
                        checked={desiredField === option}
                        onChange={(e) => setDesiredField(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        desiredField === option ? 'text-purple-700' : 'text-slate-500 group-hover:text-slate-700'
                      }`}>
                        {option}
                      </span>
                      {desiredField === option && (
                        <div className="flex items-center justify-center bg-purple-600 text-white rounded-full w-5 h-5 animate-in zoom-in duration-200">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100">
            <div className="max-w-sm">
              <label className="block text-sm font-bold text-slate-700 mb-2">희망 기본급 (연봉)</label>
              <div className="relative">
                <input 
                  type="text" required value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition pr-12 font-bold text-indigo-600"
                  placeholder="0000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">만원</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-indigo-600">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">개인정보 수집 및 이용 동의</h3>
            <p className="text-sm text-slate-500">지원을 완료하려면 필수 동의서 작성이 필요합니다.</p>
          </div>
          <button 
            type="button" 
            onClick={handleOpenPrivacy}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition shadow-lg ${
              isPrivacyAgreed 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
            }`}
          >
            {isPrivacyAgreed ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                개인정보 동의 완료
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                개인정보동의서 작성
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-10 text-center text-white shadow-xl">
          <p className="text-slate-400 mb-6 font-medium">위의 내용이 틀림이 없음을 확인합니다.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
            <div className="text-2xl font-black">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</div>
            <div className="flex items-center gap-4 border-l border-white/20 pl-8">
              <span className="text-slate-400">지원자</span>
              <span className="text-3xl font-black font-serif italic">{userName || '______'}</span>
              <span className="text-slate-500">(인)</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/')} className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition">작성 취소</button>
            <button 
              type="submit" 
              disabled={loading || isGeneratingPhoto || !isPrivacyAgreed}
              className="flex-[3] py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl font-black text-xl shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
            >
              {loading ? '제출 중...' : '최종 지원서 제출하기'}
            </button>
          </div>
          {!isPrivacyAgreed && (
            <p className="text-amber-400 text-xs font-bold mt-4 animate-bounce">
              * 지원서를 제출하기 위해 먼저 개인정보동의서를 작성해 주세요.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
