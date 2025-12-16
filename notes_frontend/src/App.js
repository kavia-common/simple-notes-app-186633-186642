import React, { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import NotesSidebar from './components/NotesSidebar';
import NoteEditor from './components/NoteEditor';
import { useNotes } from './hooks/useNotes';

/**
 * Root application component that renders the two-column notes layout.
 * Integrates header actions with the notes state managed by useNotes.
 */
// PUBLIC_INTERFACE
function App() {
  const {
    notes,
    selectedNoteId,
    selectedNote,
    loading,
    error,
    creating,
    updating,
    deleting,
    selectNote,
    createNote,
    updateNote,
    deleteNote,
    reload,
  } = useNotes();

  const [theme, setTheme] = useState('light');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isBusy = loading || creating || updating || deleting;

  return (
    <div className="app-root">
      <Header
        onNew={() => createNote()}
        onDelete={() => selectedNoteId && deleteNote(selectedNoteId)}
        canDelete={!!selectedNoteId && !isBusy}
        isBusy={isBusy}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="layout">
        <aside className="sidebar" aria-label="Notes list">
          <NotesSidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelect={selectNote}
            loading={loading}
            error={error}
            onReload={reload}
          />
        </aside>

        <main className="editor" aria-label="Note editor">
          <NoteEditor
            note={selectedNote}
            onChange={(partial) =>
              selectedNoteId && updateNote(selectedNoteId, partial)
            }
            isSaving={updating}
            loading={loading && !selectedNote}
            error={error}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
