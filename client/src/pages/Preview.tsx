import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { exportPdf, getResume } from '../api';
import { ResumeData } from '../types';

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
                {data.experiences.map((x,i)=>(
                  <div key={i} className="exp-item">
                    <div className="exp-head"><strong>{x.role}</strong> – {x.company} <span className="dates">{x.start} – {x.end}</span></div>
                    <ul>
                      {x.bullets.map((b,j)=>(<li key={j}>{b}</li>))}
                    </ul>
                  </div>
                ))}
              </section>
              <section>
                <h2>Education</h2>
                {data.education.map((e,i)=>(
                  <div key={i} className="edu-item">
                    <div><strong>{e.degree}</strong>, {e.institution} ({e.end})</div>
                  </div>
                ))}
              </section>
            </main>
            <aside>
              <section>
                <h2>Skills</h2>
                <ul className="skills">
                  {data.skills.map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
