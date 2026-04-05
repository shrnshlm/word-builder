import { LANGUAGES } from '../utils/i18n';

export default function LanguageSelector({ lang, onChange }) {
  return (
    <div className="lang-selector">
      {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
        <button
          key={code}
          className={`lang-btn ${lang === code ? 'active' : ''}`}
          onClick={() => onChange(code)}
        >
          <span className="lang-flag">{flag}</span>
          <span className="lang-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
