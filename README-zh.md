# ⚠️ 开发状态警告
本库 <code>whisper-node-addon</code> 目前处于 <strong>早期实验阶段</strong>，API 可能发生重大变更，生产环境使用需谨慎！<br/>

如需稳定可用的方案，请使用成熟库：<a href="https://github.com/ChetanXpro/nodejs-whisper">ChetanXpro/nodejs-whisper</a> 👈或<a href="https://github.com/ggerganov/whisper.cpp">whisper.cpp</a>

# whisper-node-addon 🌐🔉

[![npm 版本](https://img.shields.io/npm/v/whisper-node-addon)](https://www.npmjs.com/package/whisper-node-addon)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**全平台 whisper.cpp 的 Node.js/Electron 自动化绑定工具**

## ✨ 特性

- 🔗 **原生 whisper.cpp 绑定** — 通过 Node.js N-API 插件实现高性能语音转文字
- 🖥️ **跨平台支持** — 支持 Windows x64、macOS x64/arm64、Linux x64
- ⚡ **Electron & Node.js** — 自动为你的运行时和 ABI 版本编译
- 🎯 **多种输出格式** — 原始片段、纯文本或结构化 `TranscriptionSegment` 对象
- 📥 **模型下载器** — 内置工具，可从 Hugging Face 下载预训练模型
- 🛡️ **输入验证** — 转录前自动检查模型和音频文件是否存在
- 🔧 **GPU 和 Flash Attention** — 可选 GPU 加速和 Flash Attention 支持
- 📝 **TypeScript** — 包含完整类型定义

## 📦 安装
```bash
npm i whisper-node-addon
```

安装过程中，系统会提示你选择运行时（Node.js 或 Electron）及其版本号，随后自动编译适配你环境的原生插件。

### 非交互模式 / CI 环境

通过设置环境变量可跳过交互提示：
```bash
# 为 Node.js 构建
WHISPER_RUNTIME=node WHISPER_RUNTIME_VERSION=20.0.0 npm i whisper-node-addon

# 为 Electron 构建
WHISPER_RUNTIME=electron WHISPER_RUNTIME_VERSION=31.7.7 npm i whisper-node-addon
```

在非 TTY 环境（如 CI 流水线）中运行时，脚本默认为当前 Node.js 版本构建。

## 🚀 快速使用

### 基本转录
```javascript
import { transcribe } from 'whisper-node-addon/dist'
const modelPath = path.resolve('./resources/models/ggml-base.bin')

// 转录音频 — 返回原始片段 [开始时间, 结束时间, 文本]
const result = await transcribe({
    language: 'zh',
    model: modelPath,
    fname_inp: tempFilePath,
    translate: false
})
```

### 直接获取文本
```javascript
import { transcribeToText } from 'whisper-node-addon/dist'

// 直接返回拼接后的文本字符串
const text = await transcribeToText({
    model: modelPath,
    fname_inp: audioFile,
    language: 'zh'
})
console.log(text)
```

### 结构化片段
```javascript
import { transcribeWithSegments } from 'whisper-node-addon/dist'

// 返回类型化的 TranscriptionSegment[]，包含 { start, end, text }
const segments = await transcribeWithSegments({
    model: modelPath,
    fname_inp: audioFile,
    language: 'zh'
})
segments.forEach(seg => {
    console.log(`[${seg.start} -> ${seg.end}] ${seg.text}`)
})
```

### 下载模型
```javascript
import { downloadModel, AVAILABLE_MODELS } from 'whisper-node-addon/dist'

// 查看可用模型列表
console.log(AVAILABLE_MODELS)
// ['tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en',
//  'medium', 'medium.en', 'large-v1', 'large-v2', 'large-v3', 'large-v3-turbo']

// 下载模型并跟踪进度
const modelPath = await downloadModel({
    modelName: 'base',
    outputDir: './models',
    onProgress: (progress) => console.log(`下载中: ${progress}%`)
})
```

### 参数选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | `string` | *(必填)* | `.bin` 模型文件路径 |
| `fname_inp` | `string` | *(必填)* | 输入音频文件路径（WAV 格式） |
| `language` | `string` | `'en'` | 语言代码（如 `'en'`、`'zh'`、`'ja'`） |
| `use_gpu` | `boolean` | `true` | 启用 GPU 加速 |
| `flash_attn` | `boolean` | `false` | 启用 Flash Attention |
| `translate` | `boolean` | `true` | 翻译为英文 |
| `no_timestamps` | `boolean` | `false` | 省略输出中的时间戳 |
| `no_prints` | `boolean` | `true` | 抑制原生库输出 |
| `comma_in_time` | `boolean` | `false` | 时间戳使用逗号作为小数分隔符 |
| `audio_ctx` | `number` | `0` | 音频上下文大小（0 = 默认） |
| `max_len` | `number` | `0` | 最大片段 token 长度（0 = 无限制） |

## 🛠 从源码编译（可选）
```bash
npm run build
```

## 📂 文件结构
```
whisper-node-addon/
├── src/                    # TypeScript 源代码
│   ├── index.ts           # 主模块（transcribe、downloadModel 等）
│   └── types.d.ts         # 类型定义
├── dist/                   # 编译后的 JavaScript 输出
├── deps/
│   └── whisper.cpp/       # whisper.cpp git 子模块
├── platform/              # 预编译的原生二进制文件
│   ├── darwin-arm64/
│   ├── darwin-x64/
│   ├── linux-x64/
│   └── win32-x64/
├── scripts/
│   └── install.js         # 安装后构建脚本
└── package.json
```

## 🤝 贡献指南

欢迎贡献！请随时提交 issue 和 pull request。

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 发起 Pull Request

## 📜 开发计划（TODO）

- [ ] 流式转录支持
- [ ] 音频格式自动转换（mp3、flac、ogg → wav）
- [ ] Worker 线程支持，实现非阻塞转录
- [ ] 转录事件回调（片段完成时触发）

## ⚖️ 许可证
MIT © 2025 starNGC2237
