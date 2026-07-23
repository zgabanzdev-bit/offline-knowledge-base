import { pipeline } from '@huggingface/transformers';

type SummarizationPipeline = Awaited<ReturnType<typeof pipeline<'summarization'>>>;
type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline<'feature-extraction'>>>;
type ZeroShotClassificationPipeline = Awaited<
  ReturnType<typeof pipeline<'zero-shot-classification'>>
>;

let summarizer: SummarizationPipeline | null = null;
let embedder: FeatureExtractionPipeline | null = null;
let classifier: ZeroShotClassificationPipeline | null = null;

type WorkerRequest =
  | { id: string; type: 'summarize'; text: string }
  | { id: string; type: 'embed'; text: string }
  | { id: string; type: 'classify'; text: string; labels: string[] };

type ProgressPayload = { status: string; progress?: number; file?: string };

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, type } = e.data;

  const onProgress = (data: ProgressPayload) => {
    self.postMessage({ id, type: 'progress', payload: data });
  };

  try {
    switch (type) {
      case 'summarize': {
        summarizer ??= await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
          progress_callback: onProgress,
          dtype: 'fp32',
        });
        const result = await summarizer(e.data.text, { max_new_tokens: 120 });
        self.postMessage({ id, type: 'result', payload: result[0].summary_text });
        break;
      }

      case 'embed': {
        embedder ??= await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          progress_callback: onProgress,
        });
        const output = await embedder(e.data.text, { pooling: 'mean', normalize: true });
        self.postMessage({ id, type: 'result', payload: Array.from(output.data) });
        break;
      }

      case 'classify': {
        classifier ??= await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall', {
          progress_callback: onProgress,
          dtype: 'fp32',
        });
        const result = await classifier(e.data.text, e.data.labels, { multi_label: true });
        self.postMessage({ id, type: 'result', payload: result });
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown AI worker error',
    });
  }
};
