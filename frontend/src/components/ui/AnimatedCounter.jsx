import { useEffect, useState } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';

export default function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  prefix = '', 
  suffix = '',
  className = ''
}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000
  });

  useEffect(() => {
    springValue.set(value);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasAnimated(true); // Intentional: we need to track if animation started
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${Math.round(current)}${suffix}`;
  });

  return (
    <motion.span className={className}>
      {hasAnimated ? displayValue : `${prefix}0${suffix}`}
    </motion.span>
  );
}
