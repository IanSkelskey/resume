import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { exportPdf, getResume } from '../api';
import { EducationEntity, ExperienceEntity, ProjectEntity, ResumeData, Skill } from '../types';

export default function Preview(){
  const { id } = useParams();
  const [data,setData] = useState<ResumeData|null>(null);
  const [search] = useSearchParams();
  const pdfMode = useMemo(()=> search.get('pdf') === '1', [search]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(id) getResume(Number(id)).then(setData); },[id]);

  if(!data) return <div style={{padding:'2rem'}}>Loading...</div>

  return (
    <div className="page">
      {!pdfMode && (
        <header className="topbar">
          <h1>Preview</h1>
          <div className="actions">
            <Link to={`/edit/${id}`}>Edit</Link>
            <button onClick={()=>exportPdf(Number(id))}>Download PDF</button>
            <Link to="/">Home</Link>
          </div>
        </header>
      )}
      <div className="preview-wrapper" style={pdfMode ? {padding:0} : undefined}>
        <div ref={ref} id="resume-canvas" className="resume-sheet">
          <div className="header-band">
            <h1 className="name">{data.name}</h1>
            <div className="title">{data.title}</div>
          </div>
          <div className="columns">
            <main>
              <section>
                <h2>Summary</h2>
                <p className="summary-text">{data.summary}</p>
              </section>
              <section>
                <h2>Experience</h2>
                {data.experiences.map((x,i)=>{
                  const ex = (typeof x === 'number') ? null : (x as ExperienceEntity);
                  if(!ex) return null;
                  return (
                    <div key={i} className="exp-item">
                      <div className="exp-head"><strong>{ex.role}</strong> – {ex.company} <span className="dates">{ex.start} – {ex.end}</span></div>
                      {ex.bullets?.length>0 && (
                        <ul>
                          {ex.bullets.map((b: string, j: number)=>(<li key={j}>{b}</li>))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </section>
              <section>
                <h2>Education</h2>
                {data.education.map((e,i)=>{
                  const ed = (typeof e === 'number') ? null : (e as EducationEntity);
                  if(!ed) return null;
                  return (
                    <div key={i} className="edu-item">
                      <div><strong>{ed.degree}</strong>, {ed.institution} ({ed.end})</div>
                    </div>
                  );
                })}
              </section>
              {data.projects && data.projects.length>0 && (
                <section>
                  <h2>Projects</h2>
                  {data.projects.map((p,i)=>{
                    const pr = (typeof p === 'number') ? null : (p as ProjectEntity);
                    if(!pr) return null;
                    return (
                      <div key={i} className="proj-item">
                        <div className="exp-head"><strong>{pr.name}</strong>{pr.link ? ` – ${pr.link}` : ''}</div>
                        {pr.description && <p className="summary-text">{pr.description}</p>}
                        {pr.bullets?.length>0 && (
                          <ul>
                            {pr.bullets.map((b: string, j: number)=>(<li key={j}>{b}</li>))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}
            </main>
            <aside>
              <section>
                <h2>Skills</h2>
                <ul className="skills">
                  {data.skills.map((s,i)=>{
                    const label = typeof s === 'string' ? s : typeof s === 'number' ? String(s) : (s as Skill).name;
                    return (<li key={i}>{label}</li>);
                  })}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
