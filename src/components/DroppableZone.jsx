import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import WordTile from './WordTile';

export default function DroppableZone({ id, items, label, placeholder, isCorrect, swapInfo, onAddWord, addPlaceholder, isRTL }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [newWord, setNewWord] = useState('');

  const className = [
    'droppable-zone',
    isOver && 'drag-over',
    isCorrect && 'correct',
  ].filter(Boolean).join(' ');

  const handleAdd = () => {
    const trimmed = newWord.trim();
    if (trimmed && onAddWord) {
      onAddWord(trimmed);
      setNewWord('');
    }
  };

  return (
    <div className="zone-section">
      <div className="zone-label">{label}</div>
      <div ref={setNodeRef} className={className}>
        <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
          {items.length === 0 && placeholder && (
            <div className="zone-placeholder">{placeholder}</div>
          )}
          {items.map(item => (
            <WordTile
              key={item.id}
              id={item.id}
              word={item.word}
              colorIndex={item.colorIndex}
              isHelper={item.isHelper}
              swap={swapInfo?.id === item.id ? swapInfo.suggestion : null}
            />
          ))}
        </SortableContext>
      </div>
      {onAddWord && (
        <div className="add-word-row">
          <input
            className="add-word-input"
            type="text"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={addPlaceholder}
            dir={isRTL ? 'rtl' : 'ltr'}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className="btn btn-add"
            onClick={handleAdd}
            disabled={!newWord.trim()}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
