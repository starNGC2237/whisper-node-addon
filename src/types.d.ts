export interface WhisperOptions {
    language?: string;
    model: string;
    fname_inp: string;
    use_gpu?: boolean;
    flash_attn?: boolean;
    no_prints?: boolean;
    comma_in_time?: boolean;
    translate?: boolean;
    no_timestamps?: boolean;
    audio_ctx?: number;
    max_len?: number;
}

export interface TranscriptionSegment {
    start: string;
    end: string;
    text: string;
}

export interface ModelDownloadOptions {
    modelName: string;
    outputDir: string;
    onProgress?: (progress: number) => void;
}

export declare const AVAILABLE_MODELS: readonly [
    'tiny', 'tiny.en',
    'base', 'base.en',
    'small', 'small.en',
    'medium', 'medium.en',
    'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo',
];

export type WhisperModelName = typeof AVAILABLE_MODELS[number];

export declare function transcribe(options: WhisperOptions): Promise<string[][]>;
export declare function transcribeToText(options: WhisperOptions): Promise<string>;
export declare function transcribeWithSegments(options: WhisperOptions): Promise<TranscriptionSegment[]>;
export declare function downloadModel(options: ModelDownloadOptions): Promise<string>;
