import process from "node:process"

export default defineEventHandler(async () => {
  // 如果没有配置必需的环境变量，返回506错误
  if (!process.env.G_CLIENT_ID || !process.env.JWT_SECRET) {
    throw createError({
      statusCode: 506,
      statusMessage: "Server not configured, login disabled"
    })
  }
  
  return {
    enable: true,
    url: `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`,
  }
})
