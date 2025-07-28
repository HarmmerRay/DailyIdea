import process from "node:process"
import { join } from "node:path"
import viteNitro from "vite-plugin-with-nitro"
import { RollopGlob } from "./tools/rollup-glob"
import { projectDir } from "./shared/dir"

const nitroOption: Parameters<typeof viteNitro>[0] = {
  experimental: {
    database: true,
  },
  rollupConfig: {
    plugins: [RollopGlob()],
  },
  sourceMap: false,
  database: {
    default: {
      connector: "mysql2",
      options: {
        host: process.env.MYSQL_HOST || "localhost",
        port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "111111",
        database: process.env.MYSQL_DATABASE || "dailyidea",
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000,
        reconnect: true,
      },
    },
  },
  devDatabase: {
    default: {
      connector: "mysql2",
      options: {
        host: process.env.MYSQL_HOST || "localhost",
        port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "111111",
        database: process.env.MYSQL_DATABASE || "dailyidea",
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000,
        reconnect: true,
      },
    },
  },
  imports: {
    dirs: ["server/utils", "shared"],
  },
  preset: "node-server",
  alias: {
    "@shared": join(projectDir, "shared"),
    "#": join(projectDir, "server"),
  },
}

if (process.env.VERCEL) {
  nitroOption.preset = "vercel-edge"
  nitroOption.database = undefined
} else if (process.env.CF_PAGES) {
  nitroOption.preset = "cloudflare-pages"
  nitroOption.unenv = {
    alias: {
      "safer-buffer": "node:buffer",
    },
  }
  nitroOption.database = {
    default: {
      connector: "cloudflare-d1",
      options: {
        bindingName: "NEWSNOW_DB",
      },
    },
  }
} else if (process.env.BUN) {
  nitroOption.preset = "bun"
  nitroOption.database = {
    default: {
      connector: "bun-sqlite",
    },
  }
}

export default function () {
  return viteNitro(nitroOption)
}
