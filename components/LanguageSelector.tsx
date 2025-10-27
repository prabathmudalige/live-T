import React from 'react';

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  disabled: boolean;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Malayalam'
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onSelectLanguage,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <select
        id={label}
        value={selectedLanguage}
        onChange={(e) => onSelectLanguage(e.target.value)}
        disabled={disabled}
        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};