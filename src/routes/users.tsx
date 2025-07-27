import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

export const Route = createFileRoute("/users")({
  component: UsersComponent,
})

interface User {
  id: string
  email: string
  name?: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

function UsersComponent() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", name: "" })
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(res => res.json()).then(data => data.data || []),
  })

  const addUserMutation = useMutation({
    mutationFn: async (userData: { email: string; name?: string }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "添加用户失败")
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowAddModal(false)
      setNewUser({ email: "", name: "" })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "更新用户状态失败")
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "删除用户失败")
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleAddUser = () => {
    if (!newUser.email.trim()) return
    addUserMutation.mutate({
      email: newUser.email.trim(),
      name: newUser.name.trim() || undefined,
    })
  }

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    updateStatusMutation.mutate({ id: user.id, status: newStatus })
  }

  const handleDeleteUser = (id: string) => {
    if (confirm("确定要删除这个用户吗？此操作不可恢复。")) {
      deleteUserMutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">用户管理</h1>
            <p className="text-gray-600 dark:text-gray-400">管理邮件推送的用户列表</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            添加用户
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">用户列表</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              活跃用户: {users?.filter((u: User) => u.status === "active").length || 0}
            </span>
            <span className="text-sm text-gray-500">
              总用户: {users?.length || 0}
            </span>
          </div>
        </div>

        {isLoading
          ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            )
          : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">邮箱</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">姓名</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">状态</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">创建时间</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.length > 0
                      ? (
                          users.map((user: User) => (
                            <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.email}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.name || "-"}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={
                                    user.status === "active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium"
                                  }
                                >
                                  {user.status === "active" ? "活跃" : "停用"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                {new Date(user.created_at).toLocaleDateString("zh-CN")}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    disabled={updateStatusMutation.isPending}
                                    className={
                                      user.status === "active"
                                        ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                        : "bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                    }
                                  >
                                    {user.status === "active" ? "停用" : "启用"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={deleteUserMutation.isPending}
                                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )
                      : (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-500">
                              <div className="text-6xl mb-4">👥</div>
                              <p className="text-lg">暂无用户</p>
                              <p className="text-sm mt-2">点击"添加用户"开始添加邮件推送用户</p>
                            </td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {/* 添加用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加新用户</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  姓名 (可选)
                </label>
                <input
                  id="name"
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="用户姓名"
                />
              </div>
            </div>

            {addUserMutation.error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {addUserMutation.error.message || "添加用户失败，请重试"}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUser.email.trim() || addUserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
              >
                {addUserMutation.isPending ? "添加中..." : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}