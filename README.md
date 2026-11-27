# ⚠️ Development Status Warning

This library <code>whisper-node-addon</code> is currently in <strong>early experimental phase</strong>. APIs may change breakingly and production use is not recommended!<br/>

For stable & production-ready solutions, please use the mature library: <a href="https://github.com/ChetanXpro/nodejs-whisper">ChetanXpro/nodejs-whisper</a> 👈 or <a href="https://github.com/ggerganov/whisper.cpp">whisper.cpp</a>

# whisper-node-addon 🌐🔉

[![npm version](https://img.shields.io/npm/v/whisper-node-addon)](https://www.npmjs.com/package/whisper.cpp-platform-bindings)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Automatic whisper.cpp bindings for Node.js & Electron across all platforms.**

[简体中文](README-zh.md)

## ✨ Features

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
```javascript
import { transcribe } from 'whisper-node-addon/dist'
const modelPath = path.resolve('./resources/models/ggml-base.bin')

// Transcribe audio
try {
    const result = await transcribe({
        language: 'zh',
        model: modelPath,
        fname_inp: tempFilePath,
        translate: false
    })
    return result.reduce((pre, cur) => pre + (cur[2] || ''), '')
} catch (err) {
    console.error('Error:', err)
    return ''
}
```

## 🛠 Build from Source (Optional)
```bash
# Build binaries for all platforms
npm run build
```

## 📂 File Structure

## 🤝 Contributing

## 📜 TODO

## ⚖️ License
MIT © 2025 starNGC2237
