"use strict";

/**
 * Express Notes Backend
 *
 * Routes:
 * - GET /health - healthcheck endpoint
 * - GET /api/notes - list all notes
 * - GET /api/notes/:id - get note by id
 * - POST /api/notes - create a note (title required, content optional)
 * - PUT /api/notes/:id - update a note (title/content optional)
 * - DELETE /api/notes/:id - delete a note
 *
 * Environment variables:
 * - PORT: server port (default 4000)
 * - FRONTEND_URL: allowed CORS origin for the frontend (e.g., http://localhost:3000)
 * - LOG_LEVEL: log level for request logging (info|tiny|dev). Default: tiny
 * - HEALTHCHECK_PATH: override health endpoint path (default: /health)
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const {
  list,
  get,
  create,
  update,
  remove,
  validateCreate,
  validateUpdate,
} = require("./notesStore");

// Configuration
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "";
const LOG_LEVEL = process.env.LOG_LEVEL || "tiny";
const HEALTHCHECK_PATH = process.env.HEALTHCHECK_PATH || "/health";

// App
const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from configured FRONTEND_URL, local dev no-origin, or same-origin tools
    const allowed =
      !FRONTEND_URL ||
      FRONTEND_URL === "*" ||
      origin === FRONTEND_URL ||
      origin === undefined; // allow curl/postman/no-origin
    if (allowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());

// Logging
app.use(morgan(LOG_LEVEL));

// Helpers

/**
 * Send a consistent error JSON response.
 * @param {express.Response} res
 * @param {number} status
 * @param {string} message
 * @param {object} [details]
 */
function sendError(res, status, message, details) {
  return res.status(status).json({
    error: {
      message,
      status,
      ...(details ? { details } : {}),
    },
  });
}

// Routes

/**
 * Healthcheck endpoint
 * Returns basic status and time.
 */
app.get(HEALTHCHECK_PATH, (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * List notes
 */
app.get("/api/notes", (req, res) => {
  res.json(list());
});

/**
 * Get note by id
 */
app.get("/api/notes/:id", (req, res) => {
  const note = get(req.params.id);
  if (!note) return sendError(res, 404, "Note not found");
  res.json(note);
});

/**
 * Create note
 * Body: { title: string, content?: string }
 */
app.post("/api/notes", (req, res) => {
  const validation = validateCreate(req.body);
  if (!validation.valid) {
    return sendError(res, 400, "Validation failed", { errors: validation.errors });
  }
  const note = create({ title: req.body.title, content: req.body.content });
  res.status(201).json(note);
});

/**
 * Update note
 * Body: { title?: string, content?: string }
 */
app.put("/api/notes/:id", (req, res) => {
  const note = get(req.params.id);
  if (!note) return sendError(res, 404, "Note not found");

  const validation = validateUpdate(req.body);
  if (!validation.valid) {
    return sendError(res, 400, "Validation failed", { errors: validation.errors });
  }

  const updated = update(req.params.id, {
    title: req.body.title,
    content: req.body.content,
  });
  res.json(updated);
});

/**
 * Delete note
 */
app.delete("/api/notes/:id", (req, res) => {
  const note = get(req.params.id);
  if (!note) return sendError(res, 404, "Note not found");
  remove(req.params.id);
  res.status(204).send();
});

// Fallback 404
app.use((req, res) => {
  return sendError(res, 404, "Not Found");
});

// Error handler
app.use((err, req, res, next) => {
  // If CORS error or other runtime error
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  return sendError(res, status, message);
});

// Start server
app.listen(PORT, () => {
  const originInfo = FRONTEND_URL || "*";
  console.log(
    `[notes_backend] Listening on http://localhost:${PORT} | CORS origin: ${originInfo} | health: ${HEALTHCHECK_PATH}`
  );
});
