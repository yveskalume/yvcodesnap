import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const CountUp = ({
  value,
  duration = 2,
  suffix = '',
  className = '',
}: CountUpProps) => {
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
};
