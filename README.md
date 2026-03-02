# ⚡ SpeedTest Pro

**Real Time Internet Speed Measurement System**

A production-ready internet speed testing application built with Spring Boot 3 and React 18, featuring real-time WebSocket updates and a beautiful, responsive UI.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- ⚡ **Download Speed Test** - Measures download speed in real-time
- ⚡ **Upload Speed Test** - Accurate upload speed measurement
- ⚡ **Ping & Jitter Measurement** - Network latency and stability testing
- 🔄 **Real-time Updates** - WebSocket-powered live progress tracking
- 🎨 **Beautiful UI** - Modern, responsive design with animated gauges
- 🐳 **Docker Ready** - One-command deployment with Docker Compose
- 📊 **Production Grade** - Error handling, logging, and health checks
- 🌐 **CORS Enabled** - Secure cross-origin resource sharing

## 📋 Prerequisites

Before running SpeedTest Pro, ensure you have the following installed:

- **Java 17 or higher** (Amazon Corretto or OpenJDK)
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Docker & Docker Compose** (optional, for containerized deployment)

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **WebSocket**: STOMP over WebSocket
- **Build Tool**: Maven
- **Features**: Spring Web, WebSocket, Actuator, Lombok

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5
- **HTTP Client**: Axios
- **WebSocket Client**: SockJS + STOMP.js
- **Styling**: Pure CSS3 with animations

## 📁 Project Structure

```
SpeedTest Pro/
├── backend/                    # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/speedtest/pro/
│   │   │   │   ├── config/           # Configuration classes
│   │   │   │   │   ├── CorsConfig.java
│   │   │   │   │   └── WebSocketConfig.java
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   │   └── SpeedTestController.java
│   │   │   │   ├── service/          # Business Logic
│   │   │   │   │   └── SpeedTestService.java
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   │   ├── SpeedTestResult.java
│   │   │   │   │   └── SpeedTestProgress.java
│   │   │   │   ├── websocket/        # WebSocket Handlers
│   │   │   │   │   └── WebSocketController.java
│   │   │   │   └── SpeedTestProApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpeedGauge.jsx        # Speed meter component
│   │   │   └── MetricCard.jsx        # Metric display card
│   │   ├── services/
│   │   │   ├── api.js                # REST API client
│   │   │   └── websocket.js          # WebSocket client
│   │   ├── styles/
│   │   │   └── index.css             # Global styles
│   │   ├── App.jsx                   # Main component
│   │   └── main.jsx                  # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Docker orchestration
└── README.md
```

## 🚀 Quick Start

### Option 1: Run with Docker (Recommended)

```bash
# Navigate to project directory
cd "SpeedTest Pro"

# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
# Health Check: http://localhost:8080/actuator/health
```

### Option 2: Run Locally

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean package

# Run the application
mvn spring-boot:run

# Backend will start on http://localhost:8080
```

#### Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will start on http://localhost:5173
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000

# File Upload Size (for upload speed test)
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB

# WebSocket Configuration
spring.websocket.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

Edit `frontend/vite.config.js` if backend runs on different port:

```javascript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Change if needed
        changeOrigin: true,
      }
    }
  }
})
```

## 📡 API Endpoints

### REST APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/speedtest/health` | Health check |
| GET | `/api/speedtest/generate-test-id` | Generate unique test ID |
| GET | `/api/speedtest/download?size={mb}` | Download test data |
| POST | `/api/speedtest/upload` | Upload speed test |
| GET | `/api/speedtest/ping?testId={id}` | Ping/latency test |
| GET | `/api/speedtest/ping-simple` | Simple ping endpoint |

### WebSocket Endpoint

- **Connection**: `ws://localhost:8080/ws`
- **Subscribe**: `/topic/speedtest/{testId}`
- **Send**: `/app/test-progress`

## 🎯 How It Works

### Speed Test Flow

1. **Test Initialization**
   - User clicks "Start Test"
   - Frontend generates unique test ID
   - WebSocket connection established

2. **Ping Measurement**
   - Sends multiple ping requests to server
   - Calculates average latency and jitter
   - Updates UI in real-time

3. **Download Test**
   - Requests random data from server
   - Measures time to download
   - Calculates speed in Mbps

4. **Upload Test**
   - Generates random data on client
   - Uploads to server
   - Measures upload speed

5. **Results Display**
   - All metrics displayed on UI
   - Beautiful animated gauges
   - Ready for next test

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🏗️ Building for Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/speedtest-pro-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
# Built files will be in dist/ folder
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate
```

## 📊 Monitoring

### Health Checks

- **Backend Health**: http://localhost:8080/actuator/health
- **Backend Info**: http://localhost:8080/actuator/info
- **Backend Metrics**: http://localhost:8080/actuator/metrics

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

## 🎨 UI Features

- ✨ Animated speed gauge with gradient colors
- 📊 Real-time metric cards (Download, Upload, Ping, Jitter)
- 📈 Progress bar during testing
- 🌈 Gradient background with modern design
- 📱 Fully responsive (works on mobile, tablet, desktop)
- ⚡ Smooth animations and transitions

## 🔒 Security Features

- CORS configuration for secure cross-origin requests
- File size limits to prevent abuse
- Request validation and error handling
- Nginx security headers in production

## 🚧 Troubleshooting

### Backend Won't Start

```bash
# Check Java version
java -version  # Should be 17 or higher

# Check if port 8080 is in use
lsof -i :8080

# Clean and rebuild
mvn clean install
```

### Frontend Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20+
```

### WebSocket Connection Issues

1. Ensure backend is running on port 8080
2. Check CORS configuration in `application.properties`
3. Verify WebSocket endpoint in frontend `websocket.js`

## 📈 Performance Optimization

### Backend
- Connection pooling configured
- Actuator health checks enabled
- Docker multi-stage build reduces image size

### Frontend
- Vite for fast HMR (Hot Module Replacement)
- Nginx gzip compression enabled
- Static asset caching configured
- Production build minification

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using Spring Boot & React

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Vite Team
- All open-source contributors

---

**Happy Testing! ⚡**

For issues and feature requests, please create an issue on GitHub.
