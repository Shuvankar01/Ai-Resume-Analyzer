import { useState } from 'react';
import { LogIn, UserPlus, Sparkles, BrainCircuit } from 'lucide-react';
import { authService } from '../services/authService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRecruiter, setIsRecruiter] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const data = await authService.login(email, password);
        const token = data.access_token;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.is_recruiter ? 'recruiter' : 'candidate';

        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setUser({ token, role });
        addToast('Welcome back!', 'success');
      } else {
        await authService.register({
          email,
          password,
          full_name: fullName,
          is_recruiter: isRecruiter
        });
        setIsLogin(true);
        addToast('Account created successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] overflow-hidden p-6">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f3ff]/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 mb-4 premium-glow">
            <BrainCircuit size={40} className="text-[#00f3ff]" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Resume<span className="text-[#00f3ff]">AI</span>
          </h1>
          <p className="text-gray-500 text-lg">Predictive Talent Intelligence Platform</p>
        </div>

        <div className="glass-panel p-10 md:p-14 rounded-[40px] premium-glow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3ff]/30 to-transparent"></div>
          
          <h2 className="text-3xl font-bold text-center mb-10 text-white tracking-tight">
            {isLogin ? 'Intelligence Access' : 'Initialize Profile'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-[#00f3ff]/40 focus:ring-4 focus:ring-[#00f3ff]/5 outline-none transition-all text-white placeholder:text-gray-700"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Protocol</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-[#00f3ff]/40 focus:ring-4 focus:ring-[#00f3ff]/5 outline-none transition-all text-white placeholder:text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secure Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-[#00f3ff]/40 focus:ring-4 focus:ring-[#00f3ff]/5 outline-none transition-all text-white placeholder:text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                <input
                  type="checkbox"
                  id="recruiter"
                  className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-[#00f3ff] focus:ring-[#00f3ff]/20 outline-none"
                  checked={isRecruiter}
                  onChange={(e) => setIsRecruiter(e.target.checked)}
                />
                <label htmlFor="recruiter" className="text-sm text-gray-400 cursor-pointer select-none">
                  Request Recruiter Privileges
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 premium-gradient text-white rounded-2xl font-bold text-lg shadow-[0_15px_40px_rgba(0,243,255,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLogin ? (
                <><LogIn size={24} /> <span>Establish Link</span></>
              ) : (
                <><UserPlus size={24} /> <span>Create Identifier</span></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "New user?" : "Existing identifier?"}
              <button
                className="ml-2 text-[#00f3ff] font-bold hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Initialize Profile' : 'Establish Link'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
