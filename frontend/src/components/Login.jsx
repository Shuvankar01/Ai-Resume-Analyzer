import { useState } from 'react';
import axios from 'axios';
import { LogIn, UserPlus } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await axios.post(`${API_URL}/auth/login`, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const token = response.data.access_token;
        // Parse JWT to get role (simplified)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.is_recruiter ? 'recruiter' : 'candidate';
        
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setUser({ token, role });
      } else {
        await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
          full_name: fullName,
          is_recruiter: isRecruiter
        });
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl neon-border">
        <h2 className="text-3xl font-bold text-center mb-6 neon-text">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded border border-red-500/50">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full p-3 rounded bg-black/40 border border-gray-600 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] outline-none transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 rounded bg-black/40 border border-gray-600 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 rounded bg-black/40 border border-gray-600 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {!isLogin && (
            <div className="flex items-center mt-4">
              <input 
                type="checkbox" 
                id="recruiter"
                className="w-4 h-4 text-[#00f3ff] bg-black border-gray-600 rounded focus:ring-[#00f3ff]"
                checked={isRecruiter}
                onChange={(e) => setIsRecruiter(e.target.checked)}
              />
              <label htmlFor="recruiter" className="ml-2 text-sm text-gray-300">I am a Recruiter</label>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 mt-6 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#00f3ff]/20 to-[#00f3ff]/10 hover:from-[#00f3ff]/40 hover:to-[#00f3ff]/20 border border-[#00f3ff]/50 rounded font-medium transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.4)]"
          >
            {isLogin ? <><LogIn size={20} /> <span>Sign In</span></> : <><UserPlus size={20} /> <span>Sign Up</span></>}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="text-[#00f3ff] hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
