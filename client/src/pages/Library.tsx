import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createEducation, createExperience, createProject, createSkill, listEducation, listExperiences, listProjects, listSkills } from '../api';
import { EducationEntity, ExperienceEntity, ProjectEntity, Skill } from '../types';

export default function Library(){
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntity[]>([]);
  const [education, setEducation] = useState<EducationEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);

  useEffect(()=>{ refresh(); },[]);
  async function refresh(){
    const [sk, ex, ed, pr] = await Promise.all([listSkills(), listExperiences(), listEducation(), listProjects()]);
    setSkills(sk); setExperiences(ex); setEducation(ed); setProjects(pr);
  }

  async function addSkill(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget); const name = String(fd.get('name')||'').trim(); if(!name) return;
    await createSkill(name); e.currentTarget.reset(); refresh();
  }
  async function addExperience(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const exp: ExperienceEntity = {
      role: String(fd.get('role')||''), company: String(fd.get('company')||''), location: String(fd.get('location')||'') || undefined,
      start: String(fd.get('start')||''), end: String(fd.get('end')||''), bullets: String(fd.get('bullets')||'').split('\n').filter(Boolean)
    };
    await createExperience(exp); e.currentTarget.reset(); refresh();
  }
  async function addEducation(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const ed = { institution: String(fd.get('institution')||''), degree: String(fd.get('degree')||''), end: String(fd.get('end')||'') };
    await createEducation(ed); e.currentTarget.reset(); refresh();
  }
  async function addProject(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const p: ProjectEntity = { name: String(fd.get('name')||''), description: String(fd.get('description')||''), link: String(fd.get('link')||''), bullets: String(fd.get('bullets')||'').split('\n').filter(Boolean) };
    await createProject(p); e.currentTarget.reset(); refresh();
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Library</h1>
        <div className="actions"><Link to="/">Home</Link></div>
      </header>
      <div className="editor" style={{maxWidth:1100}}>
        <section>
          <h3>Skills</h3>
          <form onSubmit={addSkill} className="row">
            <input name="name" placeholder="New skill" />
            <button type="submit">Add</button>
          </form>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
            {skills.map(s=> <span key={s.id} className="skills-pill">{s.name}</span>)}
          </div>
        </section>

        <section>
          <h3>Experiences</h3>
          <form onSubmit={addExperience} className="card">
            <label>Role<input name="role"/></label>
            <label>Company<input name="company"/></label>
            <div className="row"><label>Location<input name="location"/></label><label>Start<input name="start"/></label><label>End<input name="end"/></label></div>
            <label>Bullets<textarea name="bullets" rows={4} placeholder="One per line"/></label>
            <button type="submit">Add Experience</button>
          </form>
          <ul>
            {experiences.map(e=> (
              <li key={e.id}><strong>{e.role}</strong> – {e.company} ({e.start}–{e.end})</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Education</h3>
          <form onSubmit={addEducation} className="row">
            <input name="institution" placeholder="Institution"/>
            <input name="degree" placeholder="Degree"/>
            <input name="end" placeholder="End"/>
            <button type="submit">Add</button>
          </form>
          <ul>
            {education.map(e=> (<li key={e.id}><strong>{e.degree}</strong>, {e.institution} ({e.end})</li>))}
          </ul>
        </section>

        <section>
          <h3>Projects</h3>
          <form onSubmit={addProject} className="card">
            <label>Name<input name="name"/></label>
            <label>Description<textarea name="description" rows={3}/></label>
            <div className="row"><label>Link<input name="link" placeholder="https://..."/></label></div>
            <label>Bullets<textarea name="bullets" rows={4} placeholder="One per line"/></label>
            <button type="submit">Add Project</button>
          </form>
          <ul>
            {projects.map(p=> (<li key={p.id}><strong>{p.name}</strong> {p.link ? `( ${p.link} )` : ''}</li>))}
          </ul>
        </section>
      </div>
    </div>
  );
}
