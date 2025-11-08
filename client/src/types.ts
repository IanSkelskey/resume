export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  end: string;
}

export interface ResumeData {
  id?: number;
  name: string;
  title: string;
  summary: string;
  experiences: ExperienceItem[];
  skills: string[];
  education: EducationItem[];
  updated_at?: string;
}

export const emptyResume: ResumeData = {
  name: '',
  title: 'Software Engineer',
  summary: '',
  experiences: [],
  skills: [],
  education: []
};
