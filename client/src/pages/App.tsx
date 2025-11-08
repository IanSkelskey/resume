import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listResumes } from '../api';
import { ResumeData } from '../types';

export default function App() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  useEffect(() => { listResumes().then(setResumes); }, []);
  return (
    <div className="content-page">
      <div className="content-header">
        <h1 className="content-title">My Resumes</h1>
        <p className="content-subtitle">Manage and preview your resumes</p>
      </div>
      <div style={{marginBottom:'20px'}}>
        <Link to="/edit">
          <button style={{fontSize:'14px'}}>+ Create New Resume</button>
        </Link>
      </div>
      {resumes.length === 0 ? (
        <div style={{padding:'40px',textAlign:'center',background:'#fff',borderRadius:'8px',border:'1px solid var(--border)'}}>
          <p style={{color:'var(--muted)',margin:0}}>No resumes yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{display:'grid',gap:'12px'}}>
          {resumes.map(r => (
            <div key={r.id} className="card" style={{padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:600,fontSize:'16px',marginBottom:'4px'}}>
                  {r.label || '(Untitled Resume)'}
                </div>
                <div style={{color:'var(--muted)',fontSize:'13px'}}>
                  {r.name} • {r.title} • Updated {new Date(r.updated_at || '').toLocaleDateString()}
                </div>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <Link to={`/edit/${r.id}`}>
                  <button style={{fontSize:'13px'}}>Edit</button>
                </Link>
                <Link to={`/preview/${r.id}`}>
                  <button style={{fontSize:'13px'}}>Preview</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
