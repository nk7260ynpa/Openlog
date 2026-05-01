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
│   └── openlog.js                          # CLI 進入點，require dist/cli/index.js
├── src/
│   ├── index.ts                            # 套件進入點（library 用法）
│   ├── cli/
│   │   └── index.ts                        # commander 指令定義（--version、init）
│   └── core/
│       ├── config.ts                       # AI 工具列表與常數
│       ├── init.ts                         # InitCommand：建立 openlog/ + skills/commands
│       ├── templates/                      # Skill / slash command 內容（工具中立）
│       │   ├── types.ts
│       │   ├── workflows/apply.ts          # /oplg:apply 模板
│       │   └── workflows/record.ts         # /oplg:record 模板
│       ├── command-generation/             # 把模板轉成各 AI 工具檔案格式
│       │   ├── adapters/claude.ts          # → .claude/commands/oplg/<id>.md
│       │   └── adapters/github-copilot.ts  # → .github/prompts/oplg-<id>.prompt.md
│       └── shared/                         # SkillTemplate 聚合 + frontmatter 產生
├── build.js                                # 以 TypeScript compiler 產生 dist/
├── tsconfig.json                           # TS 設定（ES2022 / NodeNext / strict）
├── package.json                            # ESM、bin 註冊、scripts
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
│   ├── specs/                       # 規格文件
│   ├── changes/                     # 進行中的變更
│   │   └── archive/                 # 已完成歸檔
│   └── project.md                   # 專案介紹（自動產生）
├── .claude/                         # 若選 Claude Code
│   ├── skills/
│   │   ├── openlog-apply/SKILL.md   # /oplg:apply 對應 skill
│   │   └── openlog-record/SKILL.md  # /oplg:record 對應 skill
│   └── commands/oplg/
│       ├── apply.md                 # → /oplg:apply
│       └── record.md                # → /oplg:record
└── .github/                         # 若選 GitHub Copilot
    └── prompts/
        ├── oplg-apply.prompt.md
        └── oplg-record.prompt.md
```

### 支援的 AI 工具

| 工具 | `--tools` 值 | 建立目錄 | Skills | Slash commands |
|------|--------------|----------|--------|----------------|
| Claude Code | `claude` | `.claude/` | ✅ | ✅ `/oplg:apply`, `/oplg:record` |
| GitHub Copilot | `github-copilot` | `.github/` | ➖ | ✅ `oplg-*.prompt.md` |

### Slash Commands

`openlog init` 會自動安裝以下 slash commands 給選定的 AI 工具：

| 指令 | 用途 |
|------|------|
| `/oplg:apply <要執行的動作>` | 依使用者敘述直接修改程式碼，包含計畫、編輯、本地驗證、總結。 |
| `/oplg:record` | 把剛才修改的內容寫成文件記錄到 `openlog/changes/`，**標題由實際變更自動生成**（不需手動指定），並視情況同步更新 `README.md`、`openlog/project.md`、`openlog/specs/` 等內部文件。 |

## 開發指令

| 指令 | 說明 |
|------|------|
| `pnpm run build` | 一次性編譯（清空 `dist/` 後重新 `tsc`） |
| `pnpm run dev` | TypeScript watch mode |
| `pnpm run dev:cli` | 編譯後直接執行 `bin/openlog.js` |

## Roadmap

- [x] `openlog --version`
- [x] `openlog init`：建立 `openlog/` 與選擇 AI 工具骨架
- [x] 為 `.claude/` 與 `.github/` 補上 `/oplg:apply` 與 `/oplg:record` 的 commands / skills
- [ ] 規格／變更管理子指令（list、validate、archive 等）

## 授權

MIT
