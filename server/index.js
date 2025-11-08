const express = require('express');
const cors = require('cors');
const {
  list: listResumes,
  get: getResume,
  create: createResume,
  update: updateResume,
  listSkills, createSkillEntity, updateSkill, deleteSkill,
  listSkillCategories, createSkillCategory, updateSkillCategory, deleteSkillCategory,
  listExperiences, createExperienceEntity, updateExperienceEntity, deleteExperience,
  listEducation, createEducationEntity, deleteEducation,
  listProjects, createProjectEntity, deleteProject,
  listSocials, createSocialEntity, deleteSocial,
  listContacts, createContactEntity, updateContact, deleteContact,
  seedIfEmpty,
  getTableNames, getTableSchema, queryTable, deleteRecord, updateRecord, insertRecord
} = require('./db');
const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

// seedIfEmpty(); // Commented out - database starts empty

app.get('/api/health', (_,res)=>res.json({status:'ok'}));
app.get('/api/resumes', (_,res)=> res.json(listResumes()));
app.get('/api/resumes/:id', (req,res)=> {
  const r = getResume(Number(req.params.id));
  if(!r) return res.status(404).json({error:'Not found'});
  res.json(r);
});
app.post('/api/resumes', (req,res)=> {
  const created = createResume(req.body);
  res.json(created);
});
app.put('/api/resumes/:id', (req,res)=> {
  const existing = getResume(Number(req.params.id));
  if(!existing) return res.status(404).json({error:'Not found'});
  const updated = updateResume(Number(req.params.id), req.body);
  res.json(updated);
});

// Puppeteer PDF export (identical layout & selectable text)
app.get('/api/resumes/:id/pdf', async (req,res)=> {
  const id = Number(req.params.id);
  const record = getResume(id);
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
app.get('/api/skills', (_,res)=> res.json(listSkills()));
app.post('/api/skills', (req,res)=> res.json(createSkillEntity(req.body)));
app.put('/api/skills/:id', (req,res)=> res.json(updateSkill(Number(req.params.id), req.body)));
app.delete('/api/skills/:id', (req,res)=> { deleteSkill(Number(req.params.id)); res.json({success:true}); });
app.get('/api/skill-categories', (_,res)=> res.json(listSkillCategories()));
app.post('/api/skill-categories', (req,res)=> res.json(createSkillCategory(req.body)));
app.put('/api/skill-categories/:id', (req,res)=> res.json(updateSkillCategory(Number(req.params.id), req.body)));
app.delete('/api/skill-categories/:id', (req,res)=> { deleteSkillCategory(Number(req.params.id)); res.json({success:true}); });
app.get('/api/experiences', (_,res)=> res.json(listExperiences()));
app.post('/api/experiences', (req,res)=> res.json(createExperienceEntity(req.body)));
app.put('/api/experiences/:id', (req,res)=> res.json(updateExperienceEntity(Number(req.params.id), req.body)));
app.delete('/api/experiences/:id', (req,res)=> { deleteExperience(Number(req.params.id)); res.json({success:true}); });
app.get('/api/education', (_,res)=> res.json(listEducation()));
app.post('/api/education', (req,res)=> res.json(createEducationEntity(req.body)));
app.delete('/api/education/:id', (req,res)=> { deleteEducation(Number(req.params.id)); res.json({success:true}); });
app.get('/api/projects', (_,res)=> res.json(listProjects()));
app.post('/api/projects', (req,res)=> res.json(createProjectEntity(req.body)));
app.delete('/api/projects/:id', (req,res)=> { deleteProject(Number(req.params.id)); res.json({success:true}); });
app.get('/api/socials', (_,res)=> res.json(listSocials()));
app.post('/api/socials', (req,res)=> res.json(createSocialEntity(req.body)));
app.delete('/api/socials/:id', (req,res)=> { deleteSocial(Number(req.params.id)); res.json({success:true}); });
app.get('/api/contacts', (_,res)=> res.json(listContacts()));
app.post('/api/contacts', (req,res)=> res.json(createContactEntity(req.body)));
app.put('/api/contacts/:id', (req,res)=> { updateContact(Number(req.params.id), req.body); res.json({success:true}); });
app.delete('/api/contacts/:id', (req,res)=> { deleteContact(Number(req.params.id)); res.json({success:true}); });

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
