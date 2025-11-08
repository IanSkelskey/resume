const express = require('express');
const cors = require('cors');
const { list, get, create, update, seedIfEmpty } = require('./db');
const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

seedIfEmpty();

app.get('/api/health', (_,res)=>res.json({status:'ok'}));
app.get('/api/resumes', (_,res)=> res.json(list()));
app.get('/api/resumes/:id', (req,res)=> {
  const r = get(Number(req.params.id));
  if(!r) return res.status(404).json({error:'Not found'});
  res.json(r);
});
app.post('/api/resumes', (req,res)=> {
  const created = create(req.body);
  res.json(created);
});
app.put('/api/resumes/:id', (req,res)=> {
  const existing = get(Number(req.params.id));
  if(!existing) return res.status(404).json({error:'Not found'});
  const updated = update(Number(req.params.id), req.body);
  res.json(updated);
});

// Puppeteer PDF export (identical layout & selectable text)
app.get('/api/resumes/:id/pdf', async (req,res)=> {
  const id = Number(req.params.id);
  const record = get(id);
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

app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
