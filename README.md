<div align="center" style="padding: 12px; border: 2px solid #ffd700; background: #fffbe6; border-radius: 8px; margin-bottom: 24px;">
  <strong>⚠️ Development Status Warning</strong><br/>
  This library <code>whisper-node-addon</code> is currently in <strong>early experimental phase</strong>. APIs may change breakingly and production use is not recommended!<br/>
  For stable & production-ready solutions, please use the mature library: <a href="https://github.com/ChetanXpro/nodejs-whisper">ChetanXpro/nodejs-whisper</a> 👈 or <a href="https://github.com/ggerganov/whisper.cpp">whisper.cpp</a>
</div>
# whisper-node-addon 🌐🔉

[![npm version](https://img.shields.io/npm/v/whisper.cpp-platform-bindings)](https://www.npmjs.com/package/whisper.cpp-platform-bindings)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Automatic whisper.cpp bindings for Node.js & Electron across all platforms.**  
No native compilation headaches. Just `require()` and go!

[简体中文](README-zh.md)

## ✨ Features
- ✅ **Pre-built `.node` binaries** for Windows (x64), Linux (x64/arm64), macOS (x64/arm64)
- ✅ **Automatic runtime detection** - Load correct binary for the current OS/arch
- ✅ **Zero-config for Electron** - Seamless integration with Electron apps
- ✅ **On-demand compilation** - Fallback to source compile if pre-built missing
- ✅ **Optimized JS layer** - Minified & tree-shaken for production
- ✅ **Supports whisper.cpp features** - Full API coverage (ASR, translation, streaming)

## 📦 Installation
```bash
npm install whisper.cpp-platform-bindings
```

## 🚀 Usage
```javascript
const whisper = require('whisper.cpp-platform-bindings');

// Transcribe audio
const result = await whisper.transcribe('audio.wav', {
  model: 'ggml-base.en.bin',
  language: 'en',
  use_gpu: true // Auto-detects CUDA/Metal
});

console.log(result.text); 
```

## 🔧 Advanced Configuration
Add to `package.json` to control build behavior:
```json
{
  "whisper-bindings": {
    "targets": ["win32-x64", "linux-arm64", "darwin-universal"],
    "prebuild": true,
    "minify": true,
    "electron": "25.0.0"
  }
}
```

## 🛠 Build from Source (Optional)
```bash
# Build binaries for all platforms (requires Docker)
npm run build:all

# Or build for current platform
npm run build
```

## 📂 File Structure
```
dist/
  win32-x64/
    whisper.node (pre-built)
    whisper.min.js
  linux-x64/
    ...
src/
  whisper.cpp (submodule)
  binding.cc
lib/
  detector.js (runtime loader)
  ...
```

## 🤝 Contributing
1. Clone with submodules:
   ```bash
   git clone --recurse-submodules https://github.com/your-repo/whisper.cpp-platform-bindings.git
   ```
2. Install dev deps:
   ```bash
   npm install -g node-gyp cmake-js
   npm install
   ```
3. Send PRs!

## 📜 TODO
- [ ] Add CI pipeline for automated cross-compilation (GitHub Actions)
- [ ] Support FreeBSD/ARMv6
- [ ] Benchmark GPU acceleration across platforms
- [ ] Add TypeScript definitions
- [ ] Implement WebAssembly fallback
- [ ] Create CLI tool for model conversion

## ⚖️ License
MIT © 2025 starNGC2237
