import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-[#00f3ff]" size={20} />
  };

  const backgrounds = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-[#00f3ff]/10 border-[#00f3ff]/20'
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl glass-panel border shadow-2xl ${backgrounds[type]}`}>
        {icons[type]}
        <p className="text-sm font-medium text-white pr-4">{message}</p>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white transition">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
