import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listNotes, createNote as apiCreate, updateNote as apiUpdate, deleteNote as apiDelete } from '../api/client';

/**
 * A simple random id generator as fallback while optimistic (will be replaced by server id on success).
 */
function tempId() {
  return 'tmp_' + Math.random().toString(36).slice(2, 9);
}

/**
 * Convert an item ensuring required fields exist.
 */
function normalize(n) {
  const now = new Date().toISOString();
  return {
    id: String(n.id ?? tempId()),
    title: n.title ?? '',
    content: n.content ?? '',
    updatedAt: n.updatedAt ?? now,
  };
}

/**
 * Hook to manage notes list and active selection with optimistic updates.
 * // PUBLIC_INTERFACE
 */
export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotes();
      const normalized = (Array.isArray(data) ? data : []).map(normalize);
      if (!mounted.current) return;
      setNotes(normalized.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      if (normalized.length && !selectedNoteId) {
        setSelectedNoteId(normalized[0].id);
      }
    } catch (e) {
      if (!mounted.current) return;
      setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [selectedNoteId]);

  useEffect(() => { reload(); }, [reload]);

  const selectNote = useCallback((id) => {
    setSelectedNoteId(id);
  }, []);

  const createNote = useCallback(async () => {
    setCreating(true);
    setError(null);
    const optimistic = normalize({ title: 'Untitled', content: '' });
    optimistic._optimistic = true;
    setNotes((prev) => [ { ...optimistic }, ...prev ]);
    setSelectedNoteId(optimistic.id);

    try {
      const saved = normalize(await apiCreate({ title: optimistic.title, content: '' }));
      setNotes((prev) => {
        const list = prev.map(n => n.id === optimistic.id ? saved : n);
        return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      setSelectedNoteId(saved.id);
    } catch (e) {
      setNotes((prev) => prev.filter(n => n.id !== optimistic.id));
      setError(e);
    } finally {
      setCreating(false);
    }
  }, []);

  const updateNote = useCallback(async (id, partial) => {
    if (!id) return;
    setUpdating(true);
    setError(null);
    const prev = notes;
    const now = new Date().toISOString();

    const updatedOptimistic = prev.map(n =>
      n.id === id ? { ...n, ...partial, updatedAt: now } : n
    );
    setNotes(updatedOptimistic);

    try {
      const result = normalize(await apiUpdate(id, partial));
      setNotes((curr) => curr.map(n => n.id === id ? result : n));
    } catch (e) {
      // rollback
      setNotes(prev);
      setError(e);
    } finally {
      setUpdating(false);
    }
  }, [notes]);

  const deleteNote = useCallback(async (id) => {
    if (!id) return;
    setDeleting(true);
    setError(null);
    const prev = notes;
    const newList = prev.filter(n => n.id !== id);
    setNotes(newList);
    if (selectedNoteId === id) {
      setSelectedNoteId(newList[0]?.id || null);
    }

    try {
      await apiDelete(id);
    } catch (e) {
      // rollback
      setNotes(prev);
      setSelectedNoteId(id);
      setError(e);
    } finally {
      setDeleting(false);
    }
  }, [notes, selectedNoteId]);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  return {
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
  };
}
