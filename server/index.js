const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const {
  list: listResumes,
  get: getResume,
  create: createResume,
  update: updateResume,
  listSkills, createSkillEntity, updateSkill, deleteSkill,
  listSkillCategories, createSkillCategory, updateSkillCategory, deleteSkillCategory,
  listExperiences, createExperienceEntity, updateExperienceEntity, deleteExperience,
  listEducation, createEducationEntity, deleteEducation,
  listProjects, createProjectEntity, updateProjectEntity, deleteProject,
  listSocials, createSocialEntity, deleteSocial,
  listContacts, createContactEntity, updateContact, deleteContact,
  seedIfEmpty,
  createUser, getUserByUsername, getUserById, verifyPassword, updateUserPassword,
  getTableNames, getTableSchema, queryTable, deleteRecord, updateRecord, insertRecord
} = require('./db');
const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: process.env.SESSION_SECRET || 'resume-app-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// seedIfEmpty(); // Commented out - database starts empty

app.get('/api/health', (_,res)=>res.json({status:'ok'}));

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const user = createUser(username, password, email);
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const user = getUserByUsername(username);
  
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ id: user.id, username: user.username, email: user.email });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = getUserById(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/auth/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  const user = getUserByUsername(req.session.username);
  
  if (!verifyPassword(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  updateUserPassword(req.session.userId, newPassword);
  res.json({ success: true });
});

// Resume endpoints (protected)
app.get('/api/resumes', requireAuth, (req,res)=> res.json(listResumes(req.session.userId)));
app.get('/api/resumes/:id', requireAuth, (req,res)=> {
  const r = getResume(Number(req.params.id), req.session.userId);
  if(!r) return res.status(404).json({error:'Not found'});
  res.json(r);
});
app.post('/api/resumes', requireAuth, (req,res)=> {
  const created = createResume(req.body, req.session.userId);
  res.json(created);
});
app.put('/api/resumes/:id', requireAuth, (req,res)=> {
  const existing = getResume(Number(req.params.id), req.session.userId);
  if(!existing) return res.status(404).json({error:'Not found'});
  const updated = updateResume(Number(req.params.id), req.body, req.session.userId);
  res.json(updated);
});
app.delete('/api/resumes/:id', requireAuth, (req,res)=> {
  const existing = getResume(Number(req.params.id), req.session.userId);
  if(!existing) return res.status(404).json({error:'Not found'});
  deleteRecord('resumes', Number(req.params.id));
  res.json({success:true});
});

// Puppeteer PDF export (identical layout & selectable text)
app.get('/api/resumes/:id/pdf', requireAuth, async (req,res)=> {
  const id = Number(req.params.id);
  const record = getResume(id, req.session.userId);
  if(!record) return res.status(404).json({error:'Not found'});
  try {
    const puppeteer = require('puppeteer');
    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const url = `${origin}/preview/${id}?pdf=1`; // pdf flag can hide buttons if desired
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    // Ensure the resume canvas fills the page; set explicit print styles
    await page.addStyleTag({ content: `#resume-canvas{margin:0;padding:0}` });
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0in', bottom: '0in', left: '0in', right: '0in' },
      preferCSSPageSize: false
    });
    await browser.close();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="resume.pdf"');
    res.send(Buffer.from(pdf));
  } catch (e){
    console.error(e);
    res.status(500).json({error:'PDF generation failed'});
  }
});

// Library entity endpoints
app.get('/api/skills', requireAuth, (req,res)=> res.json(listSkills(req.session.userId)));
app.post('/api/skills', requireAuth, (req,res)=> res.json(createSkillEntity(req.body, req.session.userId)));
app.put('/api/skills/:id', requireAuth, (req,res)=> res.json(updateSkill(Number(req.params.id), req.body, req.session.userId)));
app.delete('/api/skills/:id', requireAuth, (req,res)=> { deleteSkill(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/skill-categories', requireAuth, (req,res)=> res.json(listSkillCategories(req.session.userId)));
app.post('/api/skill-categories', requireAuth, (req,res)=> res.json(createSkillCategory(req.body, req.session.userId)));
app.put('/api/skill-categories/:id', requireAuth, (req,res)=> res.json(updateSkillCategory(Number(req.params.id), req.body, req.session.userId)));
app.delete('/api/skill-categories/:id', requireAuth, (req,res)=> { deleteSkillCategory(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/experiences', requireAuth, (req,res)=> res.json(listExperiences(req.session.userId)));
app.post('/api/experiences', requireAuth, (req,res)=> res.json(createExperienceEntity(req.body, req.session.userId)));
app.put('/api/experiences/:id', requireAuth, (req,res)=> res.json(updateExperienceEntity(Number(req.params.id), req.body, req.session.userId)));
app.delete('/api/experiences/:id', requireAuth, (req,res)=> { deleteExperience(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/education', requireAuth, (req,res)=> res.json(listEducation(req.session.userId)));
app.post('/api/education', requireAuth, (req,res)=> res.json(createEducationEntity(req.body, req.session.userId)));
app.delete('/api/education/:id', requireAuth, (req,res)=> { deleteEducation(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/projects', requireAuth, (req,res)=> res.json(listProjects(req.session.userId)));
app.post('/api/projects', requireAuth, (req,res)=> res.json(createProjectEntity(req.body, req.session.userId)));
app.put('/api/projects/:id', requireAuth, (req,res)=> res.json(updateProjectEntity(Number(req.params.id), req.body, req.session.userId)));
app.delete('/api/projects/:id', requireAuth, (req,res)=> { deleteProject(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/socials', requireAuth, (req,res)=> res.json(listSocials(req.session.userId)));
app.post('/api/socials', requireAuth, (req,res)=> res.json(createSocialEntity(req.body, req.session.userId)));
app.delete('/api/socials/:id', requireAuth, (req,res)=> { deleteSocial(Number(req.params.id), req.session.userId); res.json({success:true}); });
app.get('/api/contacts', requireAuth, (req,res)=> res.json(listContacts(req.session.userId)));
app.post('/api/contacts', requireAuth, (req,res)=> res.json(createContactEntity(req.body, req.session.userId)));
app.put('/api/contacts/:id', requireAuth, (req,res)=> { updateContact(Number(req.params.id), req.body, req.session.userId); res.json({success:true}); });
app.delete('/api/contacts/:id', requireAuth, (req,res)=> { deleteContact(Number(req.params.id), req.session.userId); res.json({success:true}); });

// Database admin endpoints
app.get('/api/db/tables', (_,res)=> res.json(getTableNames()));
app.get('/api/db/tables/:name/schema', (req,res)=> res.json(getTableSchema(req.params.name)));
app.get('/api/db/tables/:name/records', (req,res)=> res.json(queryTable(req.params.name)));
app.post('/api/db/tables/:name/records', (req,res)=> {
  const id = insertRecord(req.params.name, req.body);
  res.json({success:true, id});
});
app.put('/api/db/tables/:name/records/:id', (req,res)=> {
  updateRecord(req.params.name, Number(req.params.id), req.body);
  res.json({success:true});
});
app.delete('/api/db/tables/:name/records/:id', (req,res)=> {
  deleteRecord(req.params.name, Number(req.params.id));
  res.json({success:true});
});

app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
