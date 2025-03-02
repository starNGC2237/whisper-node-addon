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
export interface WhisperParams extends WhisperOptions {
    [key: string]: any;
}
export declare function transcribe(options: WhisperOptions): Promise<string>;
