const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

// Core entities
db.prepare(`CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- candidate legal name (constant across resumes)
  label TEXT NOT NULL DEFAULT '', -- application/job specific label
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '{}', -- JSON object
  socials TEXT NOT NULL DEFAULT '[]', -- JSON array
  updated_at TEXT NOT NULL
)`).run();
// Ensure legacy DB upgraded to include label column
try {
  const cols = db.prepare(`PRAGMA table_info(resumes)`).all();
  if(!cols.some(c=>c.name==='label')){
    db.prepare(`ALTER TABLE resumes ADD COLUMN label TEXT NOT NULL DEFAULT ''`).run();
  }
  if(!cols.some(c=>c.name==='contact')){
    db.prepare(`ALTER TABLE resumes ADD COLUMN contact TEXT NOT NULL DEFAULT '{}'`).run();
  }
  if(!cols.some(c=>c.name==='socials')){
    db.prepare(`ALTER TABLE resumes ADD COLUMN socials TEXT NOT NULL DEFAULT '[]'`).run();
  }
} catch (e){ /* ignore */ }

db.prepare(`CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  bullets TEXT NOT NULL -- JSON array
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  end TEXT NOT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  link TEXT,
  bullets TEXT NOT NULL -- JSON array
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS socials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'email', 'phone', 'website', 'linkedin', 'github', 'location'
  value TEXT NOT NULL,
  label TEXT -- optional label like 'Personal Email', 'Work Phone', etc.
)`).run();

// Mapping tables (ordered composition)
db.prepare(`CREATE TABLE IF NOT EXISTS resume_skills (
  resume_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  ord INTEGER NOT NULL,
  PRIMARY KEY (resume_id, skill_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS resume_experiences (
  resume_id INTEGER NOT NULL,
  experience_id INTEGER NOT NULL,
  ord INTEGER NOT NULL,
  PRIMARY KEY (resume_id, experience_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS resume_education (
  resume_id INTEGER NOT NULL,
  education_id INTEGER NOT NULL,
  ord INTEGER NOT NULL,
  PRIMARY KEY (resume_id, education_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (education_id) REFERENCES education(id) ON DELETE CASCADE
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS resume_projects (
  resume_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  ord INTEGER NOT NULL,
  PRIMARY KEY (resume_id, project_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
)`).run();

// Helpers to create entities
function createSkill(name){
  try {
    const info = db.prepare('INSERT INTO skills (name) VALUES (?)').run(name);
    return info.lastInsertRowid;
  } catch {
    // unique constraint; fetch existing id
    const row = db.prepare('SELECT id FROM skills WHERE name = ?').get(name);
    return row?.id;
  }
}

function createExperience(exp){
  const info = db.prepare(`INSERT INTO experiences (role,company,location,start,end,bullets) VALUES (?,?,?,?,?,?)`).run(
    exp.role, exp.company, exp.location || null, exp.start, exp.end, JSON.stringify(exp.bullets||[])
  );
  return info.lastInsertRowid;
}

function createEducation(ed){
  const info = db.prepare(`INSERT INTO education (institution,degree,end) VALUES (?,?,?)`).run(
    ed.institution, ed.degree, ed.end
  );
  return info.lastInsertRowid;
}

function createProject(p){
  const info = db.prepare(`INSERT INTO projects (name,description,link,bullets) VALUES (?,?,?,?)`).run(
    p.name, p.description || null, p.link || null, JSON.stringify(p.bullets||[])
  );
  return info.lastInsertRowid;
}

function createSocial(s){
  const info = db.prepare(`INSERT INTO socials (label,url) VALUES (?,?)`).run(
    s.label, s.url
  );
  return info.lastInsertRowid;
}

function createContact(c){
  const info = db.prepare(`INSERT INTO contacts (type, value, label) VALUES (?, ?, ?)`).run(
    c.type, c.value, c.label || null
  );
  return info.lastInsertRowid;
}

function listResumes(){
  return db.prepare('SELECT id,name,label,title,summary,updated_at FROM resumes ORDER BY updated_at DESC').all();
}

function getResumeAggregate(id){
  const base = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id);
  if(!base) return null;
  const skills = db.prepare(`SELECT rs.skill_id as id FROM resume_skills rs WHERE rs.resume_id = ? ORDER BY rs.ord`).all(id).map(r=>r.id);
  const experiences = db.prepare(`SELECT e.* FROM resume_experiences re JOIN experiences e ON e.id = re.experience_id WHERE re.resume_id = ? ORDER BY re.ord`).all(id).map(r=>({
    role: r.role, company: r.company, location: r.location || undefined, start: r.start, end: r.end, bullets: JSON.parse(r.bullets||'[]')
  }));
  const education = db.prepare(`SELECT ed.* FROM resume_education re JOIN education ed ON ed.id = re.education_id WHERE re.resume_id = ? ORDER BY re.ord`).all(id).map(r=>({
    institution: r.institution, degree: r.degree, end: r.end
  }));
  const projects = db.prepare(`SELECT p.* FROM resume_projects rp JOIN projects p ON p.id = rp.project_id WHERE rp.resume_id = ? ORDER BY rp.ord`).all(id).map(r=>({
    name: r.name, description: r.description || '', link: r.link || '', bullets: JSON.parse(r.bullets||'[]')
  }));
  return {
    id: base.id,
    name: base.name,
    label: base.label,
    title: base.title,
    summary: base.summary,
    contact: JSON.parse(base.contact || '{}'),
    socials: JSON.parse(base.socials || '[]'),
    experiences, skills, education, projects,
    updated_at: base.updated_at
  };
}

function createResume(payload){
  const now = new Date().toISOString();
  const info = db.prepare('INSERT INTO resumes (name,label,title,summary,contact,socials,updated_at) VALUES (?,?,?,?,?,?,?)').run(
    payload.name, payload.label || '', payload.title, payload.summary,
    JSON.stringify(payload.contact || {}), JSON.stringify(payload.socials || []),
    now
  );
  const resumeId = info.lastInsertRowid;
  // Attach compositions from either ids or objects/strings (back-compat with old client)
  const skillsIn = payload.skills || [];
  skillsIn.forEach((s, i)=>{
    const sid = typeof s === 'number' ? s : createSkill(String(s));
    db.prepare('INSERT OR IGNORE INTO resume_skills (resume_id, skill_id, ord) VALUES (?,?,?)').run(resumeId, sid, i);
  });

  const exps = payload.experiences || [];
  exps.forEach((e,i)=>{
    const id = typeof e === 'number' ? e : createExperience(e);
    db.prepare('INSERT OR IGNORE INTO resume_experiences (resume_id, experience_id, ord) VALUES (?,?,?)').run(resumeId, id, i);
  });

  const edus = payload.education || [];
  edus.forEach((e,i)=>{
    const id = typeof e === 'number' ? e : createEducation(e);
    db.prepare('INSERT OR IGNORE INTO resume_education (resume_id, education_id, ord) VALUES (?,?,?)').run(resumeId, id, i);
  });

  const projs = payload.projects || [];
  projs.forEach((p,i)=>{
    const id = typeof p === 'number' ? p : createProject(p);
    db.prepare('INSERT OR IGNORE INTO resume_projects (resume_id, project_id, ord) VALUES (?,?,?)').run(resumeId, id, i);
  });

  return getResumeAggregate(resumeId);
}

function updateResume(id, payload){
  const now = new Date().toISOString();
  db.prepare('UPDATE resumes SET name=?, label=?, title=?, summary=?, contact=?, socials=?, updated_at=? WHERE id=?').run(
    payload.name, payload.label || '', payload.title, payload.summary,
    JSON.stringify(payload.contact || {}), JSON.stringify(payload.socials || []),
    now, id
  );
  // Reset mappings then re-add based on provided arrays (if any provided; keep existing if not present)
  if('skills' in payload){
    db.prepare('DELETE FROM resume_skills WHERE resume_id = ?').run(id);
    (payload.skills||[]).forEach((s,i)=>{
      const sid = typeof s === 'number' ? s : createSkill(String(s));
      db.prepare('INSERT OR IGNORE INTO resume_skills (resume_id, skill_id, ord) VALUES (?,?,?)').run(id, sid, i);
    });
  }
  if('experiences' in payload){
    db.prepare('DELETE FROM resume_experiences WHERE resume_id = ?').run(id);
    (payload.experiences||[]).forEach((e,i)=>{
      const eid = typeof e === 'number' ? e : createExperience(e);
      db.prepare('INSERT OR IGNORE INTO resume_experiences (resume_id, experience_id, ord) VALUES (?,?,?)').run(id, eid, i);
    });
  }
  if('education' in payload){
    db.prepare('DELETE FROM resume_education WHERE resume_id = ?').run(id);
    (payload.education||[]).forEach((e,i)=>{
      const edid = typeof e === 'number' ? e : createEducation(e);
      db.prepare('INSERT OR IGNORE INTO resume_education (resume_id, education_id, ord) VALUES (?,?,?)').run(id, edid, i);
    });
  }
  if('projects' in payload){
    db.prepare('DELETE FROM resume_projects WHERE resume_id = ?').run(id);
    (payload.projects||[]).forEach((p,i)=>{
      const pid = typeof p === 'number' ? p : createProject(p);
      db.prepare('INSERT OR IGNORE INTO resume_projects (resume_id, project_id, ord) VALUES (?,?,?)').run(id, pid, i);
    });
  }
  return getResumeAggregate(id);
}

// Library CRUD
function listSkills(){ return db.prepare('SELECT * FROM skills ORDER BY name').all(); }
function createSkillEntity(payload){ return { id: createSkill(payload.name), name: payload.name }; }
function deleteSkill(id){ db.prepare('DELETE FROM skills WHERE id = ?').run(id); }
function listExperiences(){
  const rows = db.prepare('SELECT * FROM experiences ORDER BY id DESC').all();
  return rows.map(r=>({ id:r.id, role:r.role, company:r.company, location:r.location||undefined, start:r.start, end:r.end, bullets: JSON.parse(r.bullets||'[]') }));
}
function createExperienceEntity(payload){ return { id: createExperience(payload), ...payload }; }
function deleteExperience(id){ db.prepare('DELETE FROM experiences WHERE id = ?').run(id); }
function listEducation(){ return db.prepare('SELECT * FROM education ORDER BY id DESC').all(); }
function createEducationEntity(payload){ return { id: createEducation(payload), ...payload }; }
function deleteEducation(id){ db.prepare('DELETE FROM education WHERE id = ?').run(id); }
function listProjects(){
  const rows = db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  return rows.map(r=>({ id:r.id, name:r.name, description:r.description||'', link:r.link||'', bullets: JSON.parse(r.bullets||'[]') }));
}
function createProjectEntity(payload){ return { id: createProject(payload), ...payload }; }
function deleteProject(id){ db.prepare('DELETE FROM projects WHERE id = ?').run(id); }
function listSocials(){ return db.prepare('SELECT * FROM socials ORDER BY id DESC').all(); }
function createSocialEntity(payload){ return { id: createSocial(payload), ...payload }; }
function deleteSocial(id){ db.prepare('DELETE FROM socials WHERE id = ?').run(id); }
function listContacts(){
  const rows = db.prepare('SELECT * FROM contacts ORDER BY type, id').all();
  return rows.map(r=>({ id:r.id, type:r.type, value:r.value, label:r.label||undefined }));
}
function createContactEntity(payload){ return { id: createContact(payload), ...payload }; }
function updateContact(id, payload){
  db.prepare('UPDATE contacts SET type = ?, value = ?, label = ? WHERE id = ?').run(
    payload.type, payload.value, payload.label || null, id
  );
}
function deleteContact(id){ db.prepare('DELETE FROM contacts WHERE id = ?').run(id); }

function seedIfEmpty(){
  const count = db.prepare('SELECT COUNT(*) as c FROM resumes').get().c;
  if(count>0) return;

  // Seed library
  const sJava = createSkill('Java');
  const sTS = createSkill('TypeScript');
  const sReact = createSkill('React.js');
  const sSQL = createSkill('SQL');

  const e1 = createExperience({
    role:'Evergreen Systems Specialist', company:'Bibliomation, Inc. | Waterbury, CT', start:'July 2024', end:'Present', bullets:[
      'Managed and optimized the Evergreen SQL database for Connecticut\'s largest library consortium.',
      'Developed custom configurations and features based on user feedback.',
      'Provided Help Desk support, troubleshooting configurations, debugging, and deploying software patches.'
    ]
  });
  const e2 = createExperience({
    role:'Professional Tutor', company:'Tunxis Community College | Farmington, CT', start:'Aug 2018', end:'Present', bullets:[
      'Guided students in HTML, CSS, JavaScript, networking, and database topics to improve academic performance.'
    ]
  });
  const e3 = createExperience({
    role:'SI Leader', company:'Arizona State University | Remote', start:'Aug 2022', end:'Jan 2023', bullets:[
      'Led supplemental instruction for "Distributed Software Systems" covering client-server architecture, multithreading, and socket programming.'
    ]
  });

  const ed1 = createEducation({ institution:'Arizona State University', degree:'BS Software Engineering', end:'Dec 2023' });
  const ed2 = createEducation({ institution:'CT State Tunxis', degree:'AS Mathematics/Computer Science', end:'2018' });

  const p1 = createProject({ name:'Evergreen ILS Contribution', description:'Open-source features and docs contributions', link:'', bullets:[ 'Collaborated with the Evergreen community releasing features in 3.11 and 3.13.' ]});

  // Seed resume composition
  const resume = createResume({
    name:'Ian Skelskey',
    label:'General Purpose / Evergreen',
    title:'Software Engineer',
    summary:'Innovative software engineer specializing in full-stack development with expertise in SQL, React, and RESTful APIs. Experienced in managing and optimizing large-scale library systems, contributing to open-source software, and developing client-centric solutions.',
    contact: { email: 'ianskelskey@gmail.com', phone: '860-830-5595', linkedin: 'in/ianskelskey', github: 'github.com/ianskelskey', website: '', location: '' },
    socials: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/ianskelskey' },
      { label: 'GitHub', url: 'https://github.com/ianskelskey' }
    ],
    skills:[sJava, sTS, sReact, sSQL],
    experiences:[e1,e2,e3],
    education:[ed1,ed2],
    projects:[p1]
  });
  return resume;
}

// Database admin functions
function getTableNames(){
  const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  return rows.map(r=>r.name);
}

function getTableSchema(tableName){
  return db.prepare(`PRAGMA table_info(${tableName})`).all();
}

function queryTable(tableName){
  return db.prepare(`SELECT * FROM ${tableName}`).all();
}

function deleteRecord(tableName, id){
  db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(id);
}

function updateRecord(tableName, id, data){
  const cols = getTableSchema(tableName).map(c=>c.name).filter(c=>c!=='id');
  const sets = cols.map(c=>`${c} = ?`).join(', ');
  const values = cols.map(c=>data[c] ?? null);
  db.prepare(`UPDATE ${tableName} SET ${sets} WHERE id = ?`).run(...values, id);
}

function insertRecord(tableName, data){
  const cols = getTableSchema(tableName).map(c=>c.name).filter(c=>c!=='id');
  const placeholders = cols.map(_=>'?').join(', ');
  const values = cols.map(c=>data[c] ?? null);
  const info = db.prepare(`INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`).run(...values);
  return info.lastInsertRowid;
}

module.exports = {
  // resume aggregates
  list: listResumes,
  get: getResumeAggregate,
  create: createResume,
  update: updateResume,
  // libraries
  listSkills, createSkillEntity, deleteSkill,
  listExperiences, createExperienceEntity, deleteExperience,
  listEducation, createEducationEntity, deleteEducation,
  listProjects, createProjectEntity, deleteProject,
  listSocials, createSocialEntity, deleteSocial,
  listContacts, createContactEntity, updateContact, deleteContact,
  seedIfEmpty,
  // database admin
  getTableNames, getTableSchema, queryTable, deleteRecord, updateRecord, insertRecord
};
