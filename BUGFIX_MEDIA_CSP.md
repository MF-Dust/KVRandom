# 修复说明：外部音频/视频播放黑屏问题

## 问题描述

当用户在设置中选择外部文件系统的音频或视频文件（例如 `C:\Users\...\video.mp4`）后，在招募界面播放时会显示黑屏，无法正常加载媒体文件。

## 根本原因

Tauri 配置文件 `src-tauri/tauri.conf.json` 中的内容安全策略（CSP）配置不完整：

- `img-src` 指令包含了 `asset:`, `file:`, `data:` 等协议
- `media-src` 指令**只包含** `asset:` 和 `http://asset.localhost`

这导致即使通过 `convertFileSrc()` 将外部文件路径转换为 Tauri 资源协议，浏览器仍然因为 CSP 限制而拒绝加载媒体文件。

## 解决方案

在 `media-src` 指令中添加 `file:`, `data:`, `blob:` 协议支持：

```json
"csp": "default-src 'self' ipc: http://ipc.localhost; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' asset: http://asset.localhost data: file:; media-src 'self' asset: http://asset.localhost file: data: blob:; connect-src 'self' ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
```

### 变更内容

**修改前：**

```
media-src 'self' asset: http://asset.localhost;
```

**修改后：**

```
media-src 'self' asset: http://asset.localhost file: data: blob:;
```

## 技术细节

1. **`resolveAssetUrl` 函数**（`src/utils/assets.ts`）已经正确处理了路径转换：
   - 相对路径 → 绝对路径（如 `/sound/bgm.mp3`）
   - Windows 绝对路径 → Tauri asset 协议（通过 `convertFileSrc`）
   - URL 协议 → 保持不变

2. **招募界面**（`src/views/Recruit.vue`）已经使用 `resolveAssetUrl` 处理所有媒体路径：
   - 背景视频：`resolveAssetUrl(currentPool.bgVideo)` (第200行)
   - 背景图片：`resolveAssetUrl(currentPool.bgImage)` (第205行)
   - 招募动画视频：`resolvedRecruitVideoPath` (第510行，通过第574-576行计算)

3. **CSP 协议说明**：
   - `file:` - 允许访问本地文件系统（通过 `convertFileSrc` 转换后的路径）
   - `data:` - 允许 data URI（如 base64 编码的媒体）
   - `blob:` - 允许 Blob URL（用于动态生成的媒体内容）

## 测试

已添加 `src/utils/assets.test.ts` 测试文件，验证 `resolveAssetUrl` 函数的所有场景：

- ✅ Windows 绝对路径转换
- ✅ UNC 路径转换
- ✅ 相对路径处理
- ✅ URL 协议保留
- ✅ 空值处理

运行测试：

```bash
npm test -- assets.test.ts
```

## 影响范围

此修复影响所有使用外部媒体文件的场景：

- ✅ 招募界面背景视频
- ✅ 招募动画视频（`defaultVideoPath`）
- ✅ 点名 BGM（`bgmPaths`）
- ✅ 点名结果音效（`gachaSoundPath`）
- ✅ 悬浮按钮点击音效（`clickSoundPath`）

## 注意事项

- 修改后需要**重新启动应用**才能生效（CSP 在应用启动时加载）
- 内置资源（`public/` 目录下的文件）不受影响，仍然正常工作
- 安全性：CSP 仍然阻止不安全的内容（如内联脚本），只放宽了媒体文件来源限制
