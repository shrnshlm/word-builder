export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
  he: { label: 'עברית', flag: '🇮🇱', dir: 'rtl' },
};

const strings = {
  en: {
    title: 'Word Builder',
    subtitle: 'Type a sentence, then rearrange the words to build new ones!',
    inputPlaceholder: 'Type a sentence here…',
    go: 'Go!',
    check: 'Check ✓',
    reset: '↺ Reset',
    new: 'New',
    yourSentence: 'Your sentence',
    wordBank: 'Word bank',
    dragHere: 'Drag words here to build a sentence',
    original: '📝 Original:',
    perfectOriginal: "That's the original sentence — perfect!",
    looksRight: 'Great sentence! That looks right!',
    addMore: 'Try adding more words to make a sentence!',
    insertWord: 'Insert "{word}"',
    swapIt: 'Swap it',
    nounNeeded: 'A noun might be needed after "{word}"',
    twoArticles: 'Two articles in a row — try a noun instead of "{word}"',
    pronounConnect: 'These pronouns might need a connecting word',
    useAn: 'Use "an" before words starting with a vowel sound',
    useA: 'Use "a" before words starting with a consonant sound',
    endingWith: 'Ending with "{word}" — try adding a word after it',
    needsVerb: 'This sentence might need a verb',
    noSubject: 'Try starting with a person or thing (who is doing something?)',
    twoVerbs: '"{word1}" and "{word2}" together — that might be too many verbs in a row',
    articleAtEnd: 'A sentence shouldn\'t end with "{word}"',
    notSure: 'Hmm, not sure about this one — try rearranging!',
    genderMismatchVerb: '"{word}" doesn\'t match the subject — try "{suggestion}"',
    genderMismatchAdj: '"{word}" doesn\'t match — try "{suggestion}"',
    adjAfterNoun: 'In Hebrew, "{adj}" should come after "{noun}"',
    conjAtStart: 'Starting with "{word}" doesn\'t seem right',
    conjAtEnd: 'The sentence shouldn\'t end with "{word}"',
    addWordPlaceholder: 'Type a word to add…',
    examples: [
      'The cat sat on the mat',
      'I like to eat apples',
      'She went to the store',
      'The big dog runs fast',
    ],
  },
  he: {
    title: 'בונה מילים',
    subtitle: 'הקלידו משפט, ואז סדרו מחדש את המילים כדי לבנות משפטים חדשים!',
    inputPlaceholder: 'הקלידו משפט כאן…',
    go: '!קדימה',
    check: '✓ בדיקה',
    reset: 'איפוס ↺',
    new: 'חדש',
    yourSentence: 'המשפט שלך',
    wordBank: 'בנק מילים',
    dragHere: 'גררו מילים לכאן כדי לבנות משפט',
    original: '📝 :מקור',
    perfectOriginal: 'זה המשפט המקורי — מושלם!',
    looksRight: 'משפט מצוין! נראה נכון!',
    addMore: 'נסו להוסיף עוד מילים כדי ליצור משפט!',
    insertWord: 'הוסף "{word}"',
    swapIt: 'החלף',
    nounNeeded: 'אולי צריך שם עצם אחרי "{word}"',
    twoArticles: 'שתי מילות יחס ברצף — נסו שם עצם במקום "{word}"',
    pronounConnect: 'הכינויים האלה אולי צריכים מילת חיבור',
    useAn: 'Use "an" before words starting with a vowel sound',
    useA: 'Use "a" before words starting with a consonant sound',
    endingWith: 'המשפט מסתיים ב-"{word}" — נסו להוסיף מילה אחריו',
    needsVerb: 'אולי חסר פועל במשפט',
    noSubject: 'נסו להתחיל עם מישהו או משהו (מי עושה את הפעולה?)',
    twoVerbs: '"{word1}" ו-"{word2}" ביחד — אולי יותר מדי פעלים ברצף',
    articleAtEnd: 'המשפט לא צריך להסתיים ב-"{word}"',
    notSure: 'הממ, לא בטוח לגבי זה — נסו לסדר מחדש!',
    genderMismatchVerb: '"{word}" לא מתאים לנושא — נסו "{suggestion}"',
    genderMismatchAdj: '"{word}" לא מתאים — נסו "{suggestion}"',
    adjAfterNoun: 'בעברית, "{adj}" צריך לבוא אחרי "{noun}"',
    conjAtStart: 'להתחיל עם "{word}" לא נשמע נכון',
    conjAtEnd: 'המשפט לא צריך להסתיים ב-"{word}"',
    addWordPlaceholder: 'הקלידו מילה להוספה…',
    examples: [
      'הילד הלך לבית הספר',
      'אני אוהב לאכול תפוחים',
      'היא קנתה ספר חדש',
      'הכלב הגדול רץ מהר',
    ],
  },
};

export function t(lang, key, replacements = {}) {
  let str = strings[lang]?.[key] ?? strings.en[key] ?? key;
  for (const [k, v] of Object.entries(replacements)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

export function getExamples(lang) {
  return strings[lang]?.examples ?? strings.en.examples;
}
