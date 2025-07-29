-- MySQL Database Initialization Script for dailyidea
-- Run this script to create the required database and tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS dailyidea CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE dailyidea;

-- Create cache table for news data caching
CREATE TABLE IF NOT EXISTS cache (
  id VARCHAR(255) PRIMARY KEY COMMENT '缓存ID，通常是数据源ID',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  data TEXT COMMENT '缓存的JSON数据'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻数据缓存表';

-- Create users table for user management (主要用户表)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY COMMENT '用户唯一ID',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT '用户邮箱',
  name VARCHAR(255) COMMENT '用户昵称',
  avatar VARCHAR(500) COMMENT '用户头像URL',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '用户状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- Create user_data table for user personal data sync (用户个人数据同步表)
CREATE TABLE IF NOT EXISTS user_data (
  id VARCHAR(255) PRIMARY KEY COMMENT '用户ID，关联users表',
  data TEXT COMMENT '用户个人数据JSON',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '数据更新时间',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户个人数据表';

-- Create ai_summaries table for AI analysis records (AI总结记录表)
CREATE TABLE IF NOT EXISTS ai_summaries (
  id VARCHAR(255) PRIMARY KEY COMMENT '总结记录唯一ID',
  user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
  title VARCHAR(500) NOT NULL COMMENT '总结标题',
  content TEXT NOT NULL COMMENT '总结内容',
  source_type ENUM('news', 'article', 'custom') DEFAULT 'news' COMMENT '内容来源类型',
  source_url VARCHAR(1000) COMMENT '来源URL',
  summary_type ENUM('daily', 'weekly', 'monthly', 'custom') DEFAULT 'daily' COMMENT '总结类型',
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '处理状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI总结记录表';

-- Create push_records table for push notification tracking (推送记录表)
CREATE TABLE IF NOT EXISTS push_records (
  id VARCHAR(255) PRIMARY KEY COMMENT '推送记录唯一ID',
  user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
  summary_id VARCHAR(255) COMMENT '关联的AI总结ID',
  title VARCHAR(500) NOT NULL COMMENT '推送标题',
  content TEXT NOT NULL COMMENT '推送内容',
  push_type ENUM('email', 'webhook', 'sms') DEFAULT 'email' COMMENT '推送类型',
  recipient VARCHAR(255) NOT NULL COMMENT '接收者（邮箱/手机号等）',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending' COMMENT '推送状态',
  sent_at DATETIME NULL COMMENT '发送时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (summary_id) REFERENCES ai_summaries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推送记录表';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_user_id ON ai_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_status ON ai_summaries(status);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_created_at ON ai_summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_summary_type ON ai_summaries(summary_type);

CREATE INDEX IF NOT EXISTS idx_push_records_user_id ON push_records(user_id);
CREATE INDEX IF NOT EXISTS idx_push_records_status ON push_records(status);
CREATE INDEX IF NOT EXISTS idx_push_records_created_at ON push_records(created_at);
CREATE INDEX IF NOT EXISTS idx_push_records_push_type ON push_records(push_type);

-- Create MySQL user (optional - you can create this manually)
-- CREATE USER IF NOT EXISTS 'dailyidea'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON dailyidea.* TO 'dailyidea'@'%';
-- FLUSH PRIVILEGES; 