-- 设置数据库字符集
ALTER DATABASE membuddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 
-- 创建用户并授权
CREATE USER IF NOT EXISTS 'membuddy'@'%' IDENTIFIED BY 'membuddypass';
GRANT ALL PRIVILEGES ON membuddy.* TO 'membuddy'@'%';
FLUSH PRIVILEGES; 