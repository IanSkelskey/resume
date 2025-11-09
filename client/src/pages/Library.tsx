import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listSkills, createSkill, updateSkill, deleteSkill, listSkillCategories, createSkillCategory, updateSkillCategory, deleteSkillCategory, listExperiences, createExperience, updateExperience, listEducation, createEducation, listProjects, createProject, updateProject, listSocials, createSocial, listContacts, createContact, updateContact, deleteExperience, deleteEducation, deleteProject, deleteSocial, deleteContact } from '../api';
import type { Skill, SkillCategory, ExperienceEntity, EducationEntity, ProjectEntity, SocialLink, ContactInfo } from '../types';
import Modal, { ConfirmModal } from '../components/Modal';
import { MdHome, MdComputer } from 'react-icons/md';
import { HiOfficeBuilding } from 'react-icons/hi';

export default function Library(){
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntity[]>([]);
  const [education, setEducation] = useState<EducationEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [socials, setSocials] = useState<{id: number; label: string; url: string}[]>([]);
  const [contacts, setContacts] = useState<Array<ContactInfo & {id: number}>>([]);
  const [activeTab, setActiveTab] = useState<'skills'|'experiences'|'education'|'projects'|'contacts'|'socials'>('skills');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<(ContactInfo & {id: number}) | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceEntity | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectEntity | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{show: boolean; message: string; onConfirm: () => void | Promise<void>}>({show: false, message: '', onConfirm: () => {}});

  const getWorkTypeIcon = (workType?: string) => {
    switch(workType) {
      case 'remote': return <MdHome style={{fontSize:14}} />;
      case 'on-site': return <HiOfficeBuilding style={{fontSize:14}} />;
      case 'hybrid': return <MdComputer style={{fontSize:14}} />;
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

  useEffect(()=>{ refresh(); },[]);
  async function refresh(){
    const [sk, cat, ex, ed, pr, so, ct] = await Promise.all([listSkills(), listSkillCategories(), listExperiences(), listEducation(), listProjects(), listSocials(), listContacts()]);
    setSkills(sk); setCategories(cat); setExperiences(ex); setEducation(ed); setProjects(pr); setSocials(so); setContacts(ct);
  }

  async function addSkill(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget); 
      const name = String(fd.get('name')||'').trim(); 
      if(!name) return;
      const categoryId = fd.get('category_id') ? Number(fd.get('category_id')) : undefined;
      
      if (editingSkill) {
        await updateSkill(editingSkill.id!, { name, category_id: categoryId });
        toast.success('Skill updated successfully');
        setEditingSkill(null);
      } else {
        await createSkill(name, categoryId);
        toast.success('Skill added successfully');
      }
      
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
    } catch (error) {
      toast.error(editingSkill ? 'Failed to update skill' : 'Failed to add skill');
    }
  }
  async function addExperience(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const exp: ExperienceEntity = {
        role: String(fd.get('role')||''), company: String(fd.get('company')||''), location: String(fd.get('location')||'') || undefined,
        work_type: (fd.get('work_type') as 'remote'|'on-site'|'hybrid') || undefined,
        start: String(fd.get('start')||''), end: String(fd.get('end')||''), bullets: String(fd.get('bullets')||'').split('\n').filter(Boolean)
      };
      if (editingExperience) {
        await updateExperience(editingExperience.id!, exp);
        toast.success('Experience updated successfully');
        setEditingExperience(null);
      } else {
        await createExperience(exp);
        toast.success('Experience added successfully');
      }
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
    } catch (error) {
      toast.error(editingExperience ? 'Failed to update experience' : 'Failed to add experience');
    }
  }
  async function addEducation(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const ed = { institution: String(fd.get('institution')||''), degree: String(fd.get('degree')||''), end: String(fd.get('end')||'') };
      await createEducation(ed);
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
      toast.success('Education added successfully');
    } catch (error) {
      toast.error('Failed to add education');
    }
  }
  async function addProject(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const p: ProjectEntity = { name: String(fd.get('name')||''), description: String(fd.get('description')||''), link: String(fd.get('link')||''), bullets: String(fd.get('bullets')||'').split('\n').filter(Boolean) };
      if (editingProject) {
        await updateProject(editingProject.id!, p);
        toast.success('Project updated successfully');
        setEditingProject(null);
      } else {
        await createProject(p);
        toast.success('Project added successfully');
      }
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
    } catch (error) {
      toast.error(editingProject ? 'Failed to update project' : 'Failed to add project');
    }
  }
  async function addSocial(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const social = { label: String(fd.get('label')||''), url: String(fd.get('url')||'') };
      if(!social.label || !social.url) return;
      await createSocial(social);
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
      toast.success('Social link added successfully');
    } catch (error) {
      toast.error('Failed to add social link');
    }
  }
  async function addContact(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const contact: ContactInfo = {
        type: String(fd.get('type')) as ContactInfo['type'],
        value: String(fd.get('value')||'').trim(),
        label: String(fd.get('label')||'').trim() || undefined
      };
      if (!contact.value) return;
      
      if (editingContact) {
        await updateContact(editingContact.id, contact);
        toast.success('Contact updated successfully');
        setEditingContact(null);
      } else {
        await createContact(contact);
        toast.success('Contact added successfully');
      }
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
    } catch (error) {
      toast.error(editingContact ? 'Failed to update contact' : 'Failed to add contact');
    }
  }

  async function addCategory(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get('name')||'').trim();
      if (!name) return;
      
      if (editingCategory?.id) {
        await updateSkillCategory(editingCategory.id, { name });
        toast.success('Category updated successfully');
        setEditingCategory(null);
      } else {
        await createSkillCategory({ name });
        toast.success('Category added successfully');
      }
      
      const form = e.currentTarget;
      if (form) form.reset();
      refresh();
      setShowAddModal(false);
    } catch (error) {
      toast.error(editingCategory?.id ? 'Failed to update category' : 'Failed to add category');
    }
  }

  function handleDelete(message: string, onConfirm: () => Promise<void>) {
    setConfirmDelete({
      show: true,
      message,
      onConfirm: async () => {
        try {
          await onConfirm();
          toast.success('Item deleted successfully');
        } catch (error) {
          toast.error('Failed to delete item');
        }
      }
    });
  }

  return (
    <div className="content-page">
      <div className="content-header">
        <h1 className="content-title">Library</h1>
        <p className="content-subtitle">Manage your reusable resume components</p>
      </div>
      
      <div className="tabs">
        <button className={`tab ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
        <button className={`tab ${activeTab === 'experiences' ? 'active' : ''}`} onClick={() => setActiveTab('experiences')}>Experiences</button>
        <button className={`tab ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>Education</button>
        <button className={`tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
        <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>Contact Info</button>
        <button className={`tab ${activeTab === 'socials' ? 'active' : ''}`} onClick={() => setActiveTab('socials')}>Social Links</button>
      </div>

      <div className="editor" style={{maxWidth:1100}}>
        {activeTab === 'skills' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Skills & Categories</h3>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { setEditingSkill(null); setEditingCategory({ name: '' }); setShowAddModal(true); }} style={{background:'#4a5568',color:'white'}}>+ Add Category</button>
              <button onClick={() => { setEditingSkill(null); setEditingCategory(null); setShowAddModal(true); }}>+ Add Skill</button>
            </div>
          </div>

          {/* Categories with their skills */}
          {categories.map(cat => {
            const categorySkills = skills.filter(s => s.category_id === cat.id);
            return (
              <div key={cat.id} style={{marginBottom:24,padding:16,background:'#f9fafb',borderRadius:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div>
                    <strong style={{fontSize:16}}>{cat.name}</strong>
                    <span style={{fontSize:13,color:'#666',marginLeft:8}}>({categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''})</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={() => { setEditingCategory(cat); setShowAddModal(true); }} style={{fontSize:12,padding:'4px 10px',background:'white'}}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(`Delete category "${cat.name}"? Skills will become uncategorized.`, async () => { await deleteSkillCategory(cat.id!); refresh(); })} style={{fontSize:12,padding:'4px 10px'}}>Delete</button>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {categorySkills.length > 0 ? (
                    categorySkills.map(s => (
                      <span key={s.id} className="skills-pill" style={{display:'flex',alignItems:'center',gap:6}}>
                        {s.name}
                        <button onClick={() => { setEditingSkill(s); setShowAddModal(true); }} style={{background:'none',border:'none',color:'#666',cursor:'pointer',padding:0,fontSize:12}} type="button">✏️</button>
                        <button onClick={() => handleDelete(`Delete skill "${s.name}"?`, async () => { await deleteSkill(s.id!); refresh(); })} style={{background:'none',border:'none',color:'#999',cursor:'pointer',padding:0,fontSize:14}} type="button">×</button>
                      </span>
                    ))
                  ) : (
                    <span style={{fontSize:13,color:'#999',fontStyle:'italic'}}>No skills in this category</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Uncategorized skills */}
          {skills.filter(s => !s.category_id).length > 0 && (
            <div style={{marginBottom:24,padding:16,background:'#f9fafb',borderRadius:8}}>
              <div style={{marginBottom:12}}>
                <strong style={{fontSize:16}}>Uncategorized</strong>
                <span style={{fontSize:13,color:'#666',marginLeft:8}}>({skills.filter(s => !s.category_id).length} skill{skills.filter(s => !s.category_id).length !== 1 ? 's' : ''})</span>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {skills.filter(s => !s.category_id).map(s => (
                  <span key={s.id} className="skills-pill" style={{display:'flex',alignItems:'center',gap:6}}>
                    {s.name}
                    <button onClick={() => { setEditingSkill(s); setShowAddModal(true); }} style={{background:'none',border:'none',color:'#666',cursor:'pointer',padding:0,fontSize:12}} type="button">✏️</button>
                    <button onClick={() => handleDelete(`Delete skill "${s.name}"?`, async () => { await deleteSkill(s.id!); refresh(); })} style={{background:'none',border:'none',color:'#999',cursor:'pointer',padding:0,fontSize:14}} type="button">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
        )}

        {activeTab === 'experiences' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Experiences</h3>
            <button onClick={() => setShowAddModal(true)}>+ Add Experience</button>
          </div>
          <ul>
            {experiences.map(ex=>(
              <li key={ex.id} style={{marginBottom:12,padding:12,background:'#f9fafb',borderRadius:6}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:4}}>
                  <div style={{flex:1}}>
                    <div><strong>{ex.role}</strong> at {ex.company}</div>
                    <div style={{fontSize:13,color:'#666',marginTop:2}}>
                      {ex.work_type && (
                        <span style={{display:'inline-flex',alignItems:'center',gap:4,background:'#e5e7eb',padding:'2px 8px',borderRadius:4,fontSize:12}}>
                          {getWorkTypeIcon(ex.work_type)}
                          {getWorkTypeLabel(ex.work_type)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                    <div style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>{ex.start} – {ex.end}</div>
                    {ex.location && <div style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>{ex.location}</div>}
                  </div>
                </div>
                <div style={{marginTop:8,display:'flex',gap:8}}>
                  <button onClick={() => { setEditingExperience(ex); setShowAddModal(true); }} style={{fontSize:13,padding:'4px 8px'}}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(`Are you sure you want to delete "${ex.role}" at ${ex.company}?`, async () => { await deleteExperience(ex.id!); refresh(); })} style={{fontSize:13,padding:'4px 8px'}}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        )}

        {activeTab === 'education' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Education</h3>
            <button onClick={() => setShowAddModal(true)}>+ Add Education</button>
          </div>
          <ul>
            {education.map(e=> (
              <li key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span><strong>{e.degree}</strong>, {e.institution} ({e.end})</span>
                <button className="danger" onClick={() => handleDelete(`Delete education "${e.degree}"?`, async () => { await deleteEducation(e.id!); refresh(); })} style={{fontSize:12,padding:'4px 8px'}}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
        )}

        {activeTab === 'projects' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Projects</h3>
            <button onClick={() => setShowAddModal(true)}>+ Add Project</button>
          </div>
          {projects.length === 0 ? (
            <div style={{padding:'40px',textAlign:'center',background:'#f9fafb',borderRadius:8,border:'1px dashed #d1d5db'}}>
              <div style={{fontSize:32,marginBottom:8}}>📁</div>
              <div style={{fontSize:14,color:'#666',marginBottom:4}}>No projects yet</div>
              <div style={{fontSize:12,color:'#999'}}>Click "Add Project" to create your first project</div>
            </div>
          ) : (
            <div style={{display:'grid',gap:12}}>
              {projects.map(p=> (
                <div key={p.id} className="card" style={{padding:16,background:'#fff',borderRadius:8,border:'1px solid #e5e7eb'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:600,color:'#1a1a1a',marginBottom:4}}>{p.name}</div>
                      {p.description && (
                        <div style={{fontSize:13,color:'#666',marginBottom:6,lineHeight:1.5}}>{p.description}</div>
                      )}
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#0066cc',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                          🔗 {p.link}
                        </a>
                      )}
                      {p.bullets && p.bullets.length > 0 && (
                        <ul style={{marginTop:8,marginBottom:0,paddingLeft:20,fontSize:13,color:'#555',lineHeight:1.6}}>
                          {p.bullets.map((bullet, idx) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button onClick={()=>{ setEditingProject(p); setShowAddModal(true); }} style={{fontSize:12,padding:'6px 12px'}}>Edit</button>
                      <button className="danger" onClick={() => handleDelete(`Delete project "${p.name}"?`, async () => { await deleteProject(p.id!); refresh(); })} style={{fontSize:12,padding:'6px 12px'}}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {activeTab === 'contacts' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Contact Info</h3>
            <button onClick={() => { setEditingContact(null); setShowAddModal(true); }}>+ Add Contact Info</button>
          </div>
          <ul>
            {contacts.map(c=> {
              const icons: Record<string, string> = {
                email: '📧',
                phone: '📞',
                location: '📍',
                linkedin: '💼',
                github: '🐙',
                website: '🌐'
              };
              return (
                <li key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                  <span>
                    {icons[c.type]} <strong>{c.type}:</strong> {c.value}
                    {c.label && <em style={{color:'#666',marginLeft:8}}>({c.label})</em>}
                  </span>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={() => { setEditingContact(c); setShowAddModal(true); }} style={{fontSize:12,padding:'4px 8px'}}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(`Delete ${c.type} "${c.value}"?`, async () => { await deleteContact(c.id); refresh(); })} style={{fontSize:12,padding:'4px 8px'}}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        )}

        {activeTab === 'socials' && (
        <section>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0}}>Social Links</h3>
            <button onClick={() => setShowAddModal(true)}>+ Add Social Link</button>
          </div>
          <ul>
            {socials.map(s=> (
              <li key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span><strong>{s.label}</strong>: {s.url}</span>
                <button className="danger" onClick={() => handleDelete(`Delete social link "${s.label}"?`, async () => { await deleteSocial(s.id); refresh(); })} style={{fontSize:12,padding:'4px 8px'}}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>

      {/* Modals for adding items */}
      {showAddModal && activeTab === 'skills' && editingCategory === null && (
        <Modal isOpen={true} onClose={() => { setShowAddModal(false); setEditingSkill(null); }} title={editingSkill ? "Edit Skill" : "Add New Skill"} size="small">
          <form onSubmit={addSkill}>
            <label>
              Skill Name
              <input name="name" placeholder="e.g., TypeScript" defaultValue={editingSkill?.name} required />
            </label>
            <label>
              Category (optional)
              <select name="category_id" defaultValue={editingSkill?.category_id || ''}>
                <option value="">-- No Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <button type="submit" style={{marginTop:16}}>{editingSkill ? 'Update Skill' : 'Add Skill'}</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'skills' && editingCategory !== null && (
        <Modal isOpen={true} onClose={() => { setShowAddModal(false); setEditingCategory(null); }} title={editingCategory?.id ? "Edit Category" : "Add New Category"} size="small">
          <form onSubmit={addCategory}>
            <label>
              Category Name
              <input name="name" placeholder="e.g., Programming Languages" defaultValue={editingCategory?.name} required />
            </label>
            <button type="submit" style={{marginTop:16}}>{editingCategory?.id ? 'Update Category' : 'Add Category'}</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'experiences' && (
        <Modal isOpen={true} onClose={() => { setShowAddModal(false); setEditingExperience(null); }} title={editingExperience ? "Edit Experience" : "Add New Experience"} size="large">
          <form onSubmit={addExperience}>
            <label>Role<input name="role" defaultValue={editingExperience?.role} required /></label>
            <label>Company<input name="company" defaultValue={editingExperience?.company} required /></label>
            <div style={{display:'flex',gap:8}}>
              <label>Location<input name="location" defaultValue={editingExperience?.location}/></label>
              <label>Work Type<select name="work_type" defaultValue={editingExperience?.work_type || ''}>
                <option value="">--</option>
                <option value="remote">Remote</option>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select></label>
            </div>
            <div style={{display:'flex',gap:8}}>
              <label>Start<input name="start" placeholder="e.g., Jan 2020" defaultValue={editingExperience?.start} required /></label>
              <label>End<input name="end" placeholder="e.g., Dec 2022" defaultValue={editingExperience?.end} required /></label>
            </div>
            <label>Bullets<textarea name="bullets" rows={4} placeholder="One per line" defaultValue={editingExperience?.bullets?.join('\n')}/></label>
            <button type="submit" style={{marginTop:16}}>{editingExperience ? 'Update Experience' : 'Add Experience'}</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'education' && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Add New Education" size="medium">
          <form onSubmit={addEducation}>
            <label>Institution<input name="institution" placeholder="e.g., Stanford University" required /></label>
            <label>Degree<input name="degree" placeholder="e.g., B.S. Computer Science" required /></label>
            <label>End<input name="end" placeholder="e.g., 2020" required /></label>
            <button type="submit" style={{marginTop:16}}>Add Education</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'projects' && (
        <Modal isOpen={true} onClose={() => { setShowAddModal(false); setEditingProject(null); }} title={editingProject ? "Edit Project" : "Add New Project"} size="large">
          <form onSubmit={addProject}>
            <label>Name<input name="name" defaultValue={editingProject?.name} required /></label>
            <label>Description<textarea name="description" rows={3} defaultValue={editingProject?.description}/></label>
            <label>Link<input name="link" placeholder="https://..." defaultValue={editingProject?.link}/></label>
            <label>Bullets<textarea name="bullets" rows={4} placeholder="One per line" defaultValue={editingProject?.bullets?.join('\n')}/></label>
            <button type="submit" style={{marginTop:16}}>{editingProject ? 'Update Project' : 'Add Project'}</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'contacts' && (
        <Modal isOpen={true} onClose={() => { setShowAddModal(false); setEditingContact(null); }} title={editingContact ? "Edit Contact Info" : "Add Contact Info"} size="medium">
          <form onSubmit={addContact}>
            <label>
              Type
              <select name="type" defaultValue={editingContact?.type || 'email'} required>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="website">Website</option>
                <option value="location">Location</option>
              </select>
            </label>
            <label>
              Value
              <input name="value" defaultValue={editingContact?.value || ''} placeholder="e.g., john@example.com" required />
            </label>
            <label>
              Label (optional)
              <input name="label" defaultValue={editingContact?.label || ''} placeholder="e.g., Personal, Work" />
            </label>
            <button type="submit" style={{marginTop:16}}>{editingContact ? 'Update' : 'Add'} Contact Info</button>
          </form>
        </Modal>
      )}

      {showAddModal && activeTab === 'socials' && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Add Social Link" size="medium">
          <form onSubmit={addSocial}>
            <label>Label<input name="label" placeholder="e.g., LinkedIn" required /></label>
            <label>URL<input name="url" placeholder="https://..." required /></label>
            <button type="submit" style={{marginTop:16}}>Add Social Link</button>
          </form>
        </Modal>
      )}

      {/* Confirmation modal for deletions */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({show: false, message: '', onConfirm: () => {}})}
        onConfirm={confirmDelete.onConfirm}
        title="Confirm Deletion"
        message={confirmDelete.message}
      />
    </div>
  );
}
