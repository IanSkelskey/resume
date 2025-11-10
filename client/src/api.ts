import { ResumeData, Skill, SkillCategory, ExperienceEntity, EducationEntity, ProjectEntity, ContactInfo, User } from './types';

const base = '/api';

// Authentication API functions
export async function login(username: string, password: string): Promise<User> {
  const r = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Login failed');
  }
  return r.json();
}

export async function register(username: string, password: string, email?: string): Promise<User> {
  const r = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, email })
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Registration failed');
  }
  return r.json();
}

export async function logout(): Promise<void> {
  await fetch(`${base}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const r = await fetch(`${base}/auth/me`, { credentials: 'include' });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const r = await fetch(`${base}/auth/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Password change failed');
  }
}

export async function listResumes(): Promise<ResumeData[]> {
  const r = await fetch(`${base}/resumes`, { credentials: 'include' });
  return r.json();
}

export async function getResume(id: number): Promise<ResumeData> {
  const r = await fetch(`${base}/resumes/${id}`, { credentials: 'include' });
  return r.json();
}

export async function saveResume(data: ResumeData): Promise<ResumeData> {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `${base}/resumes/${data.id}` : `${base}/resumes`;
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function deleteResume(id: number): Promise<void> {
  await fetch(`${base}/resumes/${id}`, { method: 'DELETE', credentials: 'include' });
}

export async function exportPdf(id: number) {
  const r = await fetch(`${base}/resumes/${id}/pdf`, { credentials: 'include' });
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
  const r = await fetch(`${base}/skills`, { credentials: 'include' });
  return r.json();
}
export async function createSkill(name: string, category_id?: number): Promise<Skill> {
  const r = await fetch(`${base}/skills`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({name, category_id})});
  return r.json();
}
export async function updateSkill(id: number, data: Partial<Skill>): Promise<Skill> {
  const r = await fetch(`${base}/skills/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(data)});
  return r.json();
}
export async function deleteSkill(id: number): Promise<void> {
  await fetch(`${base}/skills/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listSkillCategories(): Promise<SkillCategory[]> {
  const r = await fetch(`${base}/skill-categories`, { credentials: 'include' });
  return r.json();
}
export async function createSkillCategory(category: Omit<SkillCategory, 'id'>): Promise<SkillCategory> {
  const r = await fetch(`${base}/skill-categories`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(category)});
  return r.json();
}
export async function updateSkillCategory(id: number, category: Partial<SkillCategory>): Promise<SkillCategory> {
  const r = await fetch(`${base}/skill-categories/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(category)});
  return r.json();
}
export async function deleteSkillCategory(id: number): Promise<void> {
  await fetch(`${base}/skill-categories/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listExperiences(): Promise<ExperienceEntity[]> {
  const r = await fetch(`${base}/experiences`, { credentials: 'include' });
  return r.json();
}
export async function createExperience(exp: ExperienceEntity): Promise<ExperienceEntity> {
  const r = await fetch(`${base}/experiences`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(exp)});
  return r.json();
}
export async function updateExperience(id: number, exp: ExperienceEntity): Promise<ExperienceEntity> {
  const r = await fetch(`${base}/experiences/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(exp)});
  return r.json();
}
export async function deleteExperience(id: number): Promise<void> {
  await fetch(`${base}/experiences/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listEducation(): Promise<EducationEntity[]> {
  const r = await fetch(`${base}/education`, { credentials: 'include' });
  return r.json();
}
export async function createEducation(e: EducationEntity): Promise<EducationEntity> {
  const r = await fetch(`${base}/education`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(e)});
  return r.json();
}
export async function deleteEducation(id: number): Promise<void> {
  await fetch(`${base}/education/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listProjects(): Promise<ProjectEntity[]> {
  const r = await fetch(`${base}/projects`, { credentials: 'include' });
  return r.json();
}
export async function createProject(p: ProjectEntity): Promise<ProjectEntity> {
  const r = await fetch(`${base}/projects`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(p)});
  return r.json();
}
export async function updateProject(id: number, p: ProjectEntity): Promise<ProjectEntity> {
  const r = await fetch(`${base}/projects/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(p)});
  return r.json();
}
export async function deleteProject(id: number): Promise<void> {
  await fetch(`${base}/projects/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listSocials(): Promise<{id: number; label: string; url: string}[]> {
  const r = await fetch(`${base}/socials`, { credentials: 'include' });
  return r.json();
}
export async function createSocial(social: {label: string; url: string}): Promise<{id: number; label: string; url: string}> {
  const r = await fetch(`${base}/socials`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(social)});
  return r.json();
}
export async function deleteSocial(id: number): Promise<void> {
  await fetch(`${base}/socials/${id}`, { method:'DELETE', credentials: 'include' });
}

export async function listContacts(): Promise<Array<ContactInfo & {id: number}>> {
  const r = await fetch(`${base}/contacts`, { credentials: 'include' });
  return r.json();
}
export async function createContact(contact: ContactInfo): Promise<ContactInfo & {id: number}> {
  const r = await fetch(`${base}/contacts`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(contact)});
  return r.json();
}
export async function updateContact(id: number, contact: ContactInfo): Promise<void> {
  await fetch(`${base}/contacts/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(contact)});
}
export async function deleteContact(id: number): Promise<void> {
  await fetch(`${base}/contacts/${id}`, { method:'DELETE', credentials: 'include' });
}

// Database admin endpoints
export async function getTableNames(): Promise<string[]> {
  const r = await fetch(`${base}/db/tables`, { credentials: 'include' });
  return r.json();
}

export async function getTableSchema(tableName: string): Promise<any[]> {
  const r = await fetch(`${base}/db/tables/${tableName}/schema`, { credentials: 'include' });
  return r.json();
}

export async function getTableRecords(tableName: string): Promise<any[]> {
  const r = await fetch(`${base}/db/tables/${tableName}/records`, { credentials: 'include' });
  return r.json();
}

export async function createTableRecord(tableName: string, data: any): Promise<{success: boolean; id: number}> {
  const r = await fetch(`${base}/db/tables/${tableName}/records`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function updateTableRecord(tableName: string, id: number, data: any): Promise<{success: boolean}> {
  const r = await fetch(`${base}/db/tables/${tableName}/records/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function deleteTableRecord(tableName: string, id: number): Promise<{success: boolean}> {
  const r = await fetch(`${base}/db/tables/${tableName}/records/${id}`, { method: 'DELETE', credentials: 'include' });
  return r.json();
}
