import { platform, arch } from 'os';
import { join, resolve } from 'path';
import { promisify } from 'util';
import { existsSync, createWriteStream, mkdirSync, unlinkSync } from 'fs';
import { get as httpsGet } from 'https';
import { IncomingMessage } from 'http';

// 类型定义
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

// 转录结果段
export interface TranscriptionSegment {
    start: string;
    end: string;
    text: string;
}

// 模型下载选项
export interface ModelDownloadOptions {
    modelName: string;
    outputDir: string;
    onProgress?: (progress: number) => void;
}

// 可用的 whisper 模型
export const AVAILABLE_MODELS = [
    'tiny', 'tiny.en',
    'base', 'base.en',
    'small', 'small.en',
    'medium', 'medium.en',
    'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo',
] as const;

export type WhisperModelName = typeof AVAILABLE_MODELS[number];

const MODEL_BASE_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';

// 平台映射
const PLATFORM_MAPPING: { [key: string]: string } = {
    darwin: 'darwin',
    win32: 'win32',
    linux: 'linux'
};

// 加载原生模块
function loadAddon() {
    const currentPlatform = PLATFORM_MAPPING[platform()];
    const currentArch = arch();

    if (!currentPlatform) {
        throw new Error(`Unsupported platform: ${platform()}`);
    }

    const addonPath = join(
        resolve(__dirname),
        '..',
        'platform',
        `${currentPlatform}-${currentArch}`,
        'whisper.node'
    );

    try {
        const { whisper } = require(addonPath);
        return promisify(whisper);
    } catch (error) {
        throw new Error(`Failed to load native addon: ${error}`);
    }
}

// 验证输入文件
function validateFiles(modelPath: string, inputPath: string): void {
    if (!existsSync(modelPath)) {
        throw new Error(`Model file not found: ${modelPath}`);
    }
    if (!existsSync(inputPath)) {
        throw new Error(`Input audio file not found: ${inputPath}`);
    }
}

// 主方法
export async function transcribe(options: WhisperOptions): Promise<string[][]> {
    // 合并默认参数
    const defaultParams: WhisperParams = {
        language: 'en',
        use_gpu: true,
        flash_attn: false,
        no_prints: true,
        comma_in_time: false,
        translate: true,
        no_timestamps: false,
        audio_ctx: 0,
        max_len: 0,
        ...options
    };

    // 参数验证
    if (!defaultParams.model) {
        throw new Error('Model path is required');
    }

    if (!defaultParams.fname_inp) {
        throw new Error('Input file path is required');
    }

    // 文件存在性验证
    validateFiles(defaultParams.model, defaultParams.fname_inp);

    const whisperAsync = loadAddon();
    return whisperAsync(defaultParams);
}

// 便捷方法：直接返回文本
export async function transcribeToText(options: WhisperOptions): Promise<string> {
    const result = await transcribe(options);
    return result.reduce((text, segment) => text + (segment[2] || ''), '');
}

// 便捷方法：返回结构化结果
export async function transcribeWithSegments(options: WhisperOptions): Promise<TranscriptionSegment[]> {
    const result = await transcribe(options);
    return result.map(segment => ({
        start: segment[0] || '',
        end: segment[1] || '',
        text: segment[2] || '',
    }));
}

// 下载模型
export async function downloadModel(options: ModelDownloadOptions): Promise<string> {
    const { modelName, outputDir, onProgress } = options;

    if (!AVAILABLE_MODELS.includes(modelName as WhisperModelName)) {
        throw new Error(
            `Unknown model "${modelName}". Available models: ${AVAILABLE_MODELS.join(', ')}`
        );
    }

    const fileName = `ggml-${modelName}.bin`;
    const outputPath = join(outputDir, fileName);

    if (existsSync(outputPath)) {
        return outputPath;
    }

    mkdirSync(outputDir, { recursive: true });

    const url = `${MODEL_BASE_URL}/${fileName}`;

    return new Promise<string>((resolvePromise, reject) => {
        const download = (downloadUrl: string) => {
            httpsGet(downloadUrl, (response: IncomingMessage) => {
                // Handle redirects
                if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    download(response.headers.location);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download model: HTTP ${response.statusCode}`));
                    return;
                }

                const totalSize = parseInt(response.headers['content-length'] || '0', 10);
                let downloadedSize = 0;

                const fileStream = createWriteStream(outputPath);
                response.pipe(fileStream);

                response.on('data', (chunk: Buffer) => {
                    downloadedSize += chunk.length;
                    if (onProgress && totalSize > 0) {
                        onProgress(Math.round((downloadedSize / totalSize) * 100));
                    }
                });

                fileStream.on('finish', () => {
                    fileStream.close(() => resolvePromise(outputPath));
                });

                fileStream.on('error', (err) => {
                    fileStream.close(() => {
                        unlinkSync(outputPath);
                        reject(err);
                    });
                });
            }).on('error', reject);
        };

        download(url);
    });
}

// 命令行支持
if (require.main === module) {
    const params = process.argv.slice(2).reduce((acc: any, arg) => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            acc[key] = value ? (isNaN(Number(value)) ? value : Number(value)) : true;
        }
        return acc;
    }, {});

    transcribe(params)
        .then(console.log)
        .catch(err => {
            console.error('Transcription failed:', err);
            process.exit(1);
        });
}
