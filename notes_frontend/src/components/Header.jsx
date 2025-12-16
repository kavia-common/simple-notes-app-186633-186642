import React from 'react';

/**
 * App header with title and action buttons.
 * // PUBLIC_INTERFACE
 */
export default function Header({
  onNew,
  onDelete,
  canDelete,
  isBusy,
  theme,
  onToggleTheme
}) {
  return (
    <header className="header">
      <div className="header-title">
        <span role="img" aria-label="note">📝</span>
        <span>Notes</span>
        <span className="badge">Simple</span>
      </div>
      <div className="header-actions">
        <button
          className="btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button
          className="btn btn-primary"
          onClick={onNew}
          aria-label="Create new note"
          disabled={isBusy}
        >
          + New Note
        </button>
        <button
          className="btn btn-danger"
          onClick={onDelete}
          aria-label="Delete selected note"
          disabled={!canDelete}
        >
          Delete
        </button>
      </div>
    </header>
  );
}
