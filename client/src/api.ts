import { ResumeData, Skill, ExperienceEntity, EducationEntity, ProjectEntity, ContactInfo } from './types';

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

export async function listSocials(): Promise<{id: number; label: string; url: string}[]> {
  const r = await fetch(`${base}/socials`);
  return r.json();
}
export async function createSocial(social: {label: string; url: string}): Promise<{id: number; label: string; url: string}> {
  const r = await fetch(`${base}/socials`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(social)});
  return r.json();
}

export async function listContacts(): Promise<Array<ContactInfo & {id: number}>> {
  const r = await fetch(`${base}/contacts`);
  return r.json();
}
export async function createContact(contact: ContactInfo): Promise<ContactInfo & {id: number}> {
  const r = await fetch(`${base}/contacts`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(contact)});
  return r.json();
}
