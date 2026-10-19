好的！我给你翻译成英文版的README：

---

# 🎯 Charity Event Website Project README
## 📋 Project Introduction
This is a complete charity event platform. Users can browse events, search for events, and register to attend events. Administrators can perform full CRUD (create, read, update, delete) operations on charity events.

---
## 🛠 Tech Stack
- **Frontend**: Angular 22.2.0
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Deployment**: SCU cPanel

---
## 🖥 Local Setup Instructions
### 1. Prerequisites
Make sure these are installed on your computer:
- Node.js (v18 or above)
- MySQL
- Angular CLI (`npm install -g @angular/cli`)

### 2. Database Setup
1. Open MySQL, create a new database named: `charityevents_db`
2. Import the `charityevents_db.sql` file into this database
3. Confirm your local MySQL username and password (default username: `root`, use your local password)

### 3. Start Backend
```bash
cd charity-event-backend
npm install
# Edit the database password in server.js if it does not match your local MySQL password
node server.js
```
The backend API will run at `[http://localhost:3000](http://localhost:3000)`

### 4. Start Frontend
```bash
cd charity-app
npm install
ng serve
```
The frontend website will run at `[http://localhost:4200](http://localhost:4200)`

---
## 🚀 cPanel Deployment Guide
### 1. Database Deployment
1. Log in to cPanel, open MySQL Databases
2. Create a new database: `your_username_charityevents`
3. Create a new database user, set a secure password
4. Add the user to the database, grant ALL PRIVILEGES
5. Open phpMyAdmin, import the `charityevents_db.sql` file
   *Important: Remove the `CREATE DATABASE` line from the top of the SQL file before importing, otherwise it will throw an error.*

### 2. Backend Deployment
1. Open cPanel File Manager
2. Create a folder named `charity-api` under `/home/your_username/`
3. Upload all files from `charity-event-backend` (exclude the `node_modules` folder) to this directory
4. Open Setup Node.js App in cPanel
5. Create a new Node.js application:
   - App URI: `your_domain/charity-api`
   - App Root Directory: `/home/your_username/charity-api`
   - Node.js version: v18
   - Application mode: production
6. In the application settings page, run `npm install`
7. **Critical**: Edit the database config in `server.js` to match your cPanel database username, password, and database name.

### 3. Frontend Deployment
1. Build the frontend locally:
```bash
cd charity-app
ng build
```
2. Upload all files from `dist/charity-app/browser/` to the `public_html` directory
3. Upload the `.htaccess` file to the root of `public_html`

### 4. Restart Application
Go back to the Node.js application management page, click Restart to apply changes.

---
## ✅ Verify Deployment
Open `https://your_domain/` in your browser:
- The statistics numbers on the home page should display correctly (not all 0)
- All navigation links should work properly
- The Admin page should load the event list correctly

---
## ⚠️ Troubleshooting
### 1. Statistics numbers on home page all show 0
- Check if the backend database connection works correctly
- Check the browser DevTools Network tab to confirm API requests return 200 status

### 2. Visiting /admin page directly returns 404
- Check if the `.htaccess` file is uploaded correctly to the root of `public_html`

### 3. Images load slowly
- We use external images from Unsplash. Slow loading is normal due to network latency, it is not a code issue.

---
## 📞 Contact your teammate if you have any questions!