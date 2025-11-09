import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createContact, createEducation, createExperience, createProject, createSkill, createSocial, getResume, listContacts, listEducation, listExperiences, listProjects, listSkills, listSkillCategories, listSocials, saveResume } from '../api';
import { ContactInfo, EducationEntity, ExperienceEntity, ProjectEntity, ResumeData, Skill, SkillCategory, SocialLink, emptyResume } from '../types';
import DashboardLayout from '../components/DashboardLayout';

export default function Edit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntity[]>([]);
  const [education, setEducation] = useState<EducationEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [contacts, setContacts] = useState<Array<ContactInfo & {id: number}>>([]);
  const [socials, setSocials] = useState<Array<{id: number; label: string; url: string}>>([]);
  const [hasOverflow, setHasOverflow] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const isNew = useMemo(() => !id, [id]);

  useEffect(() => {
    // Load library data
    Promise.all([listSkills(), listSkillCategories(), listExperiences(), listEducation(), listProjects(), listContacts(), listSocials()]).then(([sk, cat, ex, ed, pr, ct, so])=>{
      setSkills(sk); setCategories(cat); setExperiences(ex); setEducation(ed); setProjects(pr); setContacts(ct); setSocials(so);
    });
    if(id) getResume(Number(id)).then(setData);
  },[id]);

  // Check for overflow whenever data changes
  useEffect(() => {
    const checkOverflow = () => {
      // Rough estimation: 1100px is approximately one page height
      const estimatedHeight = 
        200 + // header
        (data.summary?.length || 0) * 0.2 + // summary
        (data.experiences?.length || 0) * 150 + // experiences
        (data.education?.length || 0) * 40 + // education
        (data.projects?.length || 0) * 120; // projects
      setHasOverflow(estimatedHeight > 1100);
    };
    checkOverflow();
  }, [data]);

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

  const statusMessage = hasOverflow ? {
    type: 'warning' as const,
    text: 'Content Overflow Warning: Your resume content may exceed one page. Consider reducing content to ensure everything fits in the PDF.'
  } : null;

  return (
    <DashboardLayout statusMessage={statusMessage}>
    <div className="content-page">
      <div className="content-header">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <h1 className="content-title">{isNew ? 'Create Resume' : 'Edit Resume'}</h1>
            <p className="content-subtitle">Build and customize your resume</p>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={onSave}>Save & Preview</button>
          </div>
        </div>
      </div>
      <div className="editor" style={{maxWidth:900,margin:'0 auto'}}>
        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h3 style={{marginTop:0,marginBottom:20,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Basic Information</h3>
          <div style={{display:'grid',gap:16}}>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Full Name *</div>
              <input value={data.name} onChange={e=>update('name', e.target.value)} style={{width:'100%'}} placeholder="John Doe" />
            </label>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Resume Label <span style={{fontWeight:400,color:'#888',fontSize:13}}>(optional - for your reference)</span></div>
              <input value={data.label||''} onChange={e=>update('label', e.target.value)} placeholder="e.g., Backend Engineer – ACME Corp" style={{width:'100%'}}/>
            </label>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Professional Title *</div>
              <input value={data.title} onChange={e=>update('title', e.target.value)} style={{width:'100%'}} placeholder="Software Engineer" />
            </label>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Accent Color</div>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <input type="color" value={data.accent_color || '#8b4545'} onChange={e=>update('accent_color', e.target.value)} style={{width:60,height:40,cursor:'pointer',border:'1px solid #ddd',borderRadius:4}}/>
                <input type="text" value={data.accent_color || '#8b4545'} onChange={e=>update('accent_color', e.target.value)} placeholder="#8b4545" style={{flex:1,fontFamily:'monospace'}}/>
              </div>
            </label>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Professional Summary *</div>
              <textarea rows={5} value={data.summary} onChange={e=>update('summary', e.target.value)} style={{width:'100%',resize:'vertical'}} placeholder="Write a compelling summary of your professional background and key strengths..."/>
            </label>
          </div>
          <div style={{marginTop:20,padding:16,background:'#f8f9fa',borderRadius:8,border:'1px solid #e1e4e8'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <h4 style={{margin:0,fontSize:16,fontWeight:600,color:'#1a1a1a'}}>Contact Information</h4>
              <Link to="/library" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',background:'#0066cc',color:'white',textDecoration:'none',borderRadius:4,fontSize:13,fontWeight:500}}>
                <span>✏️</span> Manage in Library
              </Link>
            </div>
            <p style={{fontSize:13,color:'#666',marginBottom:12,lineHeight:1.5}}>
              All contact details from your library will appear on your resume. Visit the Library tab to add, edit, or remove contacts.
            </p>
            {contacts.length === 0 ? (
              <div style={{padding:20,background:'white',borderRadius:6,border:'1px dashed #d1d5db',textAlign:'center',color:'#888'}}>
                <div style={{fontSize:32,marginBottom:8}}>📋</div>
                <div style={{fontSize:14}}>No contacts added yet</div>
                <div style={{fontSize:12,marginTop:4}}>Click "Manage in Library" to add your contact details</div>
              </div>
            ) : (
              <div style={{display:'grid',gap:8}}>
                {contacts.map(c=>{
                  const icons: Record<string, string> = { email: '📧', phone: '📞', location: '📍', linkedin: '💼', github: '🐙', website: '🌐' };
                  return (
                    <div key={c.id} style={{padding:10,background:'white',borderRadius:6,border:'1px solid #e1e4e8',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:18}}>{icons[c.type]}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,textTransform:'uppercase',color:'#666',fontWeight:500,letterSpacing:'0.5px'}}>{c.type}</div>
                        <div style={{fontSize:14,color:'#1a1a1a',marginTop:2}}>{c.value}</div>
                      </div>
                      {c.label && <span style={{fontSize:12,color:'#666',background:'#f0f0f0',padding:'2px 8px',borderRadius:3}}>{c.label}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h3 style={{marginTop:0,marginBottom:20,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Social Links</h3>
            <div style={{marginBottom:8}}>
              <strong>Select from library:</strong>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                {socials.map(s=>(
                  <button key={s.id} type="button" onClick={()=> update('socials', [...(data.socials||[]), s])} style={{fontSize:12}}>
                    {s.label}: {s.url}
                  </button>
                ))}
              </div>
            </div>
            {(data.socials||[]).map((s,i)=> (
              <div key={i} className="row" style={{alignItems:'end'}}>
                <label>Label<input value={s.label} onChange={e=>{ const arr=[...(data.socials||[])]; arr[i] = {...s, label:e.target.value}; update('socials', arr as SocialLink[]); }}/></label>
                <label>URL<input value={s.url} onChange={e=>{ const arr=[...(data.socials||[])]; arr[i] = {...s, url:e.target.value}; update('socials', arr as SocialLink[]); }}/></label>
                <button className="danger" onClick={()=>{ const arr=[...(data.socials||[])]; arr.splice(i,1); update('socials', arr as SocialLink[]); }} type="button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={()=> update('socials', [ ...(data.socials||[]), { label:'', url:'' } ])}>Add Inline</button>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const social = { label:String(fd.get('newLabel')||''), url:String(fd.get('newUrl')||'') }; if(!social.label || !social.url) return; const created = await createSocial(social); update('socials', [...(data.socials||[]), created]); setSocials(await listSocials()); (e.target as HTMLFormElement).reset(); }} style={{marginTop:8,padding:8,border:'1px solid #ddd',borderRadius:6}}>
              <strong>Or add new to library:</strong>
              <div className="row" style={{marginTop:8}}>
                <input name="newLabel" placeholder="Label"/>
                <input name="newUrl" placeholder="URL"/>
                <button type="submit">Add & Use</button>
              </div>
            </form>
        </section>

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h3 style={{marginTop:0,marginBottom:20,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Skills</h3>
          <div style={{marginBottom:16}}>
            {categories.map(cat => {
              const categorySkills = skills.filter(s => s.category_id === cat.id);
              if (categorySkills.length === 0) return null;
              return (
                <div key={cat.id} style={{marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:600,color:'#555',marginBottom:8}}>{cat.name}</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {categorySkills.map(s=>{
                      const selected = data.skills.some(x=> {
                        const xId = typeof x==='object' ? (x as any).id : (typeof x === 'number' ? x : null);
                        return xId === s.id || x === s.name;
                      });
                      return <label key={s.id} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',background:selected?'#e6f2ff':'#f5f5f5',border:selected?'1px solid #0066cc':'1px solid #ddd',borderRadius:6,cursor:'pointer',fontSize:14,transition:'all 0.2s'}}>
                        <input type="checkbox" checked={!!selected} onChange={(e)=>{
                          const current = data.skills.slice();
                          if(e.target.checked){ 
                            current.push(s.id!); 
                          } else { 
                            const idx = current.findIndex(x=> {
                              const xId = typeof x==='object' ? (x as any).id : (typeof x === 'number' ? x : null);
                              return xId === s.id || x === s.name;
                            }); 
                            if(idx>=0) current.splice(idx,1); 
                          }
                          update('skills', current);
                        }} style={{cursor:'pointer'}}/> <span style={{color:selected?'#0066cc':'#333'}}>{s.name}</span>
                      </label>
                    })}
                  </div>
                </div>
              );
            })}
            {skills.filter(s => !s.category_id).length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:14,fontWeight:600,color:'#555',marginBottom:8}}>Uncategorized</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {skills.filter(s => !s.category_id).map(s=>{
                    const selected = data.skills.some(x=> {
                      const xId = typeof x==='object' ? (x as any).id : (typeof x === 'number' ? x : null);
                      return xId === s.id || x === s.name;
                    });
                    return <label key={s.id} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',background:selected?'#e6f2ff':'#f5f5f5',border:selected?'1px solid #0066cc':'1px solid #ddd',borderRadius:6,cursor:'pointer',fontSize:14,transition:'all 0.2s'}}>
                      <input type="checkbox" checked={!!selected} onChange={(e)=>{
                        const current = data.skills.slice();
                        if(e.target.checked){ 
                          current.push(s.id!); 
                        } else { 
                          const idx = current.findIndex(x=> {
                            const xId = typeof x==='object' ? (x as any).id : (typeof x === 'number' ? x : null);
                            return xId === s.id || x === s.name;
                          }); 
                          if(idx>=0) current.splice(idx,1); 
                        }
                        update('skills', current);
                      }} style={{cursor:'pointer'}}/> <span style={{color:selected?'#0066cc':'#333'}}>{s.name}</span>
                    </label>
                  })}
                </div>
              </div>
            )}
          </div>
          <form onSubmit={async (e)=>{ e.preventDefault(); const f=new FormData(e.currentTarget); const name=String(f.get('name')||'').trim(); if(!name) return; const created = await createSkill(name); update('skills', [...data.skills, created.id!]); setSkills(await listSkills()); (e.target as HTMLFormElement).reset(); }} style={{display:'flex',gap:8,marginTop:12}}>
            <input name="name" placeholder="Add new skill to library" style={{flex:1}}/>
            <button type="submit">Add Skill</button>
          </form>
        </section>

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h3 style={{marginTop:0,marginBottom:20,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Custom Sidebar Section</h3>
          <p style={{fontSize:13,color:'#666',marginBottom:16,lineHeight:1.5}}>Add an optional custom section that will appear in the sidebar between Skills and Education.</p>
          <div style={{display:'grid',gap:16}}>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Section Title <span style={{fontWeight:400,color:'#888',fontSize:13}}>(optional)</span></div>
              <input value={data.sidebar_title||''} onChange={e=>update('sidebar_title', e.target.value)} style={{width:'100%'}} placeholder="e.g., Certifications, Awards, Languages" />
            </label>
            <label style={{display:'block'}}>
              <div style={{fontWeight:500,marginBottom:6,color:'#444'}}>Section Content <span style={{fontWeight:400,color:'#888',fontSize:13}}>(optional)</span></div>
              <textarea rows={4} value={data.sidebar_text||''} onChange={e=>update('sidebar_text', e.target.value)} style={{width:'100%',resize:'vertical'}} placeholder="Add your custom content here..."/>
            </label>
          </div>
        </section>

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3 style={{margin:0,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Work Experience</h3>
            <button onClick={addExperience} style={{padding:'6px 12px',fontSize:13}}>+ Add New</button>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:500,color:'#666',marginBottom:8}}>Select from library:</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {experiences.map(ex=>{
                const isSelected = data.experiences.some(y=> (typeof y==='object'? (y as any).id : y) === ex.id);
                return <label key={ex.id} style={{display:'inline-flex',alignItems:'flex-start',gap:8,padding:10,background:isSelected?'#e6f2ff':'#f8f9fa',border:isSelected?'1px solid #0066cc':'1px solid #e1e4e8',borderRadius:6,cursor:'pointer',maxWidth:300,fontSize:13,transition:'all 0.2s'}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.experiences.slice();
                    if(e.target.checked){ current.push(ex); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === ex.id); if(idx>=0) current.splice(idx,1); }
                    update('experiences', current);
                  }} style={{cursor:'pointer',marginTop:2}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:isSelected?'#0066cc':'#1a1a1a'}}>{ex.role}</div>
                    <div style={{fontSize:12,color:'#666'}}>{ex.company} • {ex.start} - {ex.end}</div>
                  </div>
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const exp: ExperienceEntity = { role:String(fd.get('role')||''), company:String(fd.get('company')||''), location:String(fd.get('location')||'')||undefined, work_type:(fd.get('work_type') as 'remote'|'on-site'|'hybrid')||undefined, start:String(fd.get('start')||''), end:String(fd.get('end')||''), bullets:String(fd.get('bullets')||'').split('\n').filter(Boolean)}; const created = await createExperience(exp); update('experiences', [...data.experiences, created]); setExperiences(await listExperiences()); (e.target as HTMLFormElement).reset(); }} style={{marginTop:16,padding:16,background:'#f8f9fa',borderRadius:8,border:'1px solid #e1e4e8'}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1a1a1a'}}>Quick add to library:</div>
              <div style={{display:'grid',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr',gap:8}}>
                  <input name="role" placeholder="Role *" required style={{fontSize:13}}/>
                  <input name="company" placeholder="Company *" required style={{fontSize:13}}/>
                  <input name="location" placeholder="Location" style={{fontSize:13}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 100px',gap:8}}>
                  <input name="start" placeholder="Start (e.g., Jan 2020)" required style={{fontSize:13}}/>
                  <input name="end" placeholder="End (e.g., Present)" required style={{fontSize:13}}/>
                  <select name="work_type" style={{fontSize:13}}>
                    <option value="">Work Type</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <button type="submit" style={{fontSize:13}}>Add</button>
                </div>
              </div>
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
                <label>Location<input value={obj.location||''} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...obj, location:e.target.value}; update('experiences', arr);}}/></label>
                <label>Work Type<select value={obj.work_type||''} onChange={e=>{const arr=[...data.experiences]; arr[i] = {...obj, work_type:e.target.value as 'remote'|'on-site'|'hybrid'||undefined}; update('experiences', arr);}}>
                  <option value="">--</option>
                  <option value="remote">Remote</option>
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select></label>
              </div>
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

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3 style={{margin:0,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Education</h3>
            <button onClick={addEducation} style={{padding:'6px 12px',fontSize:13}}>+ Add New</button>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:500,color:'#666',marginBottom:8}}>Select from library:</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {education.map(ed=>{
                const isSelected = data.education.some(y=> (typeof y==='object'? (y as any).id : y) === ed.id);
                return <label key={ed.id} style={{display:'inline-flex',alignItems:'flex-start',gap:8,padding:10,background:isSelected?'#e6f2ff':'#f8f9fa',border:isSelected?'1px solid #0066cc':'1px solid #e1e4e8',borderRadius:6,cursor:'pointer',maxWidth:300,fontSize:13,transition:'all 0.2s'}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.education.slice();
                    if(e.target.checked){ current.push(ed); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === ed.id); if(idx>=0) current.splice(idx,1); }
                    update('education', current);
                  }} style={{cursor:'pointer',marginTop:2}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:isSelected?'#0066cc':'#1a1a1a'}}>{ed.degree}</div>
                    <div style={{fontSize:12,color:'#666'}}>{ed.institution} • {ed.end}</div>
                  </div>
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const ed: EducationEntity = { institution:String(fd.get('institution')||''), degree:String(fd.get('degree')||''), end:String(fd.get('end')||'')}; const created = await createEducation(ed); update('education', [...data.education, created]); setEducation(await listEducation()); (e.target as HTMLFormElement).reset(); }} style={{marginTop:16,padding:16,background:'#f8f9fa',borderRadius:8,border:'1px solid #e1e4e8'}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1a1a1a'}}>Quick add to library:</div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 100px',gap:8}}>
                <input name="institution" placeholder="Institution *" required style={{fontSize:13}}/>
                <input name="degree" placeholder="Degree *" required style={{fontSize:13}}/>
                <input name="end" placeholder="Year" required style={{fontSize:13}}/>
                <button type="submit" style={{fontSize:13}}>Add</button>
              </div>
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

        <section style={{background:'white',padding:24,borderRadius:8,marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3 style={{margin:0,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>Projects</h3>
            <button onClick={addProject} style={{padding:'6px 12px',fontSize:13}}>+ Add New</button>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:500,color:'#666',marginBottom:8}}>Select from library:</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {projects.map(pr=>{
                const isSelected = data.projects.some(y=> (typeof y==='object'? (y as any).id : y) === pr.id);
                return <label key={pr.id} style={{display:'inline-flex',alignItems:'flex-start',gap:8,padding:10,background:isSelected?'#e6f2ff':'#f8f9fa',border:isSelected?'1px solid #0066cc':'1px solid #e1e4e8',borderRadius:6,cursor:'pointer',maxWidth:300,fontSize:13,transition:'all 0.2s'}}>
                  <input type="checkbox" checked={!!isSelected} onChange={(e)=>{
                    const current = data.projects.slice();
                    if(e.target.checked){ current.push(pr); }
                    else { const idx=current.findIndex(y=> (typeof y==='object'? (y as any).id : y) === pr.id); if(idx>=0) current.splice(idx,1); }
                    update('projects', current);
                  }} style={{cursor:'pointer',marginTop:2}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:isSelected?'#0066cc':'#1a1a1a'}}>{pr.name}</div>
                    {pr.description && <div style={{fontSize:11,color:'#666',marginTop:2,lineHeight:1.3}}>{pr.description.slice(0,60)}{pr.description.length>60?'...':''}</div>}
                  </div>
                </label>
              })}
            </div>
            <form onSubmit={async (e)=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const p: ProjectEntity = { name:String(fd.get('name')||''), description:String(fd.get('description')||''), link:String(fd.get('link')||''), bullets:String(fd.get('bullets')||'').split('\n').filter(Boolean)}; const created = await createProject(p); update('projects', [...data.projects, created]); setProjects(await listProjects()); (e.target as HTMLFormElement).reset(); }} style={{marginTop:16,padding:16,background:'#f8f9fa',borderRadius:8,border:'1px solid #e1e4e8'}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1a1a1a'}}>Quick add to library:</div>
              <div style={{display:'grid',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 100px',gap:8}}>
                  <input name="name" placeholder="Project Name *" required style={{fontSize:13}}/>
                  <input name="link" placeholder="Link (optional)" style={{fontSize:13}}/>
                  <button type="submit" style={{fontSize:13}}>Add</button>
                </div>
                <textarea name="description" placeholder="Brief description..." rows={2} style={{fontSize:13,resize:'vertical'}}/>
              </div>
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
    </DashboardLayout>
  );
}
