import { isValidElement, createElement } from 'react';
import { FileX2 } from 'lucide-react';
import GlassCard from './GlassCard';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; // Used as motion.div

export default function EmptyState({ 
  icon = <FileX2 className="w-12 h-12 text-gray-500" />,
  title = "No Data Available", 
  description = "Get started by uploading a document or performing an action.",
  action 
}) {
  // `icon` may be a rendered element (the default) or a component reference
  // such as `icon={BarChart2}`. Rendering a component reference bare as a child
  // throws "Objects are not valid as a React child" because Lucide icons are
  // forwardRef objects, so instantiate it into an element first.
  const iconNode = isValidElement(icon)
    ? icon
    : icon
      ? createElement(icon, { className: "w-12 h-12 text-gray-500" })
      : null;

  return (
    <GlassCard className="flex flex-col items-center justify-center p-16 text-center border-dashed border-white/10 hover:border-white/20 transition-all">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-0 rounded-full bg-(--primary)/20 blur-xl animate-pulse" />
        {iconNode}
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </GlassCard>
  );
}
