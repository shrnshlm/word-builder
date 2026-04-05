// ══════════════════════════════════════════════════
// ENGLISH
// ══════════════════════════════════════════════════
const EN_ARTICLES = ['a', 'an', 'the'];
const EN_PREPS = ['in', 'on', 'at', 'to', 'from', 'with', 'by', 'for', 'of', 'about', 'into', 'over', 'under', 'between', 'through'];
const EN_PRONOUNS_SUBJ = ['i', 'you', 'he', 'she', 'it', 'we', 'they'];
const EN_PRONOUNS_OBJ = ['me', 'him', 'her', 'us', 'them'];
const EN_PRONOUNS = [...EN_PRONOUNS_SUBJ, ...EN_PRONOUNS_OBJ];
const EN_BE = ['is', 'are', 'was', 'were', 'am'];
const EN_AUX = ['can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did', 'has', 'have', 'had'];
const EN_CONJ = ['and', 'but', 'or', 'nor', 'so', 'yet'];
const EN_VERBS = ['go', 'run', 'eat', 'like', 'want', 'see', 'get', 'make', 'know', 'think', 'come', 'take', 'give', 'say', 'tell', 'put', 'read', 'play', 'walk', 'talk', 'sit', 'stand', 'open', 'close', 'write', 'sat', 'ran', 'ate', 'went', 'saw', 'got', 'made', 'knew', 'thought', 'came', 'took', 'gave', 'said', 'told', 'wrote'];

function isEnVerb(w) {
  return EN_BE.includes(w) || EN_AUX.includes(w) || EN_VERBS.includes(w) ||
    w.endsWith('ed') || w.endsWith('ing') || (w.endsWith('s') && !EN_PRONOUNS.includes(w) && !EN_ARTICLES.includes(w) && !EN_PREPS.includes(w));
}

function isEnNoun(w) {
  return !EN_ARTICLES.includes(w) && !EN_PREPS.includes(w) && !EN_PRONOUNS.includes(w) &&
    !EN_BE.includes(w) && !EN_AUX.includes(w) && !EN_CONJ.includes(w) && !EN_VERBS.includes(w) &&
    !['not', 'very', 'too', 'also', 'just', 'only'].includes(w);
}

function analyzeEnglish(words, originalWords) {
  const lower = words.map(w => w.toLowerCase());
  const issues = [];
  let hasSubject = false;
  let hasVerb = false;
  let structureOk = true;

  if (words.length < 2) {
    return { correct: false, issues: [{ type: 'hint', messageKey: 'addMore' }] };
  }

  // ── Check: subject exists (pronoun or article+noun at start) ──
  if (EN_PRONOUNS_SUBJ.includes(lower[0])) {
    hasSubject = true;
  } else if (EN_ARTICLES.includes(lower[0]) && words.length >= 2 && isEnNoun(lower[1])) {
    hasSubject = true;
  } else if (isEnNoun(lower[0])) {
    hasSubject = true;
  }

  // ── Check: verb exists ──
  hasVerb = lower.some(w => isEnVerb(w));

  // ── Article + article ──
  for (let i = 0; i < lower.length - 1; i++) {
    if (EN_ARTICLES.includes(lower[i]) && EN_ARTICLES.includes(lower[i + 1])) {
      issues.push({ type: 'hint', messageKey: 'twoArticles', messageReplace: { word: words[i + 1] } });
      structureOk = false;
    }
  }

  // ── Article at end ──
  if (EN_ARTICLES.includes(lower[lower.length - 1])) {
    issues.push({ type: 'hint', messageKey: 'articleAtEnd', messageReplace: { word: words[words.length - 1] } });
    structureOk = false;
  }

  // ── Preposition at end ──
  if (EN_PREPS.includes(lower[lower.length - 1]) && words.length > 2) {
    issues.push({ type: 'hint', messageKey: 'endingWith', messageReplace: { word: words[words.length - 1] } });
    structureOk = false;
  }

  // ── Article followed by verb (no noun between) ──
  for (let i = 0; i < lower.length - 1; i++) {
    if (EN_ARTICLES.includes(lower[i]) && isEnVerb(lower[i + 1]) && !isEnNoun(lower[i + 1])) {
      issues.push({ type: 'hint', messageKey: 'nounNeeded', messageReplace: { word: words[i] } });
      structureOk = false;
      break;
    }
  }

  // ── "a" before vowel / "an" before consonant ──
  for (let i = 0; i < lower.length - 1; i++) {
    if (lower[i] === 'a' && /^[aeiou]/i.test(lower[i + 1])) {
      issues.push({ type: 'swap', position: i, suggestion: 'an', messageKey: 'useAn' });
    }
    if (lower[i] === 'an' && /^[bcdfghjklmnpqrstvwxyz]/i.test(lower[i + 1])) {
      issues.push({ type: 'swap', position: i, suggestion: 'a', messageKey: 'useA' });
    }
  }

  // ── Two verbs in a row (without "to" between) ──
  for (let i = 0; i < lower.length - 1; i++) {
    if (isEnVerb(lower[i]) && isEnVerb(lower[i + 1]) && lower[i + 1] !== 'be' && !lower[i + 1].endsWith('ing')) {
      if (!EN_AUX.includes(lower[i]) && lower[i] !== 'to') {
        issues.push({ type: 'hint', messageKey: 'twoVerbs', messageReplace: { word1: words[i], word2: words[i + 1] } });
        structureOk = false;
      }
    }
  }

  // ── Pronoun + pronoun ──
  for (let i = 0; i < lower.length - 1; i++) {
    if (EN_PRONOUNS.includes(lower[i]) && EN_PRONOUNS.includes(lower[i + 1])) {
      issues.push({ type: 'insert', position: i + 1, word: 'and', messageKey: 'pronounConnect' });
      structureOk = false;
    }
  }

  // ── No subject ──
  if (!hasSubject) {
    issues.push({ type: 'hint', messageKey: 'noSubject' });
    structureOk = false;
  }

  // ── No verb ──
  if (!hasVerb && words.length >= 2) {
    issues.push({ type: 'hint', messageKey: 'needsVerb' });
    structureOk = false;
  }

  // A sentence needs both subject and verb and no structural issues to be correct
  const correct = hasSubject && hasVerb && structureOk && issues.length === 0;
  return { correct, issues };
}

// ══════════════════════════════════════════════════
// HEBREW
// ══════════════════════════════════════════════════
const HE_PREPS = ['ב', 'ל', 'מ', 'על', 'עם', 'אל', 'מן', 'בין', 'אחרי', 'לפני', 'ליד', 'תחת', 'בתוך', 'מעל', 'בלי'];
const HE_PRONOUNS = ['אני', 'אתה', 'את', 'הוא', 'היא', 'אנחנו', 'אתם', 'אתן', 'הם', 'הן'];
const HE_CONJ = ['ו', 'או', 'אבל', 'אלא', 'גם', 'רק', 'כי', 'אם', 'כש', 'לכן'];
const HE_FEMININE = new Set(['היא', 'את', 'הן', 'אתן']);
const HE_MASCULINE = new Set(['הוא', 'אתה', 'הם', 'אתם']);

const HE_VERB_PAIRS = [
  ['הלך', 'הלכה'], ['רץ', 'רצה'], ['אכל', 'אכלה'], ['קנה', 'קנתה'],
  ['כתב', 'כתבה'], ['קרא', 'קראה'], ['שיחק', 'שיחקה'], ['ישב', 'ישבה'],
  ['עמד', 'עמדה'], ['פתח', 'פתחה'], ['סגר', 'סגרה'], ['נתן', 'נתנה'],
  ['אמר', 'אמרה'], ['ראה', 'ראתה'], ['שמע', 'שמעה'], ['ידע', 'ידעה'],
  ['אהב', 'אהבה'], ['לקח', 'לקחה'],
  ['אוהב', 'אוהבת'], ['רוצה', 'רוצה'], ['יודע', 'יודעת'],
  ['רואה', 'רואה'], ['חושב', 'חושבת'], ['שומע', 'שומעת'],
  ['בא', 'באה'],
];

const HE_ADJ_PAIRS = [
  ['גדול', 'גדולה'], ['קטן', 'קטנה'], ['חדש', 'חדשה'], ['ישן', 'ישנה'],
  ['יפה', 'יפה'], ['טוב', 'טובה'], ['רע', 'רעה'], ['חזק', 'חזקה'],
  ['גבוה', 'גבוהה'], ['נמוך', 'נמוכה'], ['ארוך', 'ארוכה'], ['קצר', 'קצרה'],
  ['מהיר', 'מהירה'], ['חכם', 'חכמה'], ['שמח', 'שמחה'], ['עצוב', 'עצובה'],
];

const HE_MASC_VERBS = new Set(HE_VERB_PAIRS.map(p => p[0]));
const HE_FEM_VERBS = new Set(HE_VERB_PAIRS.map(p => p[1]));
const HE_ALL_VERBS = new Set([...HE_MASC_VERBS, ...HE_FEM_VERBS]);
const HE_MASC_ADJS = new Set(HE_ADJ_PAIRS.map(p => p[0]));
const HE_FEM_ADJS = new Set(HE_ADJ_PAIRS.map(p => p[1]));
const HE_ALL_ADJS = new Set([...HE_MASC_ADJS, ...HE_FEM_ADJS]);

function getHeVerbSwap(v) {
  for (const [m, f] of HE_VERB_PAIRS) {
    if (v === m) return f;
    if (v === f) return m;
  }
  return null;
}
function getHeAdjSwap(a) {
  for (const [m, f] of HE_ADJ_PAIRS) {
    if (a === m) return f;
    if (a === f) return m;
  }
  return null;
}

function isHeVerb(w) {
  return HE_ALL_VERBS.has(w) || w.endsWith('תי') || w.endsWith('נו') || w.endsWith('תם') || w.endsWith('תן');
}

function isHeNoun(w) {
  return !HE_PRONOUNS.includes(w) && !HE_PREPS.includes(w) &&
    !HE_CONJ.includes(w) && !HE_ALL_ADJS.has(w) && !isHeVerb(w) &&
    !['ה', 'של', 'את', 'לא', 'יש', 'אין', 'מאוד', 'עוד', 'כבר', 'רק', 'כל', 'זה', 'זאת'].includes(w);
}

function analyzeHebrew(words, originalWords) {
  const issues = [];
  let structureOk = true;
  let hasSubject = false;
  let hasVerb = false;

  if (words.length < 2) {
    return { correct: false, issues: [{ type: 'hint', messageKey: 'addMore' }] };
  }

  // Detect subject
  const subjectGender = (() => {
    for (const w of words) {
      if (HE_FEMININE.has(w)) return 'f';
      if (HE_MASCULINE.has(w)) return 'm';
    }
    return null;
  })();

  hasSubject = words.some(w => HE_PRONOUNS.includes(w) || isHeNoun(w));
  hasVerb = words.some(w => isHeVerb(w));

  // ── Gender mismatch: verb ──
  if (subjectGender) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (subjectGender === 'f' && HE_MASC_VERBS.has(w)) {
        const fem = getHeVerbSwap(w);
        if (fem && fem !== w) {
          issues.push({ type: 'swap', position: i, suggestion: fem, messageKey: 'genderMismatchVerb', messageReplace: { word: w, suggestion: fem } });
          structureOk = false;
        }
      }
      if (subjectGender === 'm' && HE_FEM_VERBS.has(w) && !HE_MASC_VERBS.has(w)) {
        const masc = getHeVerbSwap(w);
        if (masc && masc !== w) {
          issues.push({ type: 'swap', position: i, suggestion: masc, messageKey: 'genderMismatchVerb', messageReplace: { word: w, suggestion: masc } });
          structureOk = false;
        }
      }
    }

    // ── Gender mismatch: adjective ──
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (subjectGender === 'f' && HE_MASC_ADJS.has(w)) {
        const fem = getHeAdjSwap(w);
        if (fem && fem !== w) {
          issues.push({ type: 'swap', position: i, suggestion: fem, messageKey: 'genderMismatchAdj', messageReplace: { word: w, suggestion: fem } });
          structureOk = false;
        }
      }
      if (subjectGender === 'm' && HE_FEM_ADJS.has(w) && !HE_MASC_ADJS.has(w)) {
        const masc = getHeAdjSwap(w);
        if (masc && masc !== w) {
          issues.push({ type: 'swap', position: i, suggestion: masc, messageKey: 'genderMismatchAdj', messageReplace: { word: w, suggestion: masc } });
          structureOk = false;
        }
      }
    }
  }

  // ── Adjective before noun (Hebrew: adjective comes AFTER noun) ──
  for (let i = 0; i < words.length - 1; i++) {
    if (HE_ALL_ADJS.has(words[i]) && isHeNoun(words[i + 1])) {
      issues.push({ type: 'hint', messageKey: 'adjAfterNoun', messageReplace: { adj: words[i], noun: words[i + 1] } });
      structureOk = false;
    }
  }

  // ── Two pronouns in a row ──
  for (let i = 0; i < words.length - 1; i++) {
    if (HE_PRONOUNS.includes(words[i]) && HE_PRONOUNS.includes(words[i + 1])) {
      issues.push({ type: 'insert', position: i + 1, word: 'ו', messageKey: 'pronounConnect' });
      structureOk = false;
    }
  }

  // ── Preposition at end ──
  if (HE_PREPS.includes(words[words.length - 1]) && words.length > 2) {
    issues.push({ type: 'hint', messageKey: 'endingWith', messageReplace: { word: words[words.length - 1] } });
    structureOk = false;
  }

  // ── Conjunction at start (except valid starters) ──
  if (HE_CONJ.includes(words[0]) && !['גם', 'רק'].includes(words[0])) {
    issues.push({ type: 'hint', messageKey: 'conjAtStart', messageReplace: { word: words[0] } });
    structureOk = false;
  }

  // ── Conjunction at end ──
  if (HE_CONJ.includes(words[words.length - 1])) {
    issues.push({ type: 'hint', messageKey: 'conjAtEnd', messageReplace: { word: words[words.length - 1] } });
    structureOk = false;
  }

  // ── No verb ──
  if (!hasVerb && words.length >= 3) {
    issues.push({ type: 'hint', messageKey: 'needsVerb' });
    structureOk = false;
  }

  // ── No subject ──
  if (!hasSubject) {
    issues.push({ type: 'hint', messageKey: 'noSubject' });
    structureOk = false;
  }

  const correct = hasSubject && hasVerb && structureOk && issues.length === 0;
  return { correct, issues };
}

// ══════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════
export const COMMON_HELPERS = {
  en: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'in', 'on', 'at', 'and', 'but', 'or', 'it', 'he', 'she', 'they', 'we', 'I', 'my', 'your', 'this', 'that', 'very', 'not', 'can', 'will', 'do', 'does', 'did', 'has', 'have', 'had', 'with', 'for', 'of', 'from'],
  he: ['ה', 'של', 'את', 'הוא', 'היא', 'אני', 'לא', 'גם', 'על', 'עם', 'אל', 'מן', 'כל', 'זה', 'זאת', 'יש', 'אין', 'עוד', 'רק', 'כי', 'אם', 'או', 'אבל', 'מאוד', 'טוב', 'גדול', 'קטן', 'חדש', 'יפה'],
};

/**
 * Returns { correct: boolean, issues: Issue[] }
 * correct is only true if the sentence passes ALL structural checks.
 */
export function analyzeGrammar(words, originalWords, lang = 'en') {
  if (lang === 'he') return analyzeHebrew(words, originalWords);
  return analyzeEnglish(words, originalWords);
}
