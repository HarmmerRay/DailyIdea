import { fixedColumnIds, specialPageIds, metadata } from "@shared/metadata"
import { Link, useLocation } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"
import { useSearchBar } from "~/hooks/useSearch"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const location = useLocation()
  const { toggle } = useSearchBar()
  
  // 当在推送记录或用户管理页面时，其他按钮不应该高亮
  const isSpecialPage = location.pathname === "/push-records" || location.pathname === "/users"
  
  return (
    <span className={$([
      "flex p-3 rounded-2xl bg-primary/1 text-sm",
      "shadow shadow-primary/20 hover:shadow-primary/50 transition-shadow-500",
    ])}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "px-2 hover:(bg-primary/10 rounded-md) op-70 dark:op-90",
          "cursor-pointer transition-all",
        )}
      >
        更多
      </button>
      {fixedColumnIds.map(columnId => (
        <Link
          key={columnId}
          to="/c/$column"
          params={{ column: columnId }}
          className={$(
            "px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all",
            currentId === columnId && !isSpecialPage ? "color-primary font-bold" : "op-70 dark:op-90",
          )}
        >
          {metadata[columnId].name}
        </Link>
      ))}
      {specialPageIds.map(pageId => (
        <Link
          key={pageId}
          to={pageId === "push-records" ? "/push-records" : "/users"}
          className={$(
            "px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all",
            location.pathname === (pageId === "push-records" ? "/push-records" : "/users") ? "color-primary font-bold" : "op-70 dark:op-90",
          )}
        >
          {metadata[pageId].name}
        </Link>
      ))}
    </span>
  )
}
