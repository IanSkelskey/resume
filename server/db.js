const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.pragma('journal_mode = WAL');

db.prepare(`CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  experiences TEXT NOT NULL,
  skills TEXT NOT NULL,
  education TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`).run();

function rowToObj(row){
  if(!row) return null;
  return {
    ...row,
    experiences: JSON.parse(row.experiences),
    skills: JSON.parse(row.skills),
    education: JSON.parse(row.education)
  };
}

function list(){
  const rows = db.prepare('SELECT * FROM resumes ORDER BY updated_at DESC').all();
  return rows.map(rowToObj);
}
function get(id){
  const row = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id);
  return rowToObj(row);
}
function create(payload){
  const now = new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO resumes (name,title,summary,experiences,skills,education,updated_at) VALUES (?,?,?,?,?,?,?)`);
  const info = stmt.run(
    payload.name,
    payload.title,
    payload.summary,
    JSON.stringify(payload.experiences||[]),
    JSON.stringify(payload.skills||[]),
    JSON.stringify(payload.education||[]),
    now
  );
  return get(info.lastInsertRowid);
}
function update(id, payload){
  const now = new Date().toISOString();
  const stmt = db.prepare(`UPDATE resumes SET name=?, title=?, summary=?, experiences=?, skills=?, education=?, updated_at=? WHERE id=?`);
  stmt.run(
    payload.name,
    payload.title,
    payload.summary,
    JSON.stringify(payload.experiences||[]),
    JSON.stringify(payload.skills||[]),
    JSON.stringify(payload.education||[]),
    now,
    id
  );
  return get(id);
}

function seedIfEmpty(){
  const count = db.prepare('SELECT COUNT(*) as c FROM resumes').get().c;
  if(count>0) return;
  const sample = {
    name: 'Ian Skelskey',
    title: 'Software Engineer',
    summary: 'Innovative software engineer specializing in full-stack development with expertise in SQL, React, and RESTful APIs. Experienced in managing and optimizing large-scale library systems, contributing to open-source software, and developing client-centric solutions.',
    experiences: [
      {
        role: 'Evergreen Systems Specialist',
        company: 'Bibliomation, Inc. | Waterbury, CT',
        start: 'July 2024',
        end: 'Present',
        bullets: [
          'Managed and optimized the Evergreen SQL database for Connecticut\'s largest library consortium.',
          'Developed custom configurations and features based on user feedback.',
          'Provided Help Desk support, troubleshooting configurations, debugging, and deploying software patches.'
        ]
      },
      {
        role: 'Professional Tutor',
        company: 'Tunxis Community College | Farmington, CT',
        start: 'Aug 2018',
        end: 'Present',
        bullets: [
          'Guided students in HTML, CSS, JavaScript, networking, and database topics to improve academic performance.'
        ]
      },
      {
        role: 'SI Leader',
        company: 'Arizona State University | Remote',
        start: 'Aug 2022',
        end: 'Jan 2023',
        bullets: [
          'Led supplemental instruction for \"Distributed Software Systems\" covering client-server architecture, multithreading, and socket programming.'
        ]
      }
    ],
    skills: ['Java','JavaScript','TypeScript','React.js','JSON','HTML','CSS','Tailwind CSS','jQuery','SQL','PL/SQL','Firestore','AWS','Critical Thinking','Team Collaboration','Agile Development','Client Interaction'],
    education: [
      { degree: 'BS Software Engineering', institution: 'Arizona State University', end: 'Dec 2023' },
      { degree: 'AS Mathematics/Computer Science', institution: 'CT State Tunxis', end: '2018' }
    ]
  };
  create(sample);
}

module.exports = { list, get, create, update, seedIfEmpty };
