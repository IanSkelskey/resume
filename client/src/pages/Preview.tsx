import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { exportPdf, getResume, listContacts } from '../api';
import { ContactInfo, EducationEntity, ExperienceEntity, ProjectEntity, ResumeData, Skill } from '../types';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

export default function Preview(){
  const { id } = useParams();
  const [data,setData] = useState<ResumeData|null>(null);
  const [contacts,setContacts] = useState<Array<ContactInfo & {id: number}>>([]);
  const [search] = useSearchParams();
  const pdfMode = useMemo(()=> search.get('pdf') === '1', [search]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ 
    if(id) {
      getResume(Number(id)).then(setData);
      listContacts().then(setContacts);
    }
  },[id]);

  const renderContact = (c: ContactInfo & {id: number}) => {
    const getIcon = () => {
      switch(c.type) {
        case 'email': return <MdEmail className="contact-icon" />;
        case 'phone': return <MdPhone className="contact-icon" />;
        case 'location': return <MdLocationOn className="contact-icon" />;
        case 'github': return <FaGithub className="contact-icon" />;
        case 'linkedin': return <FaLinkedin className="contact-icon" />;
        case 'website': return <FaGlobe className="contact-icon" />;
      }
    };

    const getLink = () => {
      switch(c.type) {
        case 'email':
          return <a href={`mailto:${c.value}`}>{c.value}</a>;
        case 'github':
          const githubUrl = c.value.startsWith('http') ? c.value : `https://github.com/${c.value.replace(/^(https?:\/\/(www\.)?github\.com\/|\/)/,'')}`;
          const githubDisplay = c.value.replace(/^(https?:\/\/(www\.)?github\.com\/|\/)/,'');
          return <a href={githubUrl} target="_blank" rel="noopener noreferrer">{githubDisplay}</a>;
        case 'linkedin':
          const linkedinUrl = c.value.startsWith('http') ? c.value : `https://www.linkedin.com/in/${c.value.replace(/^(https?:\/\/(www\.)?linkedin\.com\/in\/|\/)/,'')}`;
          const linkedinDisplay = c.value.replace(/^(https?:\/\/(www\.)?linkedin\.com\/in\/|\/)/,'');
          return <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">{linkedinDisplay}</a>;
        case 'website':
          const websiteUrl = c.value.startsWith('http') ? c.value : `https://${c.value}`;
          const websiteDisplay = c.value.replace(/^https?:\/\/(www\.)?/, '');
          return <a href={websiteUrl} target="_blank" rel="noopener noreferrer">{websiteDisplay}</a>;
        default:
          return <span>{c.value}</span>;
      }
    };

    return (
      <li key={c.id}>
        {getIcon()}
        {getLink()}
      </li>
    );
  };

  if(!data) return <div style={{padding:'2rem'}}>Loading...</div>

  if(pdfMode) {
    return (
      <div className="preview-wrapper" style={{padding:0}}>
        <div ref={ref} id="resume-canvas" className="resume-sheet">
          <div className="header-band">
            <h1 className="name">{data.name}</h1>
            <div className="title">{data.title}</div>
            {data.label && <div style={{marginTop:4,fontSize:12,opacity:0.85}}>{data.label}</div>}
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
                <h2>Contact</h2>
                <ul className="contact-list">{contacts.map(renderContact)}</ul>
              </section>
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
    );
  }

  return (
    <DashboardLayout>
      <div className="content-page">
        <div className="content-header">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <h1 className="content-title">Preview</h1>
              <p className="content-subtitle">Review your resume</p>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <Link to={`/edit/${id}`}><button>Edit</button></Link>
              <button onClick={()=>exportPdf(Number(id))}>Download PDF</button>
            </div>
          </div>
        </div>
        <div className="preview-wrapper">
          <div ref={ref} id="resume-canvas" className="resume-sheet">
          <div className="header-band">
            <h1 className="name">{data.name}</h1>
            <div className="title">{data.title}</div>
            {data.label && <div style={{marginTop:4,fontSize:12,opacity:0.85}}>{data.label}</div>}
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
                <h2>Contact</h2>
                <ul className="contact-list">{contacts.map(renderContact)}</ul>
              </section>
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
    </DashboardLayout>
  );
}

