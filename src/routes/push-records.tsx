import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

export const Route = createFileRoute("/push-records")({
  component: PushRecordsComponent,
})

interface PushRecord {
  id: string
  title: string
  summary: string
  sentAt: string
  status: "sent" | "pending" | "failed"
  opportunities: {
    title: string
    category: string
    confidence: number
  }[]
}

function PushRecordsComponent() {
  const { data: historicalRecords, isLoading: historicalLoading } = useQuery({
    queryKey: ["pushRecords", "historical"],
    queryFn: () => fetch("/api/push-records/historical").then(res => res.json()),
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">推送记录</h1>
        <p className="text-gray-600 dark:text-gray-400">查看历史推送记录</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            历史推送记录
          </h2>
          <span className="text-sm text-gray-500">
            {historicalRecords?.length || 0} 条记录
          </span>
        </div>

        {historicalLoading
          ? (
              <div className="animate-pulse space-y-4">
                {[...Array.from({ length: 5 })].map((_, i) => (
                  <div key={`historical-skeleton-${i}`} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            )
          : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {historicalRecords?.length > 0
                  ? (
                      historicalRecords.map((record: PushRecord) => (
                        <PushRecordCard key={record.id} record={record} />
                      ))
                    )
                  : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg">暂无推送记录</p>
                        <p className="text-sm mt-2">推送记录将会在这里显示</p>
                      </div>
                    )}
              </div>
            )}
      </div>
    </div>
  )
}

interface PushRecordCardProps {
  record: PushRecord
}

function PushRecordCard({ record }: PushRecordCardProps) {
  const statusColors = {
    sent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const statusText = {
    sent: "已发送",
    pending: "待发送",
    failed: "发送失败",
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
          {record.title}
        </h3>
        <span className={$(
          "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
          statusColors[record.status],
        )}
        >
          {statusText[record.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {record.summary}
      </p>

      {record.opportunities?.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {record.opportunities.slice(0, 3).map((opp, index) => (
              <span
                key={`${record.id}-opp-${index}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {opp.title}
                <span className="ml-1 text-xs opacity-70">
                  {opp.confidence}
                  %
                </span>
              </span>
            ))}
            {record.opportunities.length > 3 && (
              <span className="text-xs text-gray-500">
                +
                {record.opportunities.length - 3}
                {" "}
                更多
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          推送时间: {new Date(record.sentAt).toLocaleString("zh-CN")}
        </span>
      </div>
    </div>
  )
}
