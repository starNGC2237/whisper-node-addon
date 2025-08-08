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
