import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min?url";

type WorkerConfigState = {
  configured: boolean;
  workerSrc?: string;
};

const state: WorkerConfigState = {
  configured: false,
};

function configureWorker(): boolean {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    state.configured = true;
    state.workerSrc = workerSrc;

    console.log("[PDF Worker] ✓ Configured:", {
      workerSrc,
      version: pdfjsLib.version,
    });

    return true;
  } catch (err) {
    console.error("[PDF Worker] ❌ Failed to configure worker", err);
    return false;
  }
}

/**
 * Ensure worker is ready
 */
export function ensurePdfWorker(): boolean {
  if (state.configured && pdfjsLib.GlobalWorkerOptions.workerSrc) {
    return true;
  }
  return configureWorker();
}

/**
 * Debug info
 */
export function getWorkerConfig() {
  return {
    configured: state.configured,
    workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
    version: pdfjsLib.version,
  };
}

/**
 * Reset (dev only)
 */
export function resetPdfWorker(): void {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  state.configured = false;

  console.log("[PDF Worker] Reset complete");
}

/**
 * Safe init
 */
export function initPdfWorker(): boolean {
  if (typeof window === "undefined") return false;
  return ensurePdfWorker();
}

// auto-init (safe)
if (typeof window !== "undefined") {
  configureWorker();
}

export default pdfjsLib;
