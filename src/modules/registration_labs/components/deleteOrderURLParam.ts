// src/modules/labs/components/deleteOrderURLParam.ts
import { apiClient } from "../../../api/apiConfig";

const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: params.get("session_id"),
  };
};

const stripParamFromUrl = (key: string) => {
  const ps = new URLSearchParams(window.location.search);
  ps.delete(key);
  const base = window.location.pathname;
  const qs = ps.toString();
  window.history.replaceState({}, document.title, base + (qs ? `?${qs}` : ""));
};

/**
 * If ?session_id=cs_... is present, call Xano to cancel the order,
 * then remove the param from the URL.
 */
export const initializeDeleteOrderFromUrl = async () => {
  const { sessionId } = getUrlParams();
  if (!sessionId) return;

  try {
    const req = apiClient.delete(`/registration/cancel_order/${encodeURIComponent(sessionId)}`);

    await new Promise<void>((resolve, reject) => {
      req.onData(() => {
        // Success (any 2xx). Strip the param so it won't re-trigger.
        stripParamFromUrl("session_id");
        resolve();
      });
      req.onError((err) => reject(err));
      req.fetch();
    });
  } catch (err) {
    console.error("Error canceling order with session_id:", sessionId, err);
    // Optional: still strip param to avoid repeated attempts
    // stripParamFromUrl("session_id");
  }
};
