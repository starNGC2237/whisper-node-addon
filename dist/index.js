"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_MODELS = void 0;
exports.transcribe = transcribe;
exports.transcribeToText = transcribeToText;
exports.transcribeWithSegments = transcribeWithSegments;
exports.downloadModel = downloadModel;
const os_1 = require("os");
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
const https_1 = require("https");
// 可用的 whisper 模型
exports.AVAILABLE_MODELS = [
    'tiny', 'tiny.en',
    'base', 'base.en',
    'small', 'small.en',
    'medium', 'medium.en',
    'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo',
];
const MODEL_BASE_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';
// 平台映射
const PLATFORM_MAPPING = {
    darwin: 'darwin',
    win32: 'win32',
    linux: 'linux'
};
// 加载原生模块
function loadAddon() {
    const currentPlatform = PLATFORM_MAPPING[(0, os_1.platform)()];
    const currentArch = (0, os_1.arch)();
    if (!currentPlatform) {
        throw new Error(`Unsupported platform: ${(0, os_1.platform)()}`);
    }
    const addonPath = (0, path_1.join)((0, path_1.resolve)(__dirname), '..', 'platform', `${currentPlatform}-${currentArch}`, 'whisper.node');
    try {
        const { whisper } = require(addonPath);
        return (0, util_1.promisify)(whisper);
    }
    catch (error) {
        throw new Error(`Failed to load native addon: ${error}`);
    }
}
// 验证输入文件
function validateFiles(modelPath, inputPath) {
    if (!(0, fs_1.existsSync)(modelPath)) {
        throw new Error(`Model file not found: ${modelPath}`);
    }
    if (!(0, fs_1.existsSync)(inputPath)) {
        throw new Error(`Input audio file not found: ${inputPath}`);
    }
}
// 主方法
function transcribe(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // 合并默认参数
        const defaultParams = Object.assign({ language: 'en', use_gpu: true, flash_attn: false, no_prints: true, comma_in_time: false, translate: true, no_timestamps: false, audio_ctx: 0, max_len: 0 }, options);
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
    });
}
// 便捷方法：直接返回文本
function transcribeToText(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield transcribe(options);
        return result.reduce((text, segment) => text + (segment[2] || ''), '');
    });
}
// 便捷方法：返回结构化结果
function transcribeWithSegments(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield transcribe(options);
        return result.map(segment => ({
            start: segment[0] || '',
            end: segment[1] || '',
            text: segment[2] || '',
        }));
    });
}
// 下载模型
function downloadModel(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { modelName, outputDir, onProgress } = options;
        if (!exports.AVAILABLE_MODELS.includes(modelName)) {
            throw new Error(`Unknown model "${modelName}". Available models: ${exports.AVAILABLE_MODELS.join(', ')}`);
        }
        const fileName = `ggml-${modelName}.bin`;
        const outputPath = (0, path_1.join)(outputDir, fileName);
        if ((0, fs_1.existsSync)(outputPath)) {
            return outputPath;
        }
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        const url = `${MODEL_BASE_URL}/${fileName}`;
        return new Promise((resolvePromise, reject) => {
            const download = (downloadUrl) => {
                (0, https_1.get)(downloadUrl, (response) => {
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
                    const fileStream = (0, fs_1.createWriteStream)(outputPath);
                    response.pipe(fileStream);
                    response.on('data', (chunk) => {
                        downloadedSize += chunk.length;
                        if (onProgress && totalSize > 0) {
                            onProgress(Math.round((downloadedSize / totalSize) * 100));
                        }
                    });
                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolvePromise(outputPath);
                    });
                    fileStream.on('error', (err) => {
                        fileStream.close();
                        reject(err);
                    });
                }).on('error', reject);
            };
            download(url);
        });
    });
}
// 命令行支持
if (require.main === module) {
    const params = process.argv.slice(2).reduce((acc, arg) => {
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
