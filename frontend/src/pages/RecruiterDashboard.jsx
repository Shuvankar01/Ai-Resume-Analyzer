import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

export default function RecruiterDashboard() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-20 md:ml-64 transition-all duration-300">
        <Navbar />
        
        <div className="animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
