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

export interface ContactInfo {
  id?: number;
  type: 'email' | 'phone' | 'website' | 'linkedin' | 'github' | 'location';
  value: string;
  label?: string;
}

export interface SocialLink { label: string; url: string; }

export interface ResumeData {
  id?: number;
  name: string;
  label?: string; // arbitrary resume name for a specific application
  title: string;
  summary: string;
  experiences: (ExperienceEntity | number)[]; // can send id or full object
  skills: (Skill | string | number)[]; // allow name string for quick add
  education: (EducationEntity | number)[];
  projects: (ProjectEntity | number)[];
  contact?: ContactInfo;
  socials?: SocialLink[];
  updated_at?: string;
}

export const emptyResume: ResumeData = {
  name: '',
  label: '',
  title: 'Software Engineer',
  summary: '',
  experiences: [],
  skills: [],
  education: [],
  projects: [],
  contact: {},
  socials: []
};
