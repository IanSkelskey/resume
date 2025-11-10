import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(username, password);
      setUser(user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 600 }}>Welcome back</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Sign in to your resume builder account
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '16px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
