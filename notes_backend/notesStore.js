"use strict";

/**
 * Simple in-memory notes store.
 * Each note: { id: string, title: string, content: string, updatedAt: ISOString }
 */

function isoNow() {
  return new Date().toISOString();
}

function makeId() {
  // Random URL-safe string
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

const _notes = new Map();

// Seed data
(function seed() {
  const a = {
    id: makeId(),
    title: "Welcome to Notes",
    content: "This is a sample note. You can edit or delete it.",
    updatedAt: isoNow(),
  };
  const b = {
    id: makeId(),
    title: "Second note",
    content: "Another example note.",
    updatedAt: isoNow(),
  };
  _notes.set(a.id, a);
  _notes.set(b.id, b);
})();

/**
 * Convert map to sorted array by updatedAt desc.
 */
function list() {
  return Array.from(_notes.values()).sort(
    (x, y) => new Date(y.updatedAt) - new Date(x.updatedAt)
  );
}

/**
 * Get a single note by ID.
 * @param {string} id
 * @returns {object|null}
 */
function get(id) {
  return _notes.get(String(id)) || null;
}

/**
 * Validate title/content fields.
 * Title is required non-empty string; content optional but must be string if provided.
 * @param {any} body
 * @returns {{valid: boolean, errors?: Array<{field: string, message: string}>}}
 */
function validateCreate(body) {
  const errors = [];
  const title = body?.title;
  const content = body?.content;

  if (typeof title !== "string" || title.trim() === "") {
    errors.push({ field: "title", message: "Title is required and must be a non-empty string." });
  }
  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Content must be a string if provided." });
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

/**
 * For updates, both fields are optional, but must be strings if provided.
 * @param {any} body
 * @returns {{valid: boolean, errors?: Array<{field: string, message: string}>}}
 */
function validateUpdate(body) {
  const errors = [];
  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
    errors.push({ field: "title", message: "Title, if provided, must be a non-empty string." });
  }
  if (body.content !== undefined && typeof body.content !== "string") {
    errors.push({ field: "content", message: "Content, if provided, must be a string." });
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

/**
 * Create a note.
 * @param {{title: string, content?: string}} data
 * @returns {object} created note
 */
function create(data) {
  const id = makeId();
  const note = {
    id,
    title: data.title,
    content: data.content ?? "",
    updatedAt: isoNow(),
  };
  _notes.set(id, note);
  return note;
}

/**
 * Update a note by id with partial data.
 * @param {string} id
 * @param {{title?: string, content?: string}} partial
 * @returns {object|null} updated note or null if missing
 */
function update(id, partial) {
  const current = _notes.get(String(id));
  if (!current) return null;
  const updated = {
    ...current,
    ...(partial.title !== undefined ? { title: partial.title } : {}),
    ...(partial.content !== undefined ? { content: partial.content } : {}),
    updatedAt: isoNow(),
  };
  _notes.set(current.id, updated);
  return updated;
}

/**
 * Delete a note by id.
 * @param {string} id
 * @returns {boolean} whether deletion happened
 */
function remove(id) {
  return _notes.delete(String(id));
}

// PUBLIC_INTERFACE
module.exports = {
  list,
  get,
  create,
  update,
  remove,
  validateCreate,
  validateUpdate,
};
