# 🚀 SpeedTest Pro - Quick Start Guide

Welcome to SpeedTest Pro! Follow these simple steps to get your speed test application running.

## ⚡ Fastest Way to Start (3 Steps)

### 1️⃣ Install Prerequisites

**Java 17 or higher:**
```bash
# macOS (using Homebrew)
brew install openjdk@17

# Verify installation
java -version
```

**Node.js 18+:**
```bash
# macOS (using Homebrew)
brew install node

# Verify installation
node -v
npm -v
```

**Maven:**
```bash
# macOS (using Homebrew)
brew install maven

# Verify installation
mvn -v
```

### 2️⃣ Run the Application

**Option A: Run Everything Together (Recommended)**
```bash
cd "SpeedTest Pro"
./start-all.sh
```

**Option B: Run Backend & Frontend Separately**
```bash
# Terminal 1 - Backend
cd "SpeedTest Pro"
./start-backend.sh

# Terminal 2 - Frontend (in new terminal)
cd "SpeedTest Pro"
./start-frontend.sh
```

**Option C: Using Docker (Easiest)**
```bash
cd "SpeedTest Pro"
docker-compose up --build
```

### 3️⃣ Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:5173 (or http://localhost if using Docker)
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health

## 🎯 What You Should See

1. **Beautiful landing page** with "SpeedTest Pro" header
2. **Large circular speed gauge** in the center
3. **Four metric cards** showing Download, Upload, Ping, and Jitter
4. **"Start Test" button** at the bottom

## 🧪 Testing the Application

1. Click the **"Start Test"** button
2. Watch as the application:
   - 🔍 Measures ping and jitter (takes ~5 seconds)
   - ⬇️ Tests download speed (takes ~5-10 seconds)
   - ⬆️ Tests upload speed (takes ~5-10 seconds)
3. View your results in the metric cards!

## 🛑 Stopping the Application

**If using start-all.sh:**
- Press `Ctrl + C` in the terminal

**If running separately:**
- Press `Ctrl + C` in both terminals

**If using Docker:**
```bash
docker-compose down
```

## 🔧 Common Issues & Solutions

### Issue: "Port 8080 already in use"
**Solution:**
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9
```

### Issue: "Frontend can't connect to backend"
**Solution:**
1. Make sure backend is running on port 8080
2. Check backend health: http://localhost:8080/actuator/health
3. Clear browser cache and reload

### Issue: "npm install fails"
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: "Maven build fails"
**Solution:**
```bash
cd backend
mvn clean install -U
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check API endpoints documentation
- Customize the UI in `frontend/src/styles/index.css`
- Modify test parameters in `frontend/src/App.jsx`

## 🎨 Customization Quick Tips

### Change Test File Size
Edit `frontend/src/App.jsx`:
```javascript
// Download test size (line ~85)
const size = 10; // Change to 5, 20, 50, etc. (in MB)

// Upload test size (line ~105)
const size = 5; // Change to 10, 20, 30, etc. (in MB)
```

### Change Colors
Edit `frontend/src/styles/index.css`:
```css
:root {
  --primary-color: #00a8ff;     /* Main blue color */
  --secondary-color: #273c75;   /* Dark blue */
  --success-color: #44bd32;     /* Green */
  --danger-color: #e84118;      /* Red */
  --warning-color: #fbc531;     /* Yellow */
}
```

### Change Backend Port
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8080  # Change to any available port
```

Don't forget to update the frontend API URL in `frontend/vite.config.js`!

## 📞 Need Help?

- Check the logs:
  - Backend: `tail -f backend.log`
  - Frontend: `tail -f frontend.log`
- Review the [README.md](README.md) for detailed documentation
- Check backend health: http://localhost:8080/actuator/health

## 🎉 Enjoy Testing!

Your internet speed testing application is now ready to use. Happy testing! ⚡

---

**Made with ❤️ using Spring Boot & React**
