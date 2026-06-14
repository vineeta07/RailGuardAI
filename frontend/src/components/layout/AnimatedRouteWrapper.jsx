import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Phase 7: AnimatedRouteWrapper
 * Fade-in + slight upward slide for snappy page transitions.
 */
export default function AnimatedRouteWrapper({ children }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
