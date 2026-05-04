export default function Chip({ label, variant = "default", icon: Icon }) {
  const variants = {
    default: "bg-white/5 border-white/10 text-gray-300",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    primary: "bg-[#00f3ff]/10 border-[#00f3ff]/20 text-[#00f3ff]"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all ${variants[variant]}`}>
      {Icon && <Icon size={12} />}
      {label}
    </div>
  );
}
