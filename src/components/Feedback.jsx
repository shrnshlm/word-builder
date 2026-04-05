import { motion, AnimatePresence } from 'framer-motion';

export default function Feedback({ feedback, onAction }) {
  if (!feedback) return null;

  const typeClass = {
    success: 'feedback-success',
    suggestion: 'feedback-suggestion',
    hint: 'feedback-hint',
  }[feedback.type] || 'feedback-hint';

  const icon = {
    success: '⭐',
    suggestion: feedback.actionType === 'swap' ? '🔄' : '💡',
    hint: '🤔',
  }[feedback.type];

  return (
    <AnimatePresence>
      <motion.div
        className={`feedback-panel ${typeClass}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <span className="feedback-icon">{icon}</span>
        <span className="feedback-text">{feedback.message}</span>
        {feedback.actionLabel && (
          <button className="feedback-action" onClick={onAction}>
            {feedback.actionLabel}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
