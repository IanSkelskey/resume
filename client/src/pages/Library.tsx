import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createContact, createEducation, createExperience, createProject, createSkill, createSocial, listContacts, listEducation, listExperiences, listProjects, listSkills, listSocials } from '../api';
import { ContactInfo, EducationEntity, ExperienceEntity, ProjectEntity, Skill } from '../types';

export default function Library(){
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntity[]>([]);
  const [education, setEducation] = useState<EducationEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [socials, setSocials] = useState<{id: number; label: string; url: string}[]>([]);
  const [contacts, setContacts] = useState<Array<ContactInfo & {id: number}>>([]);

  useEffect(()=>{ refresh(); },[]);
  async function refresh(){
    const [sk, ex, ed, pr, so, ct] = await Promise.all([listSkills(), listExperiences(), listEducation(), listProjects(), listSocials(), listContacts()]);
    setSkills(sk); setExperiences(ex); setEducation(ed); setProjects(pr); setSocials(so); setContacts(ct);
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
  async function addSocial(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const social = { label: String(fd.get('label')||''), url: String(fd.get('url')||'') };
    if(!social.label || !social.url) return;
    await createSocial(social); e.currentTarget.reset(); refresh();
  }
  async function addContact(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const contact: ContactInfo = {
      email: String(fd.get('email')||'') || undefined,
      phone: String(fd.get('phone')||'') || undefined,
      website: String(fd.get('website')||'') || undefined,
      linkedin: String(fd.get('linkedin')||'') || undefined,
      github: String(fd.get('github')||'') || undefined,
      location: String(fd.get('location')||'') || undefined
    };
    await createContact(contact); e.currentTarget.reset(); refresh();
  }

  return (
    <div className="content-page">
      <div className="content-header">
        <h1 className="content-title">Library</h1>
        <p className="content-subtitle">Manage your reusable resume components</p>
      </div>
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

        <section>
          <h3>Contact Info</h3>
          <form onSubmit={addContact} className="card">
            <div className="row">
              <label>Email<input name="email" type="email"/></label>
              <label>Phone<input name="phone"/></label>
            </div>
            <div className="row">
              <label>LinkedIn<input name="linkedin" placeholder="username or full URL"/></label>
              <label>GitHub<input name="github" placeholder="username or full URL"/></label>
            </div>
            <div className="row">
              <label>Website<input name="website"/></label>
              <label>Location<input name="location"/></label>
            </div>
            <button type="submit">Add Contact Info</button>
          </form>
          <ul>
            {contacts.map(c=> (
              <li key={c.id}>
                {c.email && <span>📧 {c.email} </span>}
                {c.phone && <span>📞 {c.phone} </span>}
                {c.location && <span>📍 {c.location} </span>}
                {c.github && <span>GitHub: {c.github} </span>}
                {c.linkedin && <span>LinkedIn: {c.linkedin} </span>}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Social Links</h3>
          <form onSubmit={addSocial} className="card">
            <div className="row">
              <label>Label<input name="label" placeholder="e.g., LinkedIn"/></label>
              <label>URL<input name="url" placeholder="https://..."/></label>
            </div>
            <button type="submit">Add Social Link</button>
          </form>
          <ul>
            {socials.map(s=> (<li key={s.id}><strong>{s.label}</strong>: {s.url}</li>))}
          </ul>
        </section>
      </div>
    </div>
  );
}
