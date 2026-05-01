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
│   ├── cli/
│   │   └── index.ts        # commander 指令定義（--version、init）
│   └── core/
│       ├── config.ts       # AI 工具列表與常數（OPENLOG_DIR_NAME 等）
│       └── init.ts         # InitCommand：建立 openlog/ 與工具骨架
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

### 顯示版本

```bash
openlog --version   # 或 -v
```

### 初始化專案 `openlog init`

於指定路徑（預設為當前目錄）建立 Openlog 工作目錄與 AI 工具骨架。

```bash
# 互動式選擇 AI 工具
openlog init

# 非互動指定（可選 all / none / 以逗號分隔）
openlog init --tools claude
openlog init ./my-project --tools claude,github-copilot
openlog init --tools all

# 已存在 openlog/ 時強制重新初始化
openlog init --force
```

完成後會產生：

```text
my-project/
├── openlog/
│   ├── specs/                # 規格文件
│   ├── changes/              # 進行中的變更
│   │   └── archive/          # 已完成歸檔
│   └── project.md            # 專案介紹（自動產生）
├── .claude/                  # 若選 Claude Code
└── .github/                  # 若選 GitHub Copilot
```

> 目前 `.claude/` 與 `.github/` 僅建立空資料夾，commands / skills 會在後續版本補上。

### 支援的 AI 工具

| 工具 | `--tools` 值 | 建立目錄 |
|------|--------------|----------|
| Claude Code | `claude` | `.claude/` |
| GitHub Copilot | `github-copilot` | `.github/` |

## 開發指令

| 指令 | 說明 |
|------|------|
| `pnpm run build` | 一次性編譯（清空 `dist/` 後重新 `tsc`） |
| `pnpm run dev` | TypeScript watch mode |
| `pnpm run dev:cli` | 編譯後直接執行 `bin/openlog.js` |

## Roadmap

- [x] `openlog --version`
- [x] `openlog init`：建立 `openlog/` 與選擇 AI 工具骨架
- [ ] 為 `.claude/` 與 `.github/` 補上 commands / skills 內容
- [ ] 規格／變更管理子指令（list、validate、archive 等）

## 授權

MIT
