import { ResumeData, Skill, ExperienceEntity, EducationEntity, ProjectEntity } from './types';

const base = '/api';

export async function listResumes(): Promise<ResumeData[]> {
  const r = await fetch(`${base}/resumes`);
  return r.json();
}

export async function getResume(id: number): Promise<ResumeData> {
  const r = await fetch(`${base}/resumes/${id}`);
  return r.json();
}

export async function saveResume(data: ResumeData): Promise<ResumeData> {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `${base}/resumes/${data.id}` : `${base}/resumes`;
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function exportPdf(id: number) {
  const r = await fetch(`${base}/resumes/${id}/pdf`);
  if (!r.ok) throw new Error('Failed PDF');
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.pdf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Library endpoints
export async function listSkills(): Promise<Skill[]> {
  const r = await fetch(`${base}/skills`);
  return r.json();
}
export async function createSkill(name: string): Promise<Skill> {
  const r = await fetch(`${base}/skills`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name})});
  return r.json();
}

export async function listExperiences(): Promise<ExperienceEntity[]> {
  const r = await fetch(`${base}/experiences`);
  return r.json();
}
export async function createExperience(exp: ExperienceEntity): Promise<ExperienceEntity> {
  const r = await fetch(`${base}/experiences`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(exp)});
  return r.json();
}

export async function listEducation(): Promise<EducationEntity[]> {
  const r = await fetch(`${base}/education`);
  return r.json();
}
export async function createEducation(e: EducationEntity): Promise<EducationEntity> {
  const r = await fetch(`${base}/education`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(e)});
  return r.json();
}

export async function listProjects(): Promise<ProjectEntity[]> {
  const r = await fetch(`${base}/projects`);
  return r.json();
}
export async function createProject(p: ProjectEntity): Promise<ProjectEntity> {
  const r = await fetch(`${base}/projects`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p)});
  return r.json();
}
