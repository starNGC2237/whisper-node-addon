# ⚠️ Development Status Warning

This library <code>whisper-node-addon</code> is currently in <strong>early experimental phase</strong>. APIs may change breakingly and production use is not recommended!<br/>

For stable & production-ready solutions, please use the mature library: <a href="https://github.com/ChetanXpro/nodejs-whisper">ChetanXpro/nodejs-whisper</a> 👈 or <a href="https://github.com/ggerganov/whisper.cpp">whisper.cpp</a>

# whisper-node-addon 🌐🔉

[![npm version](https://img.shields.io/npm/v/whisper-node-addon)](https://www.npmjs.com/package/whisper.cpp-platform-bindings)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Automatic whisper.cpp bindings for Node.js & Electron across all platforms.**

[简体中文](README-zh.md)

## ✨ Features

- 🔗 **Native whisper.cpp bindings** — High-performance speech-to-text via Node.js N-API addon
- 🖥️ **Cross-platform** — Supports Windows x64, macOS x64/arm64, Linux x64
- ⚡ **Electron & Node.js** — Automatic compilation for your runtime and ABI version
- 🎯 **Multiple output formats** — Raw segments, plain text, or structured `TranscriptionSegment` objects
- 📥 **Model downloader** — Built-in utility to download pre-trained models from Hugging Face
- 🛡️ **Input validation** — Checks model and audio file existence before transcription
- 🔧 **GPU & Flash Attention** — Optional GPU acceleration and Flash Attention support
- 📝 **TypeScript** — Full type definitions included

## 📦 Installation
```bash
npm i whisper-node-addon
```

During installation, you will be prompted to select a runtime (Node.js or Electron) and its version. The native addon will be automatically compiled for your environment.

### Non-interactive / CI Mode

Set environment variables to skip the interactive prompts:
```bash
# Build for Node.js
WHISPER_RUNTIME=node WHISPER_RUNTIME_VERSION=20.0.0 npm i whisper-node-addon

# Build for Electron
WHISPER_RUNTIME=electron WHISPER_RUNTIME_VERSION=31.7.7 npm i whisper-node-addon
```

When running in a non-TTY environment (e.g. CI pipelines), the script defaults to building for the current Node.js version.

## 🚀 Usage

### Basic Transcription
```javascript
import { transcribe } from 'whisper-node-addon/dist'
const modelPath = path.resolve('./resources/models/ggml-base.bin')

// Transcribe audio — returns raw segments [start, end, text]
const result = await transcribe({
    language: 'zh',
    model: modelPath,
    fname_inp: tempFilePath,
    translate: false
})
```

### Get Text Directly
```javascript
import { transcribeToText } from 'whisper-node-addon/dist'

// Returns concatenated text string directly
const text = await transcribeToText({
    model: modelPath,
    fname_inp: audioFile,
    language: 'en'
})
console.log(text)
```

### Structured Segments
```javascript
import { transcribeWithSegments } from 'whisper-node-addon/dist'

// Returns typed TranscriptionSegment[] with { start, end, text }
const segments = await transcribeWithSegments({
    model: modelPath,
    fname_inp: audioFile,
    language: 'en'
})
segments.forEach(seg => {
    console.log(`[${seg.start} -> ${seg.end}] ${seg.text}`)
})
```

### Download Models
```javascript
import { downloadModel, AVAILABLE_MODELS } from 'whisper-node-addon/dist'

// List available models
console.log(AVAILABLE_MODELS)
// ['tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en',
//  'medium', 'medium.en', 'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo']

// Download a model with progress tracking
const modelPath = await downloadModel({
    modelName: 'base',
    outputDir: './models',
    onProgress: (progress) => console.log(`Downloading: ${progress}%`)
})
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `model` | `string` | *(required)* | Path to the `.bin` model file |
| `fname_inp` | `string` | *(required)* | Path to the input audio file (WAV format) |
| `language` | `string` | `'en'` | Language code (e.g. `'en'`, `'zh'`, `'ja'`) |
| `use_gpu` | `boolean` | `true` | Enable GPU acceleration |
| `flash_attn` | `boolean` | `false` | Enable Flash Attention |
| `translate` | `boolean` | `true` | Translate to English |
| `no_timestamps` | `boolean` | `false` | Omit timestamps from output |
| `no_prints` | `boolean` | `true` | Suppress native library output |
| `comma_in_time` | `boolean` | `false` | Use comma as decimal separator in timestamps |
| `audio_ctx` | `number` | `0` | Audio context size (0 = default) |
| `max_len` | `number` | `0` | Max segment token length (0 = no limit) |

## 🛠 Build from Source (Optional)
```bash
# Build binaries for all platforms
npm run build
```

## 📂 File Structure
```
whisper-node-addon/
├── src/                    # TypeScript source code
│   ├── index.ts           # Main module (transcribe, downloadModel, etc.)
│   └── types.d.ts         # Type definitions
├── dist/                   # Compiled JavaScript output
├── deps/
│   └── whisper.cpp/       # whisper.cpp git submodule
├── platform/              # Pre-compiled native binaries
│   ├── darwin-arm64/
│   ├── darwin-x64/
│   ├── linux-x64/
│   └── win32-x64/
├── scripts/
│   └── install.js         # Post-install build script
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 TODO

- [ ] Streaming transcription support
- [ ] Audio format auto-conversion (mp3, flac, ogg → wav)
- [ ] Worker thread support for non-blocking transcription
- [ ] Transcription event callbacks (on segment complete)

## ⚖️ License
MIT © 2025 starNGC2237
