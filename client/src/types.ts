export interface Skill { id?: number; name: string; }

export interface ExperienceEntity {
  id?: number;
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationEntity { id?: number; institution: string; degree: string; end: string; }

export interface ProjectEntity { id?: number; name: string; description?: string; link?: string; bullets: string[]; }

export interface ResumeData {
  id?: number;
  name: string;
  title: string;
  summary: string;
  experiences: (ExperienceEntity | number)[]; // can send id or full object
  skills: (Skill | string | number)[]; // allow name string for quick add
  education: (EducationEntity | number)[];
  projects: (ProjectEntity | number)[];
  updated_at?: string;
}

export const emptyResume: ResumeData = {
  name: '',
  title: 'Software Engineer',
  summary: '',
  experiences: [],
  skills: [],
  education: [],
  projects: []
};
