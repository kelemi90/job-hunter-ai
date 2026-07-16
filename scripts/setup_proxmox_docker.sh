#!/bin/bash

# Job Hunter AI - Proxmox/Docker Automation Setup Script
# This script automates the installation of Docker and setup of the project environment.

set -e

echo "🚀 Starting Job Hunter AI Setup..."

# 1. Update and Install Dependencies
echo "📦 Updating system and installing dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release git

# 2. Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(ls_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker is already installed."
fi

# 3. Project Setup
echo "📂 Setting up project directory..."
if [ ! -d "job-hunter-ai" ]; then
    git clone https://github.com/kelemi90/job-hunter-ai.git
    cd job-hunter-ai
else
    cd job-hunter-ai
    git pull
fi

# 4. Environment File Template
echo "📄 Creating .env template..."
if [ ! -f ".env" ]; then
    cat <<EOF > .env
# --- DATABASE ---
DATABASE_URL="postgresql://user:password@postgres:5432/job_hunter_db?schema=public"
POSTGRES_USER=user
POSTGRES_PASSWORD=$(openssl rand -hex 12)
POSTGRES_DB=job_hunter_db

# --- PGADMIN ---
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=$(openssl rand -hex 12)

# --- API KEYS ---
OPENAI_API_KEY="your_openai_api_key_here"
DISCORD_WEBHOOK_URL="your_discord_webhook_url_here"

# --- APP ---
PORT=3000
EOF
    echo "✅ .env file created with secure random passwords."
    echo "⚠️  ACTION REQUIRED: Edit the .env file to add your OpenAI and Discord keys."
else
    echo "✅ .env file already exists."
fi

echo "-------------------------------------------------------"
echo "🎉 Setup complete!"
echo "1. Run 'newgrp docker' or log out/in to apply docker group changes."
echo "2. Edit your .env file: 'nano .env'"
echo "3. Start the project: 'docker compose up -d --build'"
echo "-------------------------------------------------------"
