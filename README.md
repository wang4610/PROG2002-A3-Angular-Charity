# 🎯 慈善活动网站项目说明

## 📋 项目简介
这是一个完整的慈善活动平台，用户可以浏览活动、搜索活动、报名参加活动，管理员可以对活动进行增删改查。

---

## 🛠 技术栈
- **前端**：Angular 22.2.0
- **后端**：Node.js + Express
- **数据库**：MySQL
- **部署**：cPanel

---

## 🖥 本地运行步骤

### 1. 环境准备
确保电脑上已安装：
- Node.js (v18 或以上)
- MySQL
- Angular CLI (`npm install -g @angular/cli`)

### 2. 数据库准备
1. 打开 MySQL，创建数据库：`charityevents_db`
2. 导入 `charityevents_db.sql` 文件到这个数据库
3. 确认用户名密码：默认是 `root` / 你的本地密码

### 3. 后端启动
```bash
cd charity-event-backend
npm install
# 修改 server.js 里的本地数据库密码（如果和你本地不一样）
node server.js
```
后端会运行在 `http://localhost:3000`

### 4. 前端启动
```bash
cd charity-app
npm install
ng serve
```
前端会运行在 `http://localhost:4200`

---

## 🚀 cPanel 部署步骤

### 1. 数据库部署
1. 登录 cPanel，打开 MySQL Databases
2. 创建数据库：`你的用户名_charityevents`
3. 创建数据库用户，设置密码
4. 把用户添加到数据库，授予所有权限
5. 打开 phpMyAdmin，导入 `charityevents_db.sql`（注意：导入前要先删掉 SQL 文件开头的 `CREATE DATABASE` 语句，否则会报错）

### 2. 后端部署
1. 打开 cPanel File Manager
2. 在 `/home/你的用户名/` 下创建文件夹 `charity-api`
3. 把 `charity-event-backend` 里的所有文件（除了 node_modules）上传到这个文件夹
4. 打开 cPanel 的 Setup Node.js App
5. 创建 Node.js 应用：
   - App URI：`你的域名/charity-api`
   - App Root Directory：`/home/你的用户名/charity-api`
   - Node.js version：v18
   - Application mode：production
6. 在应用设置里，运行 `npm install`
7. **重要**：修改 `server.js` 里的数据库配置，改成你自己的 cPanel 数据库用户名、密码、数据库名

### 3. 前端部署
1. 本地构建前端：
```bash
cd charity-app
ng build
```
2. 把 `dist/charity-app/browser/` 里的所有文件上传到 `public_html` 目录
3. 把 `.htaccess` 文件也上传到 `public_html` 根目录

### 4. 重启应用
回到 Node.js 应用管理页面，点击 Restart 按钮重启后端应用

---

## ✅ 验证部署
打开 `https://你的域名/`，应该能看到：
- 首页统计数字正常显示（不是 0）
- 导航栏所有页面都能正常跳转
- Admin 管理页面能看到活动列表

---

## ⚠️ 常见问题

### 1. 首页统计数字全是 0
- 检查后端数据库连接是否正常
- 检查浏览器控制台 Network 里的 API 请求是否返回 200

### 2. 直接访问 /admin 页面显示 404
- 检查 `.htaccess` 文件是否正确上传到 public_html 根目录

### 3. 图片加载慢
- 我们用的是 unsplash 的外部图片，国内网络加载慢是正常的，不是代码问题

---

## 📞 有问题随时问队友！
