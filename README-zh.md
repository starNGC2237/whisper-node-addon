# ⚠️ 开发状态警告
本库 <code>whisper-node-addon</code> 目前处于 <strong>早期实验阶段</strong>，API 可能发生重大变更，生产环境使用需谨慎！<br/>

如需稳定可用的方案，请使用成熟库：<a href="https://github.com/ChetanXpro/nodejs-whisper">ChetanXpro/nodejs-whisper</a> 👈或<a href="https://github.com/ggerganov/whisper.cpp">whisper.cpp</a>

# whisper-node-addon 🌐🔉

[![npm 版本](https://img.shields.io/npm/v/whisper-node-addon)](https://www.npmjs.com/package/whisper-node-addon)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**全平台 whisper.cpp 的 Node.js/Electron 自动化绑定工具**

## ✨ 特性

## 📦 安装
```bash
npm i whisper-node-addon
```

## 🚀 快速使用
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

## 🛠 从源码编译（可选）
```bash
npm run build
```

## 📂 文件结构

## 🤝 贡献指南

## 📜 开发计划（TODO）

## ⚖️ 许可证
MIT © 2025 starNGC2237
