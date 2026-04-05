import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import InputScreen from './components/InputScreen';
import GameScreen from './components/GameScreen';
import { LANGUAGES } from './utils/i18n';
import './App.css';

function App() {
  const [sentence, setSentence] = useState(null);
  const [lang, setLang] = useState('he');
  const [grammarEnabled, setGrammarEnabled] = useState(true);

  const dir = LANGUAGES[lang].dir;

  return (
    <div dir={dir}>
      <AnimatePresence mode="wait">
        {!sentence ? (
          <InputScreen
            key="input"
            lang={lang}
            onLangChange={setLang}
            onStart={setSentence}
          />
        ) : (
          <GameScreen
            key={sentence}
            sentence={sentence}
            lang={lang}
            grammarEnabled={grammarEnabled}
            onToggleGrammar={() => setGrammarEnabled(g => !g)}
            onNewSentence={() => setSentence(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
