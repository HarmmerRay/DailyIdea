#!/bin/bash

# DailyIdea MySQL Docker 启动脚本

echo "🚀 启动 DailyIdea MySQL 环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env.mysql ]; then
    echo "📋 创建环境变量文件..."
    cp .env.mysql.example .env.mysql
    echo "✅ 已创建 .env.mysql 文件，请检查并修改配置"
fi

# 加载环境变量
export $(grep -v '^#' .env.mysql | xargs)

echo "📊 MySQL 配置信息:"
echo "   数据库: ${MYSQL_DATABASE:-dailyidea}"
echo "   用户: ${MYSQL_USER:-dailyidea}"
echo "   端口: ${MYSQL_PORT:-3306}"
echo "   phpMyAdmin: http://localhost:${PHPMYADMIN_PORT:-8080}"

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.mysql.yml --env-file .env.mysql down

# 启动MySQL容器
echo "🔄 启动 MySQL 容器..."
docker-compose -f docker-compose.mysql.yml --env-file .env.mysql up -d

# 等待MySQL就绪
echo "⏳ 等待 MySQL 启动完成..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker exec dailyidea-mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-dailyidea123} --silent > /dev/null 2>&1; then
        echo "✅ MySQL 启动成功!"
        break
    fi
    
    echo "   等待中... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ MySQL 启动超时"
    docker-compose -f docker-compose.mysql.yml --env-file .env.mysql logs mysql
    exit 1
fi

# 显示容器状态
echo ""
echo "📦 容器状态:"
docker-compose -f docker-compose.mysql.yml --env-file .env.mysql ps

echo ""
echo "🎉 MySQL 环境启动完成!"
echo ""
echo "📝 连接信息:"
echo "   MySQL: localhost:${MYSQL_PORT:-3306}"
echo "   数据库: ${MYSQL_DATABASE:-dailyidea}"
echo "   用户名: ${MYSQL_USER:-dailyidea}"
echo "   密码: ${MYSQL_PASSWORD:-dailyidea123}"
echo ""
echo "🌐 管理界面:"
echo "   phpMyAdmin: http://localhost:${PHPMYADMIN_PORT:-8080}"
echo ""
echo "🔧 有用的命令:"
echo "   查看日志: docker-compose -f docker-compose.mysql.yml --env-file .env.mysql logs -f"
echo "   停止服务: docker-compose -f docker-compose.mysql.yml --env-file .env.mysql down"
echo "   重启服务: docker-compose -f docker-compose.mysql.yml --env-file .env.mysql restart"
echo "   进入MySQL: docker exec -it dailyidea-mysql mysql -u ${MYSQL_USER:-dailyidea} -p${MYSQL_PASSWORD:-dailyidea123} ${MYSQL_DATABASE:-dailyidea}"