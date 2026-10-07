<p align="center">
  <img src="/public/image/BlueRandom.png" alt="KVRandom" width="160">
</p>

# KVRandom

<p align="center">
  <a href="https://github.com/MF-Dust/KVRandom/actions/workflows/build-windows.yml"><img src="https://img.shields.io/github/actions/workflow/status/MF-Dust/KVRandom/build-windows.yml?branch=main&label=Windows%20build&style=flat-square" alt="Windows build status"></a>
  <a href="https://github.com/MF-Dust/KVRandom/releases"><img src="https://img.shields.io/github/v/release/MF-Dust/KVRandom?style=flat-square" alt="GitHub release"></a>
  <a href="https://github.com/MF-Dust/KVRandom/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square" alt="License: AGPL-3.0"></a>
  <img src="https://img.shields.io/badge/platform-Windows-0078d4?style=flat-square&logo=windows&logoColor=white" alt="Platform: Windows">
  <img src="https://img.shields.io/badge/.NET-10-512bd4?style=flat-square&logo=dotnet&logoColor=white" alt=".NET 10">
  <img src="https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/C%23-WPF%20%2B%20WebView2-512bd4?style=flat-square" alt="C# WPF and WebView2">
  <a href="https://deepwiki.com/MF-Dust/KVRandom"><img src="https://img.shields.io/badge/DeepWiki-open-blue?style=flat-square" alt="Open in DeepWiki"></a>
  <a href="https://zread.ai/MF-Dust/KVRandom"><img src="https://img.shields.io/badge/Zread-open-6f42c1?style=flat-square" alt="Open in Zread"></a>
</p>

KVRandom 是一款基于 .NET 10、C# WPF/WebView2 和 Vue 3 的 Windows 桌面随机点名工具。应用提供悬浮按钮、抽取人数选择、名单权重管理、结果动画、音乐音效、托盘配置页和 Windows 置顶增强等功能。

项目灵感来自《蔚蓝档案(Blue Archive)》的学生招募表现形式，但本项目不是官方项目，也不隶属于相关权利方。

## 功能特性

- 悬浮按钮：常驻桌面，点击后打开抽取人数窗口。
- 抽取人数：支持 1-10 人，可设置默认人数和背景暗度。
- 名单管理：支持文本粘贴、TXT/CSV 导入、去重、权重保留和权重重置。
- 抽取策略：支持允许重复抽取和不重复抽取两种模式。
- 权重抽取：重复抽取按权重进行抽样，不重复抽取按权重进行无放回抽样。
- 结果动画：使用蓝、金、粉信封样式展示结果，并带保底表现。
- 音频反馈：支持按钮点击音、抽取背景音乐和结果动画音效。
- 配置页面：通过托盘菜单打开，无需本地 Web 服务端口。
- Windows 增强：支持管理员置顶增强和管理员权限开机计划任务。
- 更新检查：从 GitHub Releases 读取 `version.yml` 判断是否有新版本。

## 代码阅读与文档入口

除了 GitHub 源码，项目也提供适合快速阅读和问答的外部入口：

- DeepWiki: <https://deepwiki.com/MF-Dust/KVRandom>
  适合浏览由仓库生成的结构化代码说明、模块关系和实现概览。
- Zread: <https://zread.ai/MF-Dust/KVRandom>
  适合用 AI 代码阅读方式查看仓库文档、源码结构和项目摘要。
- Shields.io: <https://shields.io/>
  README 顶部徽章使用 Shields 风格展示构建状态、发布版本、技术栈和文档入口。

## 下载与使用

发布包在 GitHub Releases 中提供：

- Releases: <https://github.com/MF-Dust/KVRandom/releases>
- Actions: <https://github.com/MF-Dust/KVRandom/actions>

常见产物：

- `kvrandom-windows-portable.zip`：便携版，包含 `kvrandom.exe`、.NET 运行时、WebView2 加载器和 `wwwroot` 资源目录。

基本使用：

1. 解压发布包。
2. 运行 `kvrandom.exe`。
3. 在系统托盘中右键 KVRandom 图标，点击 `配置`。
4. 导入或粘贴学生名单，调整权重和抽取偏好。
5. 点击桌面悬浮按钮开始抽取。

便携版不要只移动 `kvrandom.exe`，请保留解压后的所有 DLL、运行时文件和 `wwwroot` 目录。发布版自带 .NET 运行时，但系统仍需安装 [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)。

## 配置说明

应用会在程序所在目录下读写 `config.yml` 和 `list.yaml`。如果字段缺失或超出范围，程序会在加载时归一化并写回。YAML 语法错误会直接报错，不会再静默覆盖成默认配置。

主要配置项：

- `list.yaml` 的 `students`：抽取名单，每项包含 `name` 和 `weight`。
- `allowRepeatDraw`：是否允许重复抽取。
- `floatingButton.sizePercent`：悬浮按钮大小百分比，默认 `100`。
- `floatingButton.transparencyPercent`：悬浮按钮透明度，默认 `20`。
- `floatingButton.alwaysOnTop`：悬浮按钮是否置顶。
- `floatingButton.position`：悬浮按钮屏幕坐标，退出或拖动结束时自动保存。
- `pickCountDialog.defaultPlayMusic`：人数选择窗口是否默认播放背景音乐。
- `pickCountDialog.backgroundDarknessPercent`：抽取遮罩背景暗度。
- `pickCountDialog.defaultCount`：默认抽取人数，范围 `1-10`。
- `pickResultDialog.defaultPlayGachaSound`：结果动画是否默认播放音效。
- `pickResultDialog.gachaSoundVolume`：结果动画音效音量，范围 `0.0-1.0`。
- `webConfig.adminTopmostEnabled`：Windows 下启动时是否尝试管理员置顶增强。
- `webConfig.adminAutoStartEnabled`、`adminAutoStartPath`、`adminAutoStartTaskName`：管理员权限计划任务相关配置。

## 本地开发

环境要求：

- Node.js 22.12+（推荐 24）
- .NET 10 SDK
- Windows 10/11 与 Microsoft Edge WebView2 Runtime

```powershell
npm ci
npm run dev
npm run type-check
npm test
npm run build:frontend
npm run build:backend
npm run test:backend
npm run build
npm run test:desktop
```

- `npm run dev` 同时启动 Vite 和 C# 桌面宿主，退出时关闭子进程。
- `npm run dev:frontend` 只预览前端；配置保存、文件选择等原生能力需在桌面应用内使用。
- `npm run build` 生成自包含 Windows x64 便携目录 `release/win-x64/`，不生成安装程序。
- `npm run test:desktop` 在 Windows 上验证发布版窗口、IPC、配置、抽取和音频；使用临时名单与配置，需空闲的本机 `9229` 端口，不会请求 UAC 或创建开机任务。
- C# 格式化：`dotnet format src-dotnet/KVRandom.csproj`。
- 开发构建的配置位于可执行文件所在的 `bin` 目录；可使用 `--data-dir <目录>` 隔离测试配置。

## 项目结构

```text
.
├─ public/                 # 图片、音频等第三方素材
├─ src/
│  ├─ api/                 # WebView2 command/event 桥接
│  ├─ components/          # Vue 组件
│  ├─ composables/         # 配置、弹窗和招募逻辑
│  ├─ views/               # 悬浮窗、设置、人数、结果和招募页面
│  └─ configDefaults.json  # 前后端共用默认配置
├─ src-dotnet/
│  ├─ Program.cs           # 单实例、WPF 入口
│  ├─ DesktopHost.cs       # 命令、窗口切换、托盘与日志
│  ├─ BrowserWindow.cs     # 透明 WebView2 与可信来源 IPC
│  ├─ ConfigStore.cs       # YAML 归一化、持久化与名单解析
│  ├─ Picker.cs            # 权重抽取、概率提升与保底
│  ├─ AudioController.cs   # 持久 WebView2 音频播放
│  ├─ AssetHandler.cs      # 本地资源和视频分段请求
│  ├─ SystemIntegration.cs # 管理员权限与开机计划任务
│  ├─ UpdateChecker.cs     # GitHub Releases 更新检查
│  ├─ tests/               # 可运行的后端检查
│  └─ KVRandom.csproj
├─ scripts/desktop.mjs     # 开发和发布入口
├─ .github/workflows/      # Windows 构建和发布
├─ config.yml
├─ list.yaml
└─ package.json
```

## 发布流程

GitHub Actions 工作流位于 `.github/workflows/build-windows.yml`。

触发方式：

- 手动运行 `workflow_dispatch`，填写 release tag 和 release name。
- 向 `main` 或 `master` 推送包含 `[ci]` 的提交信息。
- 提交信息包含 `[unstable]` 时发布为 preview prerelease。

工作流会：

1. 安装 Node 和 .NET 10 SDK。
2. 执行 `npm ci`。
3. 执行前后端检查与 `npm run build`（发布自包含便携目录）。
4. 生成 `version.yml`，用于应用内更新检查。
5. 将完整 `release/win-x64/` 打包为 `kvrandom-windows-portable.zip`。
6. 上传 artifact 并发布到 GitHub Releases。

## 资源与音频

Vite 将 `public/` 中的资源复制到前端输出，C# 构建再将其放到 `wwwroot/`。原有 `/image/...`、`sound/...`、`public/...` 配置路径仍可使用；本地绝对路径和 UNC 路径通过原生资源处理器加载，并支持视频分段请求。

音频由持久的悬浮 WebView2 播放，关闭结果窗或隐藏招募窗不会销毁音频宿主，保留 MP3/WAV/OGG/FLAC 支持。发布版缺少图片或声音时，请检查 `wwwroot/image` 和 `wwwroot/sound`。

## 贡献

欢迎提交 Issue 和 PR。

- Bug 报告请包含复现步骤、实际表现、期望表现和运行方式。
- UI 改动建议附截图或录屏。
- 发布和打包相关改动请说明是否验证过 `npm run build`。
- 提交信息建议沿用现有中文前缀，例如 `功能:`、`修复:`、`优化:`、`项目:`、`版本号:`、`Agent:`。

## 说明

- 本项目大部分由 AI 生成与改写，欢迎继续审查和改进。
- 本项目包含部分第三方美术和音乐资源，项目作者并未获得完整授权。公开分发前请替换为已授权资源，或移除相关资源。
- 项目内 `public/` 资源的版权归各自权利方所有，使用时请自行确认授权范围。

## 许可证

- 除 `public/` 下的图片和音乐资源外，项目代码使用 AGPLv3 许可证。
- `public/` 下的图片和音乐资源不随项目代码许可证授权。

## 商标与版权声明

“蔚蓝档案”是上海星啸网络科技有限公司的注册商标，版权所有。

「ブルーアーカイブ」は株式会社Yostarの登録商標です。著作権はすべて保有されています。

"Blue Archive" is a registered trademark of NEXON Korea Corp. & NEXON GAMES Co., Ltd. All rights reserved.

## 感谢

- 《蔚蓝档案(Blue Archive)》提供的视觉与交互灵感：
  [国服](https://bluearchive-cn.com/) / [国际服](https://bluearchive.nexon.com/home) / [日服](https://bluearchive.jp/)
- 音乐 KARUT 的《Connected Sky》。
