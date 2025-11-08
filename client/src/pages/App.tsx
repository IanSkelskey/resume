import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listResumes } from '../api';
import { ResumeData } from '../types';

export default function App() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  useEffect(() => { listResumes().then(setResumes); }, []);
  return (
    <div style={{padding:'2rem', fontFamily:'Inter, sans-serif'}}>
      <h1>Resume Builder</h1>
      <div style={{display:'flex', gap:'12px', marginTop:'8px'}}>
        <Link to="/edit">Create New Resume</Link>
        <Link to="/library">Manage Library Data</Link>
      </div>
      <ul style={{marginTop:'1rem'}}>
        {resumes.map(r => (
          <li key={r.id} style={{marginBottom:'0.5rem'}}>
            <strong>{r.name || 'Untitled'}</strong> – <Link to={`/edit/${r.id}`}>Edit</Link> | <Link to={`/preview/${r.id}`}>Preview</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
