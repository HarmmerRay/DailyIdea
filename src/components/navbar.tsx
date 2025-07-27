import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link, useLocation } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

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
      <Link
        to="/push-records"
        className={$(
          "px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all",
          location.pathname === "/push-records" ? "color-primary font-bold" : "op-70 dark:op-90",
        )}
      >
        推送记录
      </Link>
      <Link
        to="/users"
        className={$(
          "px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all", 
          location.pathname === "/users" ? "color-primary font-bold" : "op-70 dark:op-90",
        )}
      >
        用户管理
      </Link>
    </span>
  )
}
