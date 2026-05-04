export default function SkillProgressBar({ skill, level, color = "bg-[#00f3ff]" }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-gray-300">{skill}</span>
        <span className="text-xs text-gray-500 font-mono">{level}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,243,255,0.4)]`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
}
