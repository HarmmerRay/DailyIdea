-- MySQL Database Initialization Script for NewsNow
-- Run this script to create the required database and tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS newsnow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE newsnow;

-- Create cache table
CREATE TABLE IF NOT EXISTS cache (
  id VARCHAR(255) PRIMARY KEY,
  updated BIGINT,
  data TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table for email subscription management
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create daily_tasks table for push record tracking
CREATE TABLE IF NOT EXISTS daily_tasks (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  recipients TEXT,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  sent_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user table (keep for compatibility)
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255),
  data TEXT,
  type VARCHAR(50),
  created BIGINT,
  updated BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);

-- Create MySQL user (optional - you can create this manually)
-- CREATE USER IF NOT EXISTS 'newsnow'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON newsnow.* TO 'newsnow'@'%';
-- FLUSH PRIVILEGES; 