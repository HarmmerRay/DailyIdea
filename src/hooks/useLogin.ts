const userAtom = atomWithStorage<{
  name?: string
  avatar?: string
}>("user", {})

const jwtAtom = atomWithStorage("jwt", "")

// atomWithStorage 是 Jotai 提供的一个工具，用于将 atom 的值与本地存储（localStorage）进行同步。
// 具体来说，下面这个 enableLoginAtom 会把它的值（一个包含 enable 和可选 url 字段的对象）存储到 localStorage 的 "login" key 下。
// 每当 atom 的值发生变化时，localStorage 也会自动更新；反之，localStorage 变化时 atom 也会同步。
// 初始值为 { enable: true }，即默认启用登录功能。
const enableLoginAtom = atomWithStorage<{
  enable: boolean
  url?: string
}>("login", {
  enable: true,
})

enableLoginAtom.onMount = (set) => {
  myFetch("/enable-login").then((r) => {
    set(r)
  }).catch((e) => {
    if (e.statusCode === 506) {
      set({ enable: false })
      localStorage.removeItem("jwt")
    }
  })
}

export function useLogin() {
  const userInfo = useAtomValue(userAtom)
  const jwt = useAtomValue(jwtAtom)
  const enableLogin = useAtomValue(enableLoginAtom)

  const login = useCallback(() => {
    window.location.href = enableLogin.url || "/api/login"
  }, [enableLogin])

  const logout = useCallback(() => {
    window.localStorage.clear()
    window.location.reload()
  }, [])

  return {
    loggedIn: !!jwt,  // 将jwt转化为boolean ，此处双重否定表肯定，jwt存在时loggedIn为true，不存在为false
    userInfo,
    enableLogin: !!enableLogin.enable,
    logout,
    login,
  }
}
