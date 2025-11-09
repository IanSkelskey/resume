import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { exportPdf, getResume, listContacts, listSkills, listSkillCategories } from '../api';
import { ContactInfo, EducationEntity, ExperienceEntity, ProjectEntity, ResumeData, Skill, SkillCategory } from '../types';
import { MdEmail, MdPhone, MdLocationOn, MdHome, MdComputer } from 'react-icons/md';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import { HiOfficeBuilding } from 'react-icons/hi';
import DashboardLayout from '../components/DashboardLayout';

export default function Preview(){
  const { id } = useParams();
  const [data,setData] = useState<ResumeData|null>(null);
  const [contacts,setContacts] = useState<Array<ContactInfo & {id: number}>>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [search] = useSearchParams();
  const pdfMode = useMemo(()=> search.get('pdf') === '1', [search]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ 
    if(id) {
      Promise.all([
        getResume(Number(id)),
        listContacts(),
        listSkills(),
        listSkillCategories()
      ]).then(([resume, contactsList, skillsList, categoriesList]) => {
        setData(resume);
        setContacts(contactsList);
        setSkills(skillsList);
        setCategories(categoriesList);
        // Check for overflow after render
        setTimeout(() => {
          if (ref.current) {
            const isOverflowing = ref.current.scrollHeight > ref.current.clientHeight;
            setHasOverflow(isOverflowing);
          }
        }, 100);
      });
    }
  },[id]);

  const renderContact = (c: ContactInfo & {id: number}) => {
    const accentColor = data?.accent_color || '#8b4545';
    const getIcon = () => {
      const iconStyle = {color: accentColor};
      switch(c.type) {
        case 'email': return <MdEmail className="contact-icon" style={iconStyle} />;
        case 'phone': return <MdPhone className="contact-icon" style={iconStyle} />;
        case 'location': return <MdLocationOn className="contact-icon" style={iconStyle} />;
        case 'github': return <FaGithub className="contact-icon" style={iconStyle} />;
        case 'linkedin': return <FaLinkedin className="contact-icon" style={iconStyle} />;
        case 'website': return <FaGlobe className="contact-icon" style={iconStyle} />;
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

  const getWorkTypeIcon = (workType?: string) => {
    switch(workType) {
      case 'remote': return <MdHome className="work-type-icon" />;
      case 'on-site': return <HiOfficeBuilding className="work-type-icon" />;
      case 'hybrid': return <MdComputer className="work-type-icon" />;
      default: return null;
    }
  };

  const getWorkTypeLabel = (workType?: string) => {
    switch(workType) {
      case 'remote': return 'Remote';
      case 'on-site': return 'On-Site';
      case 'hybrid': return 'Hybrid';
      default: return '';
    }
  };

  const renderSkillsByCategory = () => {
    const selectedSkillsData = data!.skills.map(s => {
      const skillId = typeof s === 'number' ? s : (typeof s === 'object' ? (s as Skill)?.id : null);
      const skill = skillId ? skills.find(sk => sk.id === skillId) : null;
      return skill;
    }).filter(Boolean) as Skill[];

    const groupedSkills: { [categoryId: string]: Skill[] } = {};
    const uncategorized: Skill[] = [];

    selectedSkillsData.forEach(skill => {
      if (skill.category_id) {
        const catId = String(skill.category_id);
        if (!groupedSkills[catId]) groupedSkills[catId] = [];
        groupedSkills[catId].push(skill);
      } else {
        uncategorized.push(skill);
      }
    });

    const sortedCategories = categories
      .filter(cat => groupedSkills[String(cat.id!)])
      .sort((a, b) => (a.ord || 0) - (b.ord || 0));

    return (
      <div className="skills-list">
        {sortedCategories.map((cat, idx) => (
          <div key={cat.id} style={{marginBottom: idx < sortedCategories.length - 1 || uncategorized.length > 0 ? 8 : 0}}>
            <div style={{fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 3}}>{cat.name}</div>
            <div style={{fontSize: 12, lineHeight: 1.5, color: '#333'}}>
              {groupedSkills[String(cat.id!)].map(skill => skill.name).join(', ')}
            </div>
          </div>
        ))}
        {uncategorized.length > 0 && (
          <div style={{fontSize: 12, lineHeight: 1.5, color: '#333'}}>
            {uncategorized.map(skill => skill.name).join(', ')}
          </div>
        )}
      </div>
    );
  };

  if(!data) return <div style={{padding:'2rem'}}>Loading...</div>

  if(pdfMode) {
    const accentColor = data.accent_color || '#8b4545';
    return (
      <div className="preview-wrapper" style={{padding:0}}>
        <div ref={ref} id="resume-canvas" className="resume-sheet">
          <div className="header-band" style={{textAlign:'center',background:accentColor}}>
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
                      <div className="exp-head">
                        <div className="exp-head-left">
                          <div className="exp-head-title">{ex.role} – {ex.company}</div>
                          <div className="exp-head-location">
                            {ex.work_type && (
                              <span className="work-type-badge">
                                {getWorkTypeIcon(ex.work_type)}
                                {getWorkTypeLabel(ex.work_type)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="exp-head-right">
                          <span className="dates">{ex.start} – {ex.end}</span>
                          {ex.location && <span style={{fontSize:13,color:'var(--muted)'}}>{ex.location}</span>}
                        </div>
                      </div>
                      {ex.bullets?.length>0 && (
                        <ul>
                          {ex.bullets.map((b: string, j: number)=>(<li key={j}>{b}</li>))}
                        </ul>
                      )}
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
            <aside style={{background:'#f5f5f5',padding:'20px 20px'}}>
              <section>
                <h2>Contact</h2>
                <ul className="contact-list">{contacts.map(renderContact)}</ul>
              </section>
              <hr style={{border:'none',borderTop:'1px solid #d0d0d0',margin:'16px 0'}}/>
              <section>
                <h2>Skills</h2>
                <div className="skills-categories">
                  {renderSkillsByCategory()}
                </div>
              </section>
              <hr style={{border:'none',borderTop:'1px solid #d0d0d0',margin:'16px 0'}}/>
              <section>
                <h2>Education</h2>
                {data.education.map((e,i)=>{
                  const ed = (typeof e === 'number') ? null : (e as EducationEntity);
                  if(!ed) return null;
                  return (
                    <div key={i} className="edu-item">
                      <strong>{ed.degree}</strong>
                      <div className="edu-item-details">{ed.institution} • {ed.end}</div>
                    </div>
                  );
                })}
              </section>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  const statusMessage = hasOverflow ? {
    type: 'warning' as const,
    text: 'Content Overflow: Your resume content exceeds one page. Some content will be cut off in the PDF. Please edit your resume to reduce content.'
  } : null;

  return (
    <DashboardLayout statusMessage={statusMessage}>
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
          <div ref={ref} id="resume-canvas" className="resume-sheet" style={{position:'relative'}}>
          {hasOverflow && (
            <div style={{
              position:'absolute',
              bottom:8,
              right:8,
              width:32,
              height:32,
              background:'#f59e0b',
              color:'#fff',
              borderRadius:'50%',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:18,
              fontWeight:'bold',
              cursor:'help',
              boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
              zIndex:10
            }} title="Content overflow! This line marks where the page ends. Content below will be cut off in the PDF.">
              ✂
            </div>
          )}
          <div className="header-band" style={{textAlign:'center',background:data.accent_color || '#8b4545'}}>
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
                      <div className="exp-head">
                        <div className="exp-head-left">
                          <div className="exp-head-title">{ex.role} – {ex.company}</div>
                          <div className="exp-head-location">
                            {ex.work_type && (
                              <span className="work-type-badge">
                                {getWorkTypeIcon(ex.work_type)}
                                {getWorkTypeLabel(ex.work_type)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="exp-head-right">
                          <span className="dates">{ex.start} – {ex.end}</span>
                          {ex.location && <span style={{fontSize:13,color:'var(--muted)'}}>{ex.location}</span>}
                        </div>
                      </div>
                      {ex.bullets?.length>0 && (
                        <ul>
                          {ex.bullets.map((b: string, j: number)=>(<li key={j}>{b}</li>))}
                        </ul>
                      )}
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
            <aside style={{background:'#f5f5f5',padding:'20px 20px'}}>
              <section>
                <h2>Contact</h2>
                <ul className="contact-list">{contacts.map(renderContact)}</ul>
              </section>
              <hr style={{border:'none',borderTop:'1px solid #d0d0d0',margin:'16px 0'}}/>
              <section>
                <h2>Skills</h2>
                <div className="skills-categories">
                  {renderSkillsByCategory()}
                </div>
              </section>
              <hr style={{border:'none',borderTop:'1px solid #d0d0d0',margin:'16px 0'}}/>
              <section>
                <h2>Education</h2>
                {data.education.map((e,i)=>{
                  const ed = (typeof e === 'number') ? null : (e as EducationEntity);
                  if(!ed) return null;
                  return (
                    <div key={i} className="edu-item">
                      <strong>{ed.degree}</strong>
                      <div className="edu-item-details">{ed.institution} • {ed.end}</div>
                    </div>
                  );
                })}
              </section>
            </aside>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

