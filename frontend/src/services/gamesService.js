import { apiRequest } from "./api.js";

const query = (previewXp) =>
  previewXp === undefined || previewXp === null ? "" : `?previewXp=${encodeURIComponent(previewXp)}`;

/**
 * The three code games with their lock state, decided by the server from the student's real XP.
 * previewXp only has an effect for admins (the "student view" test bar).
 * Endpoint: GET /games
 */
export function fetchGames(previewXp) {
  return apiRequest(`/games${query(previewXp)}`, { method: "GET" });
}

/**
 * One game's state; rejects while the game is locked for the student.
 * Endpoint: GET /games/:gameId
 */
export function fetchGame(gameId, previewXp) {
  return apiRequest(`/games/${encodeURIComponent(gameId)}${query(previewXp)}`, { method: "GET" });
}

/**
 * Sends a finished game's proof (seeds + code). The server re-runs it and, the first time it
 * passes, awards the game's XP and badge.
 * Endpoint: POST /games/:gameId/complete
 */
export function completeGame(gameId, proof) {
  return apiRequest(`/games/${encodeURIComponent(gameId)}/complete`, {
    method: "POST",
    body: JSON.stringify({ proof }),
  });
}

/**
 * Sends an endless Robot Maze run (seeds + code of every cleared level). The server replays it
 * and keeps it as the student's record when it is better.
 * Endpoint: POST /games/robot-maze/endless
 */
export function submitEndlessRun(proof) {
  return apiRequest("/games/robot-maze/endless", {
    method: "POST",
    body: JSON.stringify({ proof }),
  });
}
