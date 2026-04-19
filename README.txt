Flex 放单规律记录 - 使用说明

1. 本地使用
- 直接双击 index.html 打开即可。
- 数据默认保存在当前浏览器 localStorage。
- 建议定期在“设置”页导出 JSON 备份。

2. 上传到 GitHub Pages
- 新建一个 GitHub 仓库。
- 把 index.html、styles.css、app.js 上传到仓库根目录。
- 在仓库 Settings -> Pages 里启用 GitHub Pages。
- Source 选择 Deploy from a branch。
- Branch 选择 main / root。
- 保存后，几分钟内会生成公开网址。

3. 手机使用
- 用手机打开 GitHub Pages 网址。
- 可添加到主屏幕，像 App 一样打开。
- 录入页是手机优先设计。

4. 当前版本已支持
- 精确到分钟的放单节点记录
- 同一分钟多波记录
- 每波可记录多条看到的单
- 可记录实际抢到的单
- 规律统计：按 周几 + 上午/下午 + 精确时间 分组
- 仓库简称自定义
- JSON 导入导出

5. 当前版本未接入云同步
- 现在是本机浏览器存储。
- 后续可以升级为 GitHub Pages + Firebase / Supabase 云同步版。
