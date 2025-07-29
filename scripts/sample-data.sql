-- Sample Data Insertion Script for dailyidea
-- 这个脚本插入一些示例数据，帮助你理解表结构

USE dailyidea;

-- 插入示例用户
INSERT INTO users (id, email, name, avatar, status, created_at, updated_at) VALUES
('user_001', 'alice@example.com', 'Alice', 'https://example.com/avatar1.jpg', 'active', '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
('user_002', 'bob@example.com', 'Bob', 'https://example.com/avatar2.jpg', 'active', '2024-01-16 14:20:00', '2024-01-16 14:20:00'),
('user_003', 'charlie@example.com', 'Charlie', 'https://example.com/avatar3.jpg', 'inactive', '2024-01-17 09:15:00', '2024-01-17 09:15:00');

-- 插入用户个人数据
INSERT INTO user_data (id, data, updated_at) VALUES
('user_001', '{"preferences": {"theme": "dark", "language": "zh-CN"}, "sources": ["zhihu", "weibo", "github"]}', '2024-01-15 10:30:00'),
('user_002', '{"preferences": {"theme": "light", "language": "en-US"}, "sources": ["hackernews", "producthunt"]}', '2024-01-16 14:20:00');

-- 插入AI总结记录
INSERT INTO ai_summaries (id, user_id, title, content, source_type, source_url, summary_type, status, created_at, updated_at) VALUES
('summary_001', 'user_001', '今日科技新闻总结', '今日主要科技新闻包括：1. 人工智能发展新突破...', 'news', 'https://example.com/news1', 'daily', 'completed', '2024-01-20 08:00:00', '2024-01-20 08:00:00'),
('summary_002', 'user_001', '本周投资市场分析', '本周投资市场表现分析：1. 股市整体上涨...', 'article', 'https://example.com/article1', 'weekly', 'completed', '2024-01-21 09:30:00', '2024-01-21 09:30:00'),
('summary_003', 'user_002', '今日编程技术分享', '今日编程技术分享：1. React 18新特性...', 'news', 'https://example.com/news2', 'daily', 'pending', '2024-01-22 10:15:00', '2024-01-22 10:15:00');

-- 插入推送记录
INSERT INTO push_records (id, user_id, summary_id, title, content, push_type, recipient, status, sent_at, created_at, updated_at) VALUES
('push_001', 'user_001', 'summary_001', '今日科技新闻推送', '今日科技新闻总结已生成，请查收...', 'email', 'alice@example.com', 'sent', '2024-01-20 08:05:00', '2024-01-20 08:00:00', '2024-01-20 08:05:00'),
('push_002', 'user_001', 'summary_002', '本周投资分析推送', '本周投资市场分析报告已生成...', 'email', 'alice@example.com', 'sent', '2024-01-21 09:35:00', '2024-01-21 09:30:00', '2024-01-21 09:35:00'),
('push_003', 'user_002', 'summary_003', '编程技术分享推送', '今日编程技术分享已生成...', 'email', 'bob@example.com', 'pending', NULL, '2024-01-22 10:15:00', '2024-01-22 10:15:00');

-- 查询示例：查看所有活跃用户
SELECT 
    u.id,
    u.name,
    u.email,
    u.status,
    u.created_at,
    ud.data as user_preferences
FROM users u
LEFT JOIN user_data ud ON u.id = ud.id
WHERE u.status = 'active';

-- 查询示例：查看用户的AI总结和推送记录
SELECT 
    u.name as user_name,
    s.title as summary_title,
    s.summary_type,
    s.status as summary_status,
    p.push_type,
    p.status as push_status,
    s.created_at as summary_created,
    p.sent_at as push_sent_time
FROM users u
LEFT JOIN ai_summaries s ON u.id = s.user_id
LEFT JOIN push_records p ON s.id = p.summary_id
ORDER BY s.created_at DESC;

-- 查询示例：查看今日的AI总结
SELECT 
    u.name,
    s.title,
    s.summary_type,
    s.status,
    s.created_at
FROM ai_summaries s
JOIN users u ON s.user_id = u.id
WHERE DATE(s.created_at) = CURDATE()
ORDER BY s.created_at DESC;

-- 查询示例：查看推送统计
SELECT 
    push_type,
    status,
    COUNT(*) as count,
    DATE(created_at) as date
FROM push_records
GROUP BY push_type, status, DATE(created_at)
ORDER BY date DESC, count DESC; 