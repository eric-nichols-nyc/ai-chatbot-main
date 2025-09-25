#!/bin/bash

echo "🚀 Setting up local blob storage with MinIO..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start MinIO container
echo "📦 Starting MinIO container..."
docker run -d \
  --name minio-chatbot \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Wait for MinIO to start
echo "⏳ Waiting for MinIO to start..."
sleep 5

# Check if container is running
if docker ps | grep -q minio-chatbot; then
    echo "✅ MinIO is running!"
    echo ""
    echo "🌐 MinIO Console: http://localhost:9001"
    echo "🔑 Username: minioadmin"
    echo "🔑 Password: minioadmin"
    echo ""
    echo "📡 API Endpoint: http://localhost:9000"
    echo ""
    echo "💡 To use local storage, set USE_LOCAL_BLOB=true in your .env.local file"
    echo "💡 Or run: export USE_LOCAL_BLOB=true"
else
    echo "❌ Failed to start MinIO container"
    exit 1
fi






