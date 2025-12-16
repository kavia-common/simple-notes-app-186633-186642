import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Format a date into a user-friendly string.
 * @param {string|number|Date} d
 */
function fmt(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return '';
  }
}

/**
 * Sidebar that lists notes with keyboard navigation.
 * - Up/Down arrows navigate
 * - Enter selects
 * // PUBLIC_INTERFACE
 */
export default function NotesSidebar({
  notes,
  selectedNoteId,
  onSelect,
  loading,
  error,
  onReload,
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, notes.findIndex(n => n.id === selectedNoteId))
  );

  useEffect(() => {
    if (!notes?.length) {
      setActiveIndex(0);
      return;
    }
    const idx = notes.findIndex(n => n.id === selectedNoteId);
    if (idx >= 0) setActiveIndex(idx);
  }, [selectedNoteId, notes]);

  const onKeyDown = useCallback(
    (e) => {
      if (!notes?.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(notes.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const note = notes[activeIndex];
        if (note) onSelect(note.id);
      }
    },
    [notes, activeIndex, onSelect]
  );

  const items = useMemo(() => notes || [], [notes]);

  if (error) {
    return (
      <div className="state" role="alert">
        <div>Failed to load notes.</div>
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={onReload}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-root" ref={containerRef} tabIndex={0} onKeyDown={onKeyDown} aria-label="Notes Sidebar">
      <div className="sidebar-header">
        <div style={{ fontWeight: 600, fontSize: 14 }}>Notes</div>
        {loading ? <span className="badge" aria-live="polite">Loading…</span> : null}
      </div>
      <div className="sidebar-list" role="listbox" aria-activedescendant={items[activeIndex]?.id || ''}>
        {items.length === 0 && !loading ? (
          <div className="state">No notes yet. Create a new one!</div>
        ) : null}
        {items.map((n, idx) => {
          const active = n.id === selectedNoteId || idx === activeIndex;
          return (
            <div
              key={n.id}
              id={n.id}
              role="option"
              aria-selected={active}
              className={`note-item ${active ? 'active' : ''}`}
              onClick={() => onSelect(n.id)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="note-title" title={n.title || 'Untitled'}>
                {n.title?.trim() || 'Untitled'}
              </div>
              <div className="note-meta">Updated {fmt(n.updatedAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
