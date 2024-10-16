import { onReady } from "@xatom/core";
import { app } from "./routes";

(window as any).WFDebug = true;

onReady(() => {
  app();
});
