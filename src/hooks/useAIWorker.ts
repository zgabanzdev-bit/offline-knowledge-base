import { useEffect, useRef, useCallback, useState } from 'react';

interface PendingRequest<T = unknown> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export function useAIWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef<Map<string, PendingRequest<unknown>>>(new Map());
  const [progress, setProgress] = useState<{ status: string; progress?: number } | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent) => {
      const { id, type, payload } = e.data;

      if (type === 'progress') {
        setProgress(payload);
        return;
      }

      const request = pending.current.get(id);
      if (!request) return;

      if (type === 'result') {
        setProgress(null);
        request.resolve(payload);
      } else if (type === 'error') {
        setProgress(null);
        request.reject(new Error(payload));
      }
      pending.current.delete(id);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const call = useCallback(<T>(message: Record<string, unknown>): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('AI worker not initialized'));
        return;
      }

      const id = crypto.randomUUID();

      pending.current.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      workerRef.current.postMessage({ id, ...message });
    });
  }, []);

  return {
    progress,
    summarize: (text: string) => call<string>({ type: 'summarize', text }),
    embed: (text: string) => call<number[]>({ type: 'embed', text }),
    classify: (text: string, labels: string[]) =>
      call<{ labels: string[]; scores: number[] }>({ type: 'classify', text, labels }),
  };
}
