import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getResume, saveResume } from '../api';
import { EducationItem, ExperienceItem, ResumeData, emptyResume } from '../types';

export default function Edit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const isNew = useMemo(() => !id, [id]);

  useEffect(() => {
    if(!id) return;
    getResume(Number(id)).then(setData);
  },[id]);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]){
    setData(d => ({...d, [key]: value}));
  }

  function addExperience(){
    const exp: ExperienceItem = { role:'', company:'', start:'', end:'', bullets:[] };
    update('experiences', [...data.experiences, exp]);
  }
  function addEducation(){
    const e: EducationItem = { institution:'', degree:'', end:'' };
    update('education', [...data.education, e]);
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
          <label>Skills (comma separated)<input value={data.skills.join(', ')} onChange={e=>update('skills', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} /></label>
        </section>

        <section>
          <div className="section-head">
            <h3>Experience</h3>
            <button onClick={addExperience}>Add</button>
          </div>
          {data.experiences.map((x,i)=> (
            <div key={i} className="card">
              <label>Role<input value={x.role} onChange={e=>{
                const arr=[...data.experiences]; arr[i] = {...x, role:e.target.value}; update('experiences', arr);
              }}/></label>
              <label>Company<input value={x.company} onChange={e=>{
                const arr=[...data.experiences]; arr[i] = {...x, company:e.target.value}; update('experiences', arr);
              }}/></label>
              <div className="row">
                <label>Start<input value={x.start} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...x, start:e.target.value}; update('experiences', arr);}}/></label>
                <label>End<input value={x.end} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...x, end:e.target.value}; update('experiences', arr);}}/></label>
              </div>
              <label>Bullets (newline separated)
                <textarea rows={4} value={x.bullets.join('\n')} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...x, bullets: e.target.value.split('\n').filter(Boolean)}; update('experiences', arr);}}/>
              </label>
              <button className="danger" onClick={()=>{ const arr=[...data.experiences]; arr.splice(i,1); update('experiences', arr); }}>Remove</button>
            </div>
          ))}
        </section>

        <section>
          <div className="section-head">
            <h3>Education</h3>
            <button onClick={addEducation}>Add</button>
          </div>
          {data.education.map((e,i)=> (
            <div key={i} className="card">
              <label>Institution<input value={e.institution} onChange={ev=>{const arr=[...data.education]; arr[i] = {...e, institution: ev.target.value}; update('education', arr)}}/></label>
              <label>Degree<input value={e.degree} onChange={ev=>{const arr=[...data.education]; arr[i] = {...e, degree: ev.target.value}; update('education', arr)}}/></label>
              <label>End<input value={e.end} onChange={ev=>{const arr=[...data.education]; arr[i] = {...e, end: ev.target.value}; update('education', arr)}}/></label>
              <button className="danger" onClick={()=>{ const arr=[...data.education]; arr.splice(i,1); update('education', arr); }}>Remove</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
