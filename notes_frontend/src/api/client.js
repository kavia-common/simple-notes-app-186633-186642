"use strict";

/**
 * Resolve the base URL for the backend API.
 * Prefers REACT_APP_API_BASE, then REACT_APP_BACKEND_URL, else window.location.origin.
 * Trailing slashes are stripped to ensure predictable URL joining.
 */
// PUBLIC_INTERFACE
export function getBaseUrl() {
  const fromEnv =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  // Fallback to browser origin if no env is provided
  const base =
    (fromEnv && String(fromEnv)) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  return String(base).replace(/\/+$/, "");
}

const BASE = getBaseUrl();

/**
 * Internal helper to perform JSON fetch calls with sensible defaults.
 * Always prefixes requests with the resolved BASE.
 * @param {string} path
 * @param {RequestInit} init
 * @returns {Promise<any>}
 */
async function api(path, init = {}) {
  const normalizedPath = String(path || "");
  const url = `${BASE}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text || res.statusText };
    }
    const err = new Error(payload.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

/**
 * Note typedef is declared in src/types.js
 */

/**
 * List notes.
 * // PUBLIC_INTERFACE
 * @returns {Promise<Array<import('../types').Note>>}
 */
export async function listNotes() {
  return api(`/api/notes`, { method: "GET" });
}

/**
 * Get a single note by id.
 * // PUBLIC_INTERFACE
 * @param {string} id
 * @returns {Promise<import('../types').Note>}
 */
export async function getNote(id) {
  return api(`/api/notes/${encodeURIComponent(id)}`, { method: "GET" });
}

/**
 * Create a note. Title/content optional; backend may default values.
 * // PUBLIC_INTERFACE
 * @param {{title?: string, content?: string}} data
 * @returns {Promise<import('../types').Note>}
 */
export async function createNote(data = {}) {
  return api(`/api/notes`, { method: "POST", body: JSON.stringify(data) });
}

/**
 * Update a note by id with partial fields.
 * // PUBLIC_INTERFACE
 * @param {string} id
 * @param {{title?: string, content?: string}} data
 * @returns {Promise<import('../types').Note>}
 */
export async function updateNote(id, data) {
  return api(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data || {}),
  });
}

/**
 * Delete a note by id.
 * // PUBLIC_INTERFACE
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  await api(`/api/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export const __internal = { getBaseUrl };
