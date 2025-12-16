import React, { useEffect, useRef, useState } from 'react';

/**
 * Debounce hook to delay invoking a callback.
 */
function useDebouncedCallback(cb, delay) {
  const ref = useRef({ cb, t: null });
  useEffect(() => { ref.current.cb = cb; }, [cb]);
  return (...args) => {
    if (ref.current.t) clearTimeout(ref.current.t);
    ref.current.t = setTimeout(() => ref.current.cb(...args), delay);
  };
}

/**
 * Editor for a single note with title and content.
 * Saves on change via debounced onChange calls.
 * // PUBLIC_INTERFACE
 */
export default function NoteEditor({ note, onChange, isSaving, loading, error }) {
  const [local, setLocal] = useState({ title: '', content: '' });

  useEffect(() => {
    if (note) {
      setLocal({ title: note.title || '', content: note.content || '' });
    } else {
      setLocal({ title: '', content: '' });
    }
  }, [note?.id]); // reset on note switch

  const debouncedSave = useDebouncedCallback(onChange, 400);

  function handleTitle(e) {
    const title = e.target.value;
    setLocal((s) => ({ ...s, title }));
    if (note) debouncedSave({ title });
  }

  function handleContent(e) {
    const content = e.target.value;
    setLocal((s) => ({ ...s, content }));
    if (note) debouncedSave({ content });
  }

  if (loading && !note) {
    return <div className="editor-inner"><div className="state" aria-busy="true">Loading editor…</div></div>;
  }

  if (error && !note) {
    return <div className="editor-inner"><div className="state" role="alert">Unable to load note.</div></div>;
  }

  if (!note) {
    return <div className="editor-inner"><div className="state">Select a note or create a new one.</div></div>;
  }

  return (
    <div className="editor-inner">
      <input
        className="input"
        placeholder="Title"
        value={local.title}
        onChange={handleTitle}
        aria-label="Note title"
      />
      <div className="helper">{isSaving ? 'Saving…' : ' '}</div>
      <textarea
        className="textarea"
        placeholder="Start writing your note…"
        value={local.content}
        onChange={handleContent}
        aria-label="Note content"
      />
    </div>
  );
}
