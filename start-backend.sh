#!/bin/bash

echo "🚀 Starting SpeedTest Pro Backend..."
echo ""

cd backend

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java 17 or higher is required. Current version: $JAVA_VERSION"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.8+."
    exit 1
fi

echo "✅ Java and Maven found"
echo ""

# Clean and build
echo "📦 Building backend..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting backend server..."
    echo ""
    mvn spring-boot:run
else
    echo "❌ Build failed!"
    exit 1
fi
