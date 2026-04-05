import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import DroppableZone from './DroppableZone';
import Feedback from './Feedback';
import Confetti from './Confetti';
import { COMMON_HELPERS, analyzeGrammar } from '../utils/grammar';
import { TILE_COLORS } from '../utils/constants';
import { t } from '../utils/i18n';

// Prefer pointerWithin (drops where your finger actually is),
// fall back to rectIntersection so tiles near zone edges still land correctly.
function customCollision(args) {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let tileIdCounter = 0;
function makeTileId() {
  return `tile-${++tileIdCounter}`;
}

function buildInitialState(originalWords, lang) {
  const lowerSet = new Set(originalWords.map(w => w.toLowerCase()));
  const helperList = COMMON_HELPERS[lang] || COMMON_HELPERS.en;
  const helpers = shuffleArray(
    helperList.filter(w => !lowerSet.has(w))
  ).slice(0, Math.min(12, helperList.length));

  const shuffledOriginal = shuffleArray(originalWords);

  const bankItems = [
    ...shuffledOriginal.map((word, i) => ({
      id: makeTileId(),
      word,
      colorIndex: i,
      isHelper: false,
    })),
    ...helpers.map((word, i) => ({
      id: makeTileId(),
      word,
      colorIndex: shuffledOriginal.length + i,
      isHelper: true,
    })),
  ];

  return { bankItems, zoneItems: [] };
}

export default function GameScreen({ sentence, lang, onNewSentence, grammarEnabled, onToggleGrammar }) {
  const originalWords = sentence.split(/\s+/);
  const [{ bankItems, zoneItems }, setState] = useState(() => buildInitialState(originalWords, lang));
  const [feedback, setFeedback] = useState(null);
  const [swapInfo, setSwapInfo] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const pendingAction = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );

  const findItem = useCallback((id) => {
    if (bankItems.find(i => i.id === id)) return 'bank';
    if (zoneItems.find(i => i.id === id)) return 'zone';
    return null;
  }, [bankItems, zoneItems]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setFeedback(null);
    setSwapInfo(null);
    setIsCorrect(false);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findItem(active.id);
    let overContainer = findItem(over.id);

    if (over.id === 'sentence-zone') overContainer = 'zone';
    if (over.id === 'word-bank') overContainer = 'bank';

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setState(prev => {
      const sourceKey = activeContainer === 'bank' ? 'bankItems' : 'zoneItems';
      const destKey = overContainer === 'bank' ? 'bankItems' : 'zoneItems';

      const sourceItems = [...prev[sourceKey]];
      const destItems = [...prev[destKey]];

      const activeIndex = sourceItems.findIndex(i => i.id === active.id);
      if (activeIndex === -1) return prev;

      const [movedItem] = sourceItems.splice(activeIndex, 1);

      const overIndex = destItems.findIndex(i => i.id === over.id);
      if (overIndex >= 0) {
        destItems.splice(overIndex, 0, movedItem);
      } else {
        destItems.push(movedItem);
      }

      return { ...prev, [sourceKey]: sourceItems, [destKey]: destItems };
    });
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findItem(active.id);

    if (activeContainer) {
      const key = activeContainer === 'bank' ? 'bankItems' : 'zoneItems';
      setState(prev => {
        const items = prev[key];
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
        return { ...prev, [key]: arrayMove(items, oldIndex, newIndex) };
      });
    }
  };

  const handleCheck = () => {
    if (zoneItems.length === 0) return;

    setSwapInfo(null);
    const words = zoneItems.map(i => i.word);

    if (words.join(' ') === originalWords.join(' ')) {
      setFeedback({ type: 'success', message: t(lang, 'perfectOriginal') });
      setIsCorrect(true);
      setConfettiKey(k => k + 1);
      return;
    }

    const result = analyzeGrammar(words, originalWords, lang);

    if (result.correct) {
      setFeedback({ type: 'success', message: t(lang, 'looksRight') });
      setIsCorrect(true);
      setConfettiKey(k => k + 1);
    } else if (result.issues.length > 0) {
      const issue = result.issues[0];
      const message = t(lang, issue.messageKey, issue.messageReplace || {});

      if (issue.type === 'swap') {
        const targetItem = zoneItems[issue.position];
        if (targetItem) setSwapInfo({ id: targetItem.id, suggestion: issue.suggestion });

        pendingAction.current = () => {
          setState(prev => {
            const newZone = prev.zoneItems.map(item =>
              item.id === targetItem?.id ? { ...item, word: issue.suggestion } : item
            );
            return { ...prev, zoneItems: newZone };
          });
          setSwapInfo(null);
          setFeedback(null);
        };
        setFeedback({ type: 'suggestion', actionType: 'swap', message, actionLabel: t(lang, 'swapIt') });
      } else if (issue.type === 'insert') {
        pendingAction.current = () => {
          const newTile = { id: makeTileId(), word: issue.word, colorIndex: Math.floor(Math.random() * 10), isHelper: true };
          setState(prev => {
            const newZone = [...prev.zoneItems];
            newZone.splice(issue.position, 0, newTile);
            const newBank = prev.bankItems.filter(i => i.word.toLowerCase() !== issue.word.toLowerCase());
            return { bankItems: newBank, zoneItems: newZone };
          });
          setFeedback(null);
        };
        setFeedback({ type: 'suggestion', actionType: 'insert', message, actionLabel: t(lang, 'insertWord', { word: issue.word }) });
      } else {
        setFeedback({ type: 'hint', message });
      }
    } else {
      // No specific issues found but not confirmed correct either
      setFeedback({ type: 'hint', message: t(lang, 'notSure') });
    }
  };

  const handleAddWord = (word) => {
    const newTile = {
      id: makeTileId(),
      word,
      colorIndex: Math.floor(Math.random() * 10),
      isHelper: true,
    };
    setState(prev => ({
      ...prev,
      bankItems: [...prev.bankItems, newTile],
    }));
  };

  const handleFeedbackAction = () => {
    if (pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  };

  const handleReset = () => {
    setState(buildInitialState(originalWords, lang));
    setFeedback(null);
    setSwapInfo(null);
    setIsCorrect(false);
  };

  const activeItem = activeId
    ? [...bankItems, ...zoneItems].find(i => i.id === activeId)
    : null;

  const isRTL = lang === 'he';

  return (
    <motion.div
      className="screen game-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="game-header">
        <div className="original-sentence" dir={isRTL ? 'rtl' : 'ltr'}>
          {t(lang, 'original')} {sentence}
        </div>
        <div className="header-buttons">
          {grammarEnabled && (
            <button className="btn btn-green" onClick={handleCheck}>
              {t(lang, 'check')}
            </button>
          )}
          <button
            className={`btn ${grammarEnabled ? 'btn-toggle-on' : 'btn-toggle-off'}`}
            onClick={onToggleGrammar}
            title={grammarEnabled ? 'Disable grammar check' : 'Enable grammar check'}
          >
            {grammarEnabled
              ? (lang === 'he' ? 'דקדוק ✓' : 'Grammar ✓')
              : (lang === 'he' ? 'דקדוק ✗' : 'Grammar ✗')
            }
          </button>
          <button className="btn btn-soft" onClick={handleReset}>{t(lang, 'reset')}</button>
          <button className="btn btn-soft" onClick={onNewSentence}>{t(lang, 'new')}</button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={customCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <DroppableZone
          id="sentence-zone"
          items={zoneItems}
          label={t(lang, 'yourSentence')}
          placeholder={t(lang, 'dragHere')}
          isCorrect={isCorrect}
          swapInfo={swapInfo}
        />

        <DroppableZone
          id="word-bank"
          items={bankItems}
          label={t(lang, 'wordBank')}
          onAddWord={handleAddWord}
          addPlaceholder={t(lang, 'addWordPlaceholder')}
          isRTL={lang === 'he'}
        />

        <DragOverlay>
          {activeItem ? (
            <div
              className="word-tile dragging"
              style={{ background: TILE_COLORS[activeItem.colorIndex % TILE_COLORS.length] }}
            >
              {activeItem.word}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Feedback feedback={feedback} onAction={handleFeedbackAction} />
      <Confetti trigger={confettiKey} />
    </motion.div>
  );
}
