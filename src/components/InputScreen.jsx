import { useState } from 'react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { t, getExamples } from '../utils/i18n';

const logoBlocks = [
  { letter: 'W', heLetter: 'מ', color: '#E8786A', rotate: '-5deg', delay: 0 },
  { letter: 'O', heLetter: 'י', color: '#6CB4D8', rotate: '3deg', delay: 0.15 },
  { letter: 'R', heLetter: 'ל', color: '#7CB342', rotate: '-2deg', delay: 0.3 },
  { letter: 'D', heLetter: 'י', color: '#F5C842', rotate: '4deg', delay: 0.45 },
  { letter: 'S', heLetter: 'ם', color: '#80CBC4', rotate: '-3deg', delay: 0.6 },
];

export default function InputScreen({ onStart, lang, onLangChange }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) onStart(trimmed);
  };

  const examples = getExamples(lang);
  const blocks = lang === 'he' ? [...logoBlocks].reverse() : logoBlocks;

  return (
    <motion.div
      className="screen input-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <LanguageSelector lang={lang} onChange={onLangChange} />

      <div className="logo-blocks">
        {blocks.map((b, i) => (
          <motion.div
            key={i}
            className="logo-block"
            style={{ background: b.color, '--r': b.rotate }}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: b.delay }}
          >
            {lang === 'he' ? b.heLetter : b.letter}
          </motion.div>
        ))}
      </div>

      <h1 className="title-text">{t(lang, 'title')}</h1>
      <p className="subtitle">{t(lang, 'subtitle')}</p>

      <div className="input-area">
        <input
          className="sentence-input"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={t(lang, 'inputPlaceholder')}
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck={false}
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        />
        <button className="btn btn-primary" onClick={handleSubmit}>{t(lang, 'go')}</button>
      </div>

      <div className="example-sentences">
        {examples.map((s, i) => (
          <button
            key={i}
            className="example-pill"
            onClick={() => { setText(s); onStart(s); }}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
