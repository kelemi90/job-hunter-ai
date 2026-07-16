# Deployment Guide: Job Hunter AI on Proxmox with Docker

This guide provides step-by-step instructions to deploy your `job-hunter-ai` application on a Proxmox virtual machine using Docker and Docker Compose.

## 1. Proxmox VM Setup (Assumed)

It is assumed you have a Proxmox environment set up and a virtual machine (VM) or LXC container running a Linux distribution (e.g., Ubuntu Server) where you will install Docker. Ensure your VM has sufficient resources (at least 2GB RAM, 2 CPU cores, and 20GB storage).

## 2. Install Docker and Docker Compose

SSH into your Linux VM and install Docker and Docker Compose. For Ubuntu, you can follow these steps:

```bash
# Update package list
sudo apt update

# Install necessary packages
sudo apt install ca-certificates curl gnupg lsb-release -y

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Verify Docker installation
sudo docker run hello-world

# Add your user to the docker group to run Docker commands without sudo
sudo usermod -aG docker $USER
# Log out and log back in for the group change to take effect
```

## 3. Clone the Repository

Navigate to your desired directory on the VM and clone your `job-hunter-ai` repository:

```bash
git clone https://github.com/kelemi90/job-hunter-ai.git
cd job-hunter-ai
```

## 4. Configure Environment Variables

Create a `.env` file in the root of your `job-hunter-ai` directory (the same level as `docker-compose.yml`). This file will contain sensitive information and API keys. **Never commit this file to Git.**

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@postgres:5432/job_hunter_db?schema=public"
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=job_hunter_db

# PGAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin_password

# OpenAI API Key (for AI Matching Service)
OPENAI_API_KEY="your_openai_api_key_here"

# Discord Webhook URL (for Notifications)
DISCORD_WEBHOOK_URL="your_discord_webhook_url_here"

# NestJS Application Port
PORT=3000
```

**Important:** Replace `user`, `password`, `your_openai_api_key_here`, and `your_discord_webhook_url_here` with your actual credentials. For `DATABASE_URL`, ensure the `postgres` hostname matches the service name in `docker-compose.yml`.

## 5. Deploy with Docker Compose

Navigate to the root of your `job-hunter-ai` directory (where `docker-compose.yml` and your `.env` file are located) and run:

```bash
docker compose up --build -d
```

*   `--build`: This will build the Docker images for your services (especially the `api` service) from scratch. Only needed on the first run or after changes to the `Dockerfile` or dependencies.
*   `-d`: Runs the containers in detached mode (in the background).

This command will:
1.  Build the `api` service Docker image.
2.  Start the `postgres` database container.
3.  Start the `pgadmin` container.
4.  Start your `api` (NestJS application) container, connecting it to the database.

## 6. Initialize the Database

Once the containers are running, you need to apply the Prisma migrations to create the database schema. You can do this by executing a command inside your `api` container:

```bash
docker exec -it job-hunter-api pnpm exec prisma migrate dev --name init
```

*   `job-hunter-api`: This is the `container_name` defined in your `docker-compose.yml` for the API service.
*   `pnpm exec prisma migrate dev --name init`: This command tells Prisma to apply any pending migrations. You will be prompted to confirm if you want to create the database if it doesn't exist.

## 7. Create Your User Profile and Preferences

Before the scheduler can effectively match jobs for you, you need to create your user profile and define your job preferences. You can do this by making `POST` and `PUT` requests to your API. You can use `curl`, Postman, or any API client.

First, create a user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d 
```

Note the `id` returned from this request. You will use it to update your preferences.

Next, update your preferences using the `userId` obtained from the previous step:

```bash
curl -X PUT http://localhost:3000/api/users/<YOUR_USER_ID>/preferences \
  -H "Content-Type: application/json" \
  -d 
```

Replace `<YOUR_USER_ID>` with the actual ID of the user you just created. Adjust `skills`, `locations`, `minSalary`, `remoteOnly`, and `seniorityLevel` to match your profile.

## 8. Verify Functionality

*   **Access pgAdmin:** Open your web browser and navigate to `http://<YOUR_VM_IP_ADDRESS>:5050`. Log in with the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` you set in your `.env` file. You should see your `job_hunter_db` with the `User`, `JobPreference`, `JobPosting`, and `JobMatch` tables.
*   **Test Scraper:** Manually trigger a scrape to ensure data is being collected:
    ```bash
    curl -X GET "http://localhost:3000/api/scraper/test-all?q=developer&locations=Oulu,Helsinki,Vantaa,Espoo"
    ```
*   **Test Matching:** Manually trigger the matching process for your user:
    ```bash
    curl -X POST "http://localhost:3000/api/matching/run/<YOUR_USER_ID>"
    ```
*   **Check Notifications:** If you configured `DISCORD_WEBHOOK_URL`, you should receive notifications for any matched jobs.

## 9. Stopping and Restarting

To stop the services:

```bash
docker compose down
```

To restart them:

```bash
docker compose up -d
```

Your Job Hunter AI will now run autonomously, scraping and matching jobs three times a week, and notifying you of relevant opportunities!

## 10. Monitoring and Troubleshooting

### 10.1 Monitoring Your Services

Monitoring is essential to ensure your Job Hunter is running smoothly. Here are the primary ways to check on your services:

*   **Docker Container Status:** Check if your containers are running and see their resource usage:
    ```bash
    docker ps -a
    docker stats
    ```
*   **Application Logs:** View the real-time logs for the NestJS API to see scraping and matching activity:
    ```bash
    docker logs -f job-hunter-api
    ```
*   **Database Logs:** If you suspect database issues, check the Postgres logs:
    ```bash
    docker logs -f job-hunter-postgres
    ```
*   **Health Checks:** The `postgres` service in `docker-compose.yml` includes a health check. You can see its status in the `STATUS` column of `docker ps`.

### 10.2 Common Deployment Issues and Fixes

| Issue | Potential Cause | Fix |
| :--- | :--- | :--- |
| **Containers won't start** | Port conflict (3000, 5432, or 5050 already in use) | Change the host port in `docker-compose.yml`. |
| **API cannot connect to Database** | Incorrect `DATABASE_URL` in `.env` | Ensure the hostname is `postgres` and credentials match. |
| **Prisma migration fails** | Database not ready or schema mismatch | Wait for the database to be healthy or run `prisma migrate reset`. |
| **Scraper returns 0 jobs** | API endpoint changes or network issues | Check `docker logs -f job-hunter-api` for specific error messages. |
| **No Discord notifications** | Incorrect Webhook URL or network restriction | Verify the URL in `.env` and ensure your VM has internet access. |
| **AI Matching is skipped** | Missing or invalid `OPENAI_API_KEY` | Check your `.env` file and OpenAI account balance. |

### 10.3 Troubleshooting Commands

*   **Restart all services:** `docker compose restart`
*   **Rebuild and restart:** `docker compose up --build -d`
*   **Remove all data and start fresh:** `docker compose down -v` (Warning: This deletes your database data!)
*   **Check network connectivity:** `docker exec -it job-hunter-api ping google.com`

## 11. Adding Your CV to the System

The AI Matching Service is now capable of performing a deep analysis using your full CV text. Since the system processes plain text, you need to extract the text from your PDF or Word document and update your profile.

### 11.1 Extracting Text from Your CV

*   **From PDF:** Open your PDF CV, select all text (`Ctrl+A` or `Cmd+A`), copy it, and paste it into a plain text editor (like Notepad or TextEdit) to clean up any formatting.
*   **From Word (.docx):** Similarly, copy all text from your Word document and paste it into a plain text editor.

### 11.2 Updating Your Profile with CV Text

Once you have your CV as plain text, you can update your profile using the following `curl` command (or an API client like Postman):

```bash
curl -X PUT http://localhost:3000/api/users/<YOUR_USER_ID>/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["NestJS", "TypeScript", "PostgreSQL", "Prisma"],
    "locations": ["Oulu", "Helsinki", "Vantaa", "Espoo"],
    "cvText": "PASTE_YOUR_FULL_CV_TEXT_HERE",
    "minSalary": 4000,
    "remoteOnly": false,
    "seniorityLevel": "Junior/Mid"
  }'
```

**Note:** When pasting your CV text into the JSON body, ensure you escape any double quotes (`"`) with a backslash (`\"`) and replace newlines with `\n` if your tool doesn't handle them automatically.

### 11.3 Why Use Plain Text?

Using plain text ensures the highest compatibility with the AI model and avoids the complexity and potential errors of parsing binary file formats (PDF/Word) within the application. This approach gives you full control over exactly what information the AI sees.
