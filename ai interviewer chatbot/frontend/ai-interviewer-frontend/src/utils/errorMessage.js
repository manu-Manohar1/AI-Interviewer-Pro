/**
 * Turns an axios error (or anything else that gets thrown) into a plain,
 * human-readable string.
 *
 * Without this, `alert(err)` or `alert(err.response.data)` on a FastAPI
 * error renders as the literal text "[object Object]", because FastAPI's
 * error body is a JSON object like { detail: "..." } (or, for 422
 * validation errors, { detail: [ { msg: "...", loc: [...] }, ... ] }),
 * and JavaScript's default string coercion on an object just gives you
 * "[object Object]" instead of anything useful.
 */
export function getErrorMessage(err) {
  if (!err) return "Something went wrong. Please try again.";

  // Request timed out (see api.js's 30s timeout) -- most commonly because
  // the backend was asleep (Render free tier) and took too long to wake up.
  if (err.code === "ECONNABORTED") {
    return "The server is taking longer than usual to respond (it may be waking up). Please try again in a moment.";
  }

  // Network error / no response at all (backend down, CORS block, offline, etc.)
  if (err.message === "Network Error" || !err.response) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  const data = err.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data.detail === "string") {
    return data.detail;
  }

  // FastAPI 422 validation errors: detail is an array of { msg, loc }
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((d) => (d && typeof d.msg === "string" ? d.msg : null))
      .filter(Boolean)
      .join(" ") || "Please check the form and try again.";
  }

  if (err.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (err.response?.status === 403) {
    return "You don't have permission to do that.";
  }

  if (err.response?.status >= 500) {
    return "The server hit a problem on its end. Please try again in a moment.";
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  return "Something went wrong. Please try again.";
}
