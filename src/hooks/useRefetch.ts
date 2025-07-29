import type { SourceID } from "@shared/types"
import { useUpdateQuery } from "./query"

export function useRefetch() {
  const { enableLogin, loggedIn, login } = useLogin()
  const toaster = useToast()
  const updateQuery = useUpdateQuery()
  /**
   * force refresh
   */
  const refresh = useCallback((...sources: SourceID[]) => {
    if (enableLogin && !loggedIn) {
      toaster("登录后可以强制拉取最新数据", {
        type: "warning",
        action: {
          label: "登录",
          onClick: login,
        },
      })
    } else {
      // 先清空 refetchSources，确保不会有旧的 source ID 残留
      refetchSources.clear()
      // 将本次需要强制刷新的 source ID 添加到 refetchSources 中
      sources.forEach(id => refetchSources.add(id))
      // 调用 updateQuery，触发对应 source 的数据刷新
      updateQuery(...sources)
    }
  }, [loggedIn, toaster, login, enableLogin, updateQuery])

  return {
    refresh,
    refetchSources,
  }
}
