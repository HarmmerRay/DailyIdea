import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { SourceID, SourceResponse } from "@shared/types"

export function useUpdateQuery() {
  const queryClient = useQueryClient()

  /**
   * update query
   */
  // 如何重新请求这些 query？
  // 这里通过调用 react-query 的 refetchQueries 方法实现批量刷新。
  // refetchQueries 支持传入一个 predicate（谓词）函数，遍历所有已注册的 query。
  // 我们检查每个 query 的 queryKey 是否为 ["source", 某个 id]，并且 id 是否在 sources 参数中。
  // 满足条件的 query 会被重新请求（即 refetch）。
  // 通过谓词函数 predicate，react-query 会筛选出所有满足条件的 query（即 queryKey 为 ["source", id] 且 id 在 sources 里）。
  // refetchQueries 内部会自动对这些 query 调用它们各自的 refetch 方法，触发重新请求。
  // 你问“react-query 框架实现的各自的 refetch 方法，总要有一个方法体吧？方法体在哪里？”
  // 答案是：每个 query 的 refetch 方法其实是由 useQuery/useInfiniteQuery 等 hook 内部自动生成的。
  // 具体来说，react-query 在注册 query 时，会把 queryFn（即你传给 useQuery 的 queryFn）包裹成一个 fetch 函数，
  // 并挂载到每个 query 对象上，作为它的 fetch/重新请求的实现。
  // 你可以理解为，每个 query 的 refetch 方法其实就是重新调用你传入的 queryFn。
  // 例如 useQuery({ queryKey, queryFn })，那么 refetch 就是 queryFn 的再次执行。
  // 下面的代码只是批量触发这些 query 的 refetch 方法，具体的“方法体”就是你写的 queryFn。
  return useCallback(async (...sources: SourceID[]) => {
    await queryClient.refetchQueries({
      predicate: (query) => {
        // query.queryKey 结构为 ["source", id]
        const [type, id] = query.queryKey as [string, SourceID]
        return type === "source" && sources.includes(id)
      },
    })
  }, [queryClient])
}

export function useEntireQuery(items: SourceID[]) {
  const update = useUpdateQuery()
  useQuery({
    // sort in place
    queryKey: ["entire", [...items].sort()],
    queryFn: async ({ queryKey }) => {
      const sources = queryKey[1]
      if (sources.length === 0) return null
      const res: SourceResponse[] | undefined = await myFetch("/s/entire", {
        method: "POST",
        body: {
          sources,
        },
      })
      if (res?.length) {
        const s = [] as SourceID[]
        res.forEach((v) => {
          const id = v.id
          if (!cacheSources.has(id) || cacheSources.get(id)!.updatedTime < v.updatedTime) {
            s.push(id)
            cacheSources.set(id, v)
          }
        })
        // update now
        update(...s)

        return res
      }
      return null
    },
    staleTime: 1000 * 60 * 3,
    retry: false,
  })
}
