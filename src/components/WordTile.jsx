import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { TILE_COLORS } from '../utils/constants';

export default function WordTile({ id, word, colorIndex, isHelper, swap }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: TILE_COLORS[colorIndex % TILE_COLORS.length],
    opacity: isDragging ? 0.5 : isHelper ? 0.8 : 1,
    borderStyle: isHelper ? 'dashed' : 'solid',
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      className="word-tile"
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {word}
      {swap && (
        <motion.div
          className="swap-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          → {swap}
        </motion.div>
      )}
    </motion.div>
  );
}
