import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createEducation, createExperience, createProject, createSkill, getResume, listEducation, listExperiences, listProjects, listSkills, saveResume } from '../api';
import { EducationEntity, ExperienceEntity, ProjectEntity, ResumeData, Skill, emptyResume } from '../types';

export default function Edit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntity[]>([]);
  const [education, setEducation] = useState<EducationEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const isNew = useMemo(() => !id, [id]);

  useEffect(() => {
    // Load library data
    Promise.all([listSkills(), listExperiences(), listEducation(), listProjects()]).then(([sk, ex, ed, pr])=>{
      setSkills(sk); setExperiences(ex); setEducation(ed); setProjects(pr);
    });
    if(id) getResume(Number(id)).then(setData);
  },[id]);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]){
    setData(d => ({...d, [key]: value}));
  }

  function addExperience(){
    const exp: ExperienceEntity = { role:'', company:'', start:'', end:'', bullets:[] };
    update('experiences', [...data.experiences, exp]);
  }
  function addEducation(){
    const e: EducationEntity = { institution:'', degree:'', end:'' };
    update('education', [...data.education, e]);
  }
  function addProject(){
    const p: ProjectEntity = { name:'', description:'', link:'', bullets:[] };
    update('projects', [...data.projects, p]);
  }

  function move<T>(arr: T[], i: number, dir: -1 | 1){
    const j = i + dir; if(j<0 || j>=arr.length) return arr; const copy=[...arr]; const tmp=copy[i]; copy[i]=copy[j]; copy[j]=tmp; return copy;
  }

  async function onSave(){
    const saved = await saveResume(data);
    navigate(`/preview/${saved.id}`);
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Edit Resume</h1>
        <div className="actions">
          <Link to="/">Back</Link>
          <button onClick={onSave}>Save & Preview</button>
        </div>
      </header>
      <div className="editor">
        <section>
          <h3>Basics</h3>
          <label>Name<input value={data.name} onChange={e=>update('name', e.target.value)} /></label>
          <label>Title<input value={data.title} onChange={e=>update('title', e.target.value)} /></label>
          <label>Summary<textarea rows={5} value={data.summary} onChange={e=>update('summary', e.target.value)} /></label>
          <div className="card">
            <div className="section-head"><h4>Skills</h4></div>
            <div style={{display:'flex',gap:12, flexWrap:'wrap'}}>
              {skills.map(s=>{
                const selected = data.skills.some(x=> (typeof x==='object' ? (x as any).id : x) === (s.id ?? s.name) || x===s.name);
                return <label key={s.id} style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" checked={!!selected} onChange={(e)=>{
                    const current = data.skills.slice();
                    if(e.target.checked){ current.push(s); }
                    else { const idx = current.findIndex(x=> (typeof x==='object' ? (x as any).id : x) === (s.id ?? s.name) || x===s.name); if(idx>=0) current.splice(idx,1); }
                    update('skills', current);
                  }} /> {s.name}
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const f=new FormData(e.currentTarget); const name=String(f.get('name')||'').trim(); if(!name) return; const created = await createSkill(name); update('skills', [...data.skills, created]); setSkills(await listSkills()); (e.target as HTMLFormElement).reset(); }} className="row" style={{marginTop:8}}>
              <input name="name" placeholder="Add new skill"/>
              <button type="submit">Add</button>
            </form>
          </div>
        </section>

        <section>
          <div className="section-head">
            <h3>Experience</h3>
            <button onClick={addExperience}>Inline Add</button>
          </div>
          <div className="card">
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {experiences.map(ex=>{
                const isSelected = data.experiences.some(y=> (typeof y==='object'? (y as any).id : y) === ex.id);
                return <label key={ex.id} style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.experiences.slice();
                    if(e.target.checked){ current.push(ex); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === ex.id); if(idx>=0) current.splice(idx,1); }
                    update('experiences', current);
                  }} />{ex.role} – {ex.company}
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const exp: ExperienceEntity = { role:String(fd.get('role')||''), company:String(fd.get('company')||''), location:String(fd.get('location')||'')||undefined, start:String(fd.get('start')||''), end:String(fd.get('end')||''), bullets:String(fd.get('bullets')||'').split('\n').filter(Boolean)}; const created = await createExperience(exp); update('experiences', [...data.experiences, created]); setExperiences(await listExperiences()); (e.target as HTMLFormElement).reset(); }} style={{marginTop:8}} className="card">
              <div className="row"><label>Role<input name="role"/></label><label>Company<input name="company"/></label></div>
              <div className="row"><label>Location<input name="location"/></label><label>Start<input name="start"/></label><label>End<input name="end"/></label></div>
              <label>Bullets<textarea name="bullets" rows={3} placeholder="One per line"/></label>
              <button type="submit">Add Experience</button>
            </form>
          </div>

          {data.experiences.map((x,i)=> {
            const obj: ExperienceEntity = (typeof x === 'number') ? (experiences.find(e=>e.id===x) || {role:'',company:'',start:'',end:'',bullets:[]}) : x;
            return (
            <div key={i} className="card">
              <label>Role<input value={obj.role} onChange={e=>{
                const arr=[...data.experiences]; arr[i] = {...obj, role:e.target.value}; update('experiences', arr);
              }}/></label>
              <label>Company<input value={obj.company} onChange={e=>{
                const arr=[...data.experiences]; arr[i] = {...obj, company:e.target.value}; update('experiences', arr);
              }}/></label>
              <div className="row">
                <label>Start<input value={obj.start} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...obj, start:e.target.value}; update('experiences', arr);}}/></label>
                <label>End<input value={obj.end} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...obj, end:e.target.value}; update('experiences', arr);}}/></label>
              </div>
              <label>Bullets (newline separated)
                <textarea rows={4} value={obj.bullets.join('\n')} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...obj, bullets: e.target.value.split('\n').filter(Boolean)}; update('experiences', arr);}}/>
              </label>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=> update('experiences', move(data.experiences, i, -1))} type="button">↑</button>
                <button onClick={()=> update('experiences', move(data.experiences, i, +1))} type="button">↓</button>
                <button className="danger" onClick={()=>{ const arr=[...data.experiences]; arr.splice(i,1); update('experiences', arr); }} type="button">Remove</button>
              </div>
            </div>
          )})}
        </section>

        <section>
          <div className="section-head">
            <h3>Education</h3>
            <button onClick={addEducation}>Inline Add</button>
          </div>
          <div className="card">
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {education.map(ed=>{
                const isSelected = data.education.some(y=> (typeof y==='object'? (y as any).id : y) === ed.id);
                return <label key={ed.id} style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.education.slice();
                    if(e.target.checked){ current.push(ed); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === ed.id); if(idx>=0) current.splice(idx,1); }
                    update('education', current);
                  }} />{ed.degree}, {ed.institution}
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const ed: EducationEntity = { institution:String(fd.get('institution')||''), degree:String(fd.get('degree')||''), end:String(fd.get('end')||'')}; const created = await createEducation(ed); update('education', [...data.education, created]); setEducation(await listEducation()); (e.target as HTMLFormElement).reset(); }} className="row" style={{marginTop:8}}>
              <input name="institution" placeholder="Institution"/>
              <input name="degree" placeholder="Degree"/>
              <input name="end" placeholder="End"/>
              <button type="submit">Add</button>
            </form>
          </div>
          {data.education.map((e,i)=> {
            const ed: EducationEntity = (typeof e === 'number') ? (education.find(x=>x.id===e) || {institution:'', degree:'', end:''}) : e;
            return (
            <div key={i} className="card">
              <label>Institution<input value={ed.institution} onChange={ev=>{const arr=[...data.education]; arr[i] = {...ed, institution: ev.target.value}; update('education', arr)}}/></label>
              <label>Degree<input value={ed.degree} onChange={ev=>{const arr=[...data.education]; arr[i] = {...ed, degree: ev.target.value}; update('education', arr)}}/></label>
              <label>End<input value={ed.end} onChange={ev=>{const arr=[...data.education]; arr[i] = {...ed, end: ev.target.value}; update('education', arr)}}/></label>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=> update('education', move(data.education, i, -1))} type="button">↑</button>
                <button onClick={()=> update('education', move(data.education, i, +1))} type="button">↓</button>
                <button className="danger" onClick={()=>{ const arr=[...data.education]; arr.splice(i,1); update('education', arr); }} type="button">Remove</button>
              </div>
            </div>
          )})}
        </section>

        <section>
          <div className="section-head">
            <h3>Projects</h3>
            <button onClick={addProject}>Inline Add</button>
          </div>
          <div className="card">
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {projects.map(pr=>{
                const isSelected = data.projects.some(y=> (typeof y==='object'? (y as any).id : y) === pr.id);
                return <label key={pr.id} style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.projects.slice();
                    if(e.target.checked){ current.push(pr); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === pr.id); if(idx>=0) current.splice(idx,1); }
                    update('projects', current);
                  }} />{pr.name}
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const p: ProjectEntity = { name:String(fd.get('name')||''), description:String(fd.get('description')||''), link:String(fd.get('link')||''), bullets:String(fd.get('bullets')||'').split('\n').filter(Boolean)}; const created = await createProject(p); update('projects', [...data.projects, created]); setProjects(await listProjects()); (e.target as HTMLFormElement).reset(); }} className="card" style={{marginTop:8}}>
              <div className="row"><label>Name<input name="name"/></label><label>Link<input name="link" placeholder="https://..."/></label></div>
              <label>Description<textarea name="description" rows={3}/></label>
              <label>Bullets<textarea name="bullets" rows={3} placeholder="One per line"/></label>
              <button type="submit">Add Project</button>
            </form>
          </div>
          {data.projects.map((p,i)=> {
            const proj: ProjectEntity = (typeof p === 'number') ? (projects.find(x=>x.id===p) || {name:'', description:'', link:'', bullets:[]}) : p;
            return (
            <div key={i} className="card">
              <label>Name<input value={proj.name} onChange={e=>{ const arr=[...data.projects]; arr[i] = {...proj, name:e.target.value}; update('projects', arr); }}/></label>
              <label>Link<input value={proj.link||''} onChange={e=>{ const arr=[...data.projects]; arr[i] = {...proj, link:e.target.value}; update('projects', arr); }}/></label>
              <label>Description<textarea rows={3} value={proj.description||''} onChange={e=>{ const arr=[...data.projects]; arr[i] = {...proj, description:e.target.value}; update('projects', arr); }}/></label>
              <label>Bullets<textarea rows={3} value={(proj.bullets||[]).join('\n')} onChange={e=>{ const arr=[...data.projects]; arr[i] = {...proj, bullets:e.target.value.split('\n').filter(Boolean)}; update('projects', arr); }}/></label>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=> update('projects', move(data.projects, i, -1))} type="button">↑</button>
                <button onClick={()=> update('projects', move(data.projects, i, +1))} type="button">↓</button>
                <button className="danger" onClick={()=>{ const arr=[...data.projects]; arr.splice(i,1); update('projects', arr); }} type="button">Remove</button>
              </div>
            </div>
          )})}
        </section>
      </div>
    </div>
  );
}
