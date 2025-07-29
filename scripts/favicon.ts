/**
 * 这个脚本的作用是自动为所有在 originSources 中定义的源网站下载 favicon 图标，并保存到 public/icons 目录下。
 * 
 * 具体流程如下：
 * 1. 遍历 originSources 里的每个源（通常是新闻源或内容源）。
 * 2. 检查 public/icons 目录下是否已经存在该源的图标（以 id 命名的 png 文件）。
 * 3. 如果不存在，则从 DuckDuckGo 的 favicon 服务（https://icons.duckduckgo.com/ip3/xxx.ico）下载该源网站的 favicon。
 * 4. 下载成功后保存为 png 文件到 public/icons 目录。
 * 5. 下载过程中有日志输出，便于追踪进度和错误。
 * 
 * 这样做的好处是可以自动批量收集所有内容源的站点图标，方便前端展示时统一引用，无需手动维护。
 */

import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { Buffer } from "node:buffer"
import { consola } from "consola"
import { originSources } from "../shared/pre-sources"

const projectDir = fileURLToPath(new URL("..", import.meta.url))
const iconsDir = join(projectDir, "public", "icons")

async function downloadImage(url: string, outputPath: string, id: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`${id}: 无法获取 ${url}, 状态码: ${response.status}`)
    }
    const image = await response.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(image))
    consola.success(`${id}: 下载成功.`)
  } catch (error) {
    consola.error(`${id}: 下载图标时出错. `, error)
  }
}

async function main() {
  await Promise.all(
    Object.entries(originSources).map(async ([id, source]) => {
      try {
        const icon = join(iconsDir, `${id}.png`)
        if (fs.existsSync(icon)) {
          // consola.info(`${id}: 图标已存在，跳过.`)
          return
        }
        if (!source.home) return
        await downloadImage(
          `https://icons.duckduckgo.com/ip3/${source.home.replace(/^https?:\/\//, "").replace(/\/$/, "")}.ico`,
          icon,
          id
        )
      } catch (e) {
        consola.error(id, "\n", e)
      }
    }),
  )
}

main()
