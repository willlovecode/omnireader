import { create } from 'zustand';

export interface RenderJob {
  id: string;
  url: string;
  /** Only resolve once this selector exists in the rendered DOM — for pages
   *  whose content streams in after load (e.g. client-hydrated grids). */
  waitForSelector?: string;
  timeoutMs: number;
  resolve: (html: string) => void;
  reject: (error: Error) => void;
}

interface WebViewQueueState {
  currentJob: RenderJob | null;
  queue: RenderJob[];
  /** True once we've decided the page is stuck on an interactive
   *  human-verification challenge (not just a silent JS one) — the render
   *  host switches from hidden to an on-screen overlay so the user can
   *  complete it. */
  needsManualVerification: boolean;
  enqueue: (job: RenderJob) => void;
  finishCurrent: () => void;
  setNeedsManualVerification: (value: boolean) => void;
}

// Serialized, one job at a time — WebViews are heavy, and running several
// concurrently would make an already-slow path slower and harder to reason
// about (which one is showing a verification prompt?).
export const useWebViewQueue = create<WebViewQueueState>((set, get) => ({
  currentJob: null,
  queue: [],
  needsManualVerification: false,
  enqueue: (job) => {
    set((state) => ({ queue: [...state.queue, job] }));
    if (!get().currentJob) startNext(set, get);
  },
  finishCurrent: () => {
    set({ currentJob: null, needsManualVerification: false });
    startNext(set, get);
  },
  setNeedsManualVerification: (needsManualVerification) => set({ needsManualVerification }),
}));

function startNext(
  set: (partial: Partial<WebViewQueueState>) => void,
  get: () => WebViewQueueState,
) {
  const [next, ...rest] = get().queue;
  if (next) set({ currentJob: next, queue: rest });
}
