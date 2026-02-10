
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
}

export interface EducationEntry {
  admissionYear: string;
  graduationYear: string;
  schoolMajor: string;
  certificates: string;
}

export interface ExperienceEntry {
  period: string;
  companyDept: string;
  duties: string;
}

export interface RecruitApplication {
  id?: string;
  userId: string;
  userName: string;
  email: string;
  
  // Personal Info
  gender: 'male' | 'female';
  birthDate: string;
  address: string;
  detailAddress: string;
  phone: string;
  photoUrl?: string;

  // History
  education: EducationEntry[];
  experience: ExperienceEntry[];

  // Content
  selfIntro: string;
  desiredField: string;
  expectedSalary: string;

  // Metadata
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Lesson {
  id?: string;
  title: string;
  content: string;
  instructor: string;
  fileUrl?: string;
  createdAt: number;
}
