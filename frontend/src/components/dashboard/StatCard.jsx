import { motion } from 'framer-motion';

/**
 * Glassmorphic stat card with icon, label, value, and optional change indicator.
 */
export default function StatCard({ icon: Icon, label, value, change, changeDir, color = 'blue', delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className={`stat-card-icon ${color}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {change && (
          <div className={`stat-card-change ${changeDir || 'up'}`}>
            {changeDir === 'down' ? '↓' : '↑'} {change}
          </div>
        )}
      </div>
    </motion.div>
  );
}
