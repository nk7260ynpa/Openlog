# Openlog

AI-native logging companion CLI，仿照 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的 TypeScript + Node.js 架構打造。

> 目前版本僅實作 `openlog --version`，後續功能將陸續加入。

## 系統需求

- **Node.js ≥ 20.19.0**（與 OpenSpec 一致）
- 推薦套件管理器：`pnpm`（亦相容 `npm` / `yarn` / `bun`）

## 專案架構

```text
Openlog/
├── bin/
│   └── openlog.js          # CLI 進入點，require dist/cli/index.js
├── src/
│   ├── index.ts            # 套件進入點（library 用法）
│   └── cli/
│       └── index.ts        # commander 指令定義（含 --version）
├── build.js                # 以 TypeScript compiler 產生 dist/
├── tsconfig.json           # TS 設定（ES2022 / NodeNext / strict）
├── package.json            # ESM、bin 註冊、scripts
├── .gitignore
└── README.md
```

### 技術選型（沿用 OpenSpec）

| 面向 | 選擇 |
|------|------|
| 主語言 | TypeScript（編譯為 ES2022 + NodeNext ESM） |
| 執行環境 | Node.js ≥ 20.19.0 |
| CLI 框架 | [`commander`](https://www.npmjs.com/package/commander) |
| 模組型態 | ESM（`"type": "module"`） |
| 編譯方式 | `build.js` 呼叫本地 `tsc`，輸出至 `dist/` |
| Bin 入口 | `bin/openlog.js` → `dist/cli/index.js` |

## 安裝

### 從原始碼開發

```bash
cd /Users/chen/AI/Openlog
pnpm install      # 安裝相依
pnpm run build    # 編譯到 dist/
```

### 全域連結（開發階段）

```bash
pnpm link --global
openlog --version
```

### 之後發布到 npm 後

```bash
npm install -g @chen/openlog@latest
# 或
pnpm add -g @chen/openlog@latest
```

## 使用方式

目前僅支援版本顯示：

```bash
openlog --version
# 或
openlog -v
```

預期輸出：

```text
0.1.0
```

## 開發指令

| 指令 | 說明 |
|------|------|
| `pnpm run build` | 一次性編譯（清空 `dist/` 後重新 `tsc`） |
| `pnpm run dev` | TypeScript watch mode |
| `pnpm run dev:cli` | 編譯後直接執行 `bin/openlog.js` |

## Roadmap

- [x] `openlog --version`
- [ ] `openlog --help`（commander 內建會自動產生）
- [ ] `openlog init`：在當前專案初始化 log 設定
- [ ] 後續更多功能持續規劃中

## 授權

MIT
