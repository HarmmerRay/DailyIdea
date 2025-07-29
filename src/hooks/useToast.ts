import type { ToastItem } from "~/atoms/types"

// 这里定义了一个 toastAtom，用于存储 ToastItem 类型的数组，作为全局的 toast 消息列表。
// atom 是 Jotai 状态管理库的 API，用于创建一个原子状态。
// ToastItem 是自定义的类型，通常包含 msg（消息内容）、id（唯一标识）、type（消息类型）等字段。
export const toastAtom = atom<ToastItem[]>([])

// useToast 是一个自定义 Hook，用于在组件中方便地弹出 toast 消息。
// 它内部通过 useSetAtom 获取 setToastItems 方法，可以更新 toastAtom 的值。
// 返回的函数接收 msg（消息内容）和 props（除 id 和 msg 以外的 ToastItem 其他属性），
// 每次调用时会生成一个新的 ToastItem（id 用当前时间戳），并插入到 toast 列表的最前面。
export function useToast() {
  const setToastItems = useSetAtom(toastAtom)
  return useCallback((msg: string, props?: Omit<ToastItem, "id" | "msg">) => {
    setToastItems(prev => [
      {
        msg,
        id: Date.now(),
        ...props,
      },
      ...prev,
    ])
  }, [setToastItems])
}
