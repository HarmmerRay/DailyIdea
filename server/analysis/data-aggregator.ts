import type { SourceID, NewsItem } from "../../shared/types"
import type { ExtendedNewsItem } from './business-opportunity'
import { getters } from "../getters"
import { getCacheTable } from "../database/cache"
import { sources } from "../../shared/sources"

export interface DataAggregationConfig {
  /** 需要采集的数据源列表 */
  sources: SourceID[]
  /** 时间范围（小时） */
  timeRangeHours: number
  /** 最大新闻条数 */
  maxItems: number
  /** 是否使用缓存 */
  useCache: boolean
  /** 优先级筛选：只获取这些分类的数据源 */
  priorityColumns?: ('tech' | 'finance' | 'china' | 'world')[]
}

export interface AggregationResult {
  newsItems: ExtendedNewsItem[]
  sources: SourceID[]
  totalItems: number
  timeRange: {
    start: number
    end: number
  }
  errors: string[]
}

/**
 * 默认的高价值数据源配置（适合商业机会分析）
 */
export const DEFAULT_HIGH_VALUE_SOURCES: SourceID[] = [
  // 金融财经类（高频更新，商业价值高）
  'weibo',           // 微博热搜 - 2分钟更新
  'baidu',           // 百度热搜 - 10分钟更新
  'zhihu',           // 知乎热榜 - 10分钟更新
  'wallstreetcn-quick', // 华尔街见闻快讯 - 5分钟更新
  'cls-telegraph',   // 财联社电报 - 5分钟更新
  'xueqiu-hotstock', // 雪球热门股票 - 2分钟更新
  
  // 科技类
  '36kr-quick',      // 36氪快讯 - 10分钟更新
  'ithome',          // IT之家 - 10分钟更新
  'juejin',          // 稀土掘金 - 10分钟更新
  
  // 综合类
  'toutiao',         // 今日头条 - 10分钟更新
  'douyin',          // 抖音热点 - 10分钟更新
  'bilibili-hot-search' // B站热搜 - 10分钟更新
]

/**
 * 创建默认的数据聚合配置
 */
export function createDefaultAggregationConfig(): DataAggregationConfig {
  return {
    sources: DEFAULT_HIGH_VALUE_SOURCES,
    timeRangeHours: 2, // 最近2小时的数据
    maxItems: 100,     // 最多100条新闻
    useCache: true,
    priorityColumns: ['finance', 'tech', 'china'] // 优先财经、科技、国内新闻
  }
}

/**
 * 数据聚合器类
 */
export class DataAggregator {
  private config: DataAggregationConfig
  
  constructor(config?: Partial<DataAggregationConfig>) {
    this.config = { ...createDefaultAggregationConfig(), ...config }
  }

  /**
   * 从单个数据源获取数据
   */
  private async fetchFromSource(sourceId: SourceID): Promise<{
    items: ExtendedNewsItem[],
    error?: string
  }> {
    try {
      // 检查数据源是否存在
      if (!sources[sourceId] || !getters[sourceId]) {
        return { items: [], error: `数据源 ${sourceId} 不存在` }
      }

      // 检查数据源是否被禁用
      if (sources[sourceId].disable) {
        return { items: [], error: `数据源 ${sourceId} 已被禁用` }
      }

      // 尝试从缓存获取
      let items: NewsItem[] = []
      if (this.config.useCache) {
        const cacheTable = await getCacheTable()
        if (cacheTable) {
          const cache = await cacheTable.get(sourceId)
          if (cache && (Date.now() - cache.updated < sources[sourceId].interval)) {
            items = cache.items
            console.log(`📋 从缓存获取 ${sourceId} 数据: ${items.length} 条`)
          }
        }
      }

      // 如果缓存中没有数据，直接调用getter
      if (items.length === 0) {
        items = await getters[sourceId]()
        console.log(`🔄 实时获取 ${sourceId} 数据: ${items.length} 条`)
      }

      // 转换为ExtendedNewsItem格式
      const extendedItems: ExtendedNewsItem[] = items.map(item => ({
        ...item,
        platform: sourceId,
        timestamp: Date.now() // 使用当前时间作为采集时间
      }))

      return { items: extendedItems }
    } catch (error) {
      const errorMsg = `获取 ${sourceId} 数据失败: ${error instanceof Error ? error.message : String(error)}`
      console.error(`❌ ${errorMsg}`)
      return { items: [], error: errorMsg }
    }
  }

  /**
   * 过滤数据源（根据优先级分类）
   */
  private filterSourcesByPriority(sourceIds: SourceID[]): SourceID[] {
    if (!this.config.priorityColumns) return sourceIds
    
    return sourceIds.filter(sourceId => {
      const source = sources[sourceId]
      return source && this.config.priorityColumns!.includes(source.column as any)
    })
  }

  /**
   * 聚合多个数据源的数据
   */
  async aggregateData(): Promise<AggregationResult> {
    const now = Date.now()
    const startTime = now - (this.config.timeRangeHours * 60 * 60 * 1000)
    
    console.log(`🚀 开始数据聚合...`)
    console.log(`📊 配置: ${this.config.sources.length} 个数据源, ${this.config.timeRangeHours}小时范围, 最多${this.config.maxItems}条`)
    
    // 过滤数据源
    let targetSources = this.config.sources
    if (this.config.priorityColumns) {
      targetSources = this.filterSourcesByPriority(targetSources)
      console.log(`🔍 按优先级过滤后: ${targetSources.length} 个数据源`)
    }

    // 并发获取数据
    const fetchPromises = targetSources.map(sourceId => 
      this.fetchFromSource(sourceId)
    )
    
    const results = await Promise.all(fetchPromises)
    
    // 合并所有数据
    let allItems: ExtendedNewsItem[] = []
    const errors: string[] = []
    
    results.forEach((result, index) => {
      if (result.error) {
        errors.push(result.error)
      } else {
        allItems.push(...result.items)
      }
    })

    console.log(`📈 原始数据: ${allItems.length} 条新闻`)

    // 按时间戳过滤（如果新闻有pubDate，使用pubDate；否则使用采集时间）
    allItems = allItems.filter(item => {
      const itemTime = item.pubDate ? 
        (typeof item.pubDate === 'number' ? item.pubDate : new Date(item.pubDate).getTime()) :
        item.timestamp
      return itemTime >= startTime
    })

    console.log(`⏰ 时间过滤后: ${allItems.length} 条新闻`)

    // 去重（基于title和url）
    const uniqueItems: ExtendedNewsItem[] = []
    const seen = new Set<string>()
    
    for (const item of allItems) {
      const key = `${item.title}-${item.url}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueItems.push(item)
      }
    }

    console.log(`🔄 去重后: ${uniqueItems.length} 条新闻`)

    // 按时间戳排序（最新的在前）
    uniqueItems.sort((a, b) => b.timestamp - a.timestamp)

    // 限制数量
    const finalItems = uniqueItems.slice(0, this.config.maxItems)
    
    console.log(`✅ 最终结果: ${finalItems.length} 条新闻`)
    if (errors.length > 0) {
      console.log(`⚠️  发生 ${errors.length} 个错误`)
    }

    return {
      newsItems: finalItems,
      sources: targetSources,
      totalItems: finalItems.length,
      timeRange: {
        start: startTime,
        end: now
      },
      errors
    }
  }

  /**
   * 获取数据源统计信息
   */
  async getSourceStats(): Promise<Record<string, {
    count: number
    latestUpdate: number
    platform: string
  }>> {
    const result = await this.aggregateData()
    const stats: Record<string, { count: number, latestUpdate: number, platform: string }> = {}
    
    result.newsItems.forEach(item => {
      const platform = item.platform
      if (!stats[platform]) {
        stats[platform] = {
          count: 0,
          latestUpdate: 0,
          platform: sources[platform]?.name || platform
        }
      }
      stats[platform].count++
      stats[platform].latestUpdate = Math.max(stats[platform].latestUpdate, item.timestamp)
    })
    
    return stats
  }
}

/**
 * 创建数据聚合器的便捷函数
 */
export function createDataAggregator(config?: Partial<DataAggregationConfig>): DataAggregator {
  return new DataAggregator(config)
}

/**
 * 快速获取商业分析用的热点数据
 */
export async function getBusinessAnalysisData(timeHours: number = 2): Promise<AggregationResult> {
  const aggregator = createDataAggregator({
    sources: DEFAULT_HIGH_VALUE_SOURCES,
    timeRangeHours: timeHours,
    maxItems: 50, // 商业分析不需要太多数据
    useCache: true,
    priorityColumns: ['finance', 'tech', 'china']
  })
  
  return await aggregator.aggregateData()
}