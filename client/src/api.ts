import { ResumeData } from './types';

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
