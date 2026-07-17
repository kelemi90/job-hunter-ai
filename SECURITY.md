# Security and Privacy Policy for Job Hunter AI

This document outlines the security and privacy considerations for the Job Hunter AI application, particularly concerning the use of third-party services like OpenAI.

## 1. Data Handling and OpenAI Integration

Your Job Hunter AI application uses OpenAI's API for advanced job description analysis. It's crucial to understand what data is sent to OpenAI and how to mitigate potential privacy risks.

### 1.1 Data Sent to OpenAI
When the `AiMatchingService` analyzes a job posting, the following information is sent to OpenAI:

*   **Job Title:** Publicly available information.
*   **Job Description:** Publicly available information (truncated to 2000 characters to optimize token usage and reduce data exposure).
*   **Candidate Skills:** An array of your specified skills (e.g., `["NestJS", "TypeScript", "PostgreSQL"]`). While these are technical skills, they are personal to your profile.
*   **Candidate Preferences:** A JSON object containing your job preferences (e.g., `minSalary`, `maxSalary`, `remoteOnly`, `seniorityLevel`, `languages`). This information is personal.

### 1.2 OpenAI's Data Usage Policy
By default, OpenAI's API data usage policy states that they **do not use data submitted through their API to train their models** unless explicitly opted-in. However, it's always best practice to confirm this policy directly on their official website and configure your API usage accordingly.

**Recommendation:** Ensure your OpenAI account settings are configured to prevent your API data from being used for model training. This is the primary safeguard against your data being learned by their models.

### 1.3 Data Minimization and Anonymization

*   **Data Minimization:** The application already truncates job descriptions to reduce the amount of data sent. For candidate preferences, ensure that only relevant, non-identifying information is stored and sent.
*   **Anonymization:** Avoid including any Personally Identifiable Information (PII) such as your full name, contact details, or specific company names from your CV directly in the `userSkills` or `preferences` that are sent to OpenAI. Focus on generic skill sets and preferences.

## 2. General Security Best Practices

### 2.1 API Key Management

*   **Environment Variables:** All API keys (e.g., `OPENAI_API_KEY`, `DISCORD_WEBHOOK_URL`) must be stored as environment variables and never hardcoded or committed to version control (e.g., Git).
*   **Access Control:** Restrict access to your `.env` files and environment configurations.

### 2.2 Database Security

*   **Strong Passwords:** Use strong, unique passwords for your PostgreSQL database.
*   **Access Control:** Ensure your database is not publicly exposed. Access should be restricted to your application and necessary administrative tools (like pgAdmin, which should also be secured).
*   **Data Encryption:** Consider encrypting sensitive data at rest in your database if required by your privacy standards.

### 2.3 Application Security

*   **Input Validation:** The NestJS application uses `class-validator` for DTOs, which helps prevent common injection attacks by validating incoming data.
*   **Dependency Management:** Regularly update your project dependencies (`pnpm update`) to patch known vulnerabilities.
*   **Error Handling:** Implement robust error handling to prevent sensitive information from being exposed in error messages.

### 2.4 Docker Security

*   **Least Privilege:** Ensure your Docker containers run with the minimum necessary privileges.
*   **Image Scanning:** Use Docker image scanning tools to identify vulnerabilities in your container images.
*   **Volume Management:** Carefully manage Docker volumes to ensure sensitive data is not inadvertently exposed or lost.

## 3. User Responsibility

As the user of this application, you are responsible for:

*   **Reviewing OpenAI's Policies:** Staying informed about OpenAI's data usage policies and ensuring your account settings align with your privacy expectations.
*   **Managing Preferences:** Being mindful of the information you include in your job preferences and skills, especially regarding any potentially sensitive details.
*   **Securing Your Environment:** Protecting your `.env` file and ensuring your local development or deployment environment is secure.

By following these guidelines, you can significantly reduce the risk of data breaches and ensure the privacy of your job search information.

## 4. Advanced Secret Management

Securing your API keys and database credentials is paramount to preventing unauthorized access and potential data breaches.

### 4.1 Securing the .env File

*   **Restrict Permissions:** Ensure only the user running the Docker containers can read the `.env` file:
    ```bash
    chmod 600 .env
    ```
*   **Never Commit to Git:** Your `.gitignore` file already includes `.env`. Never remove it. If you accidentally commit a secret, rotate it immediately.
*   **Use Strong Passwords:** For your database and pgAdmin, use long, complex, and randomly generated passwords. The `setup_proxmox_docker.sh` script automatically generates these for you.

### 4.2 Docker Secrets (Advanced)

For even higher security, consider using Docker Secrets if you move to a Docker Swarm or Kubernetes environment. This allows you to manage sensitive data without it being stored in the image or environment variables.

### 4.3 API Key Rotation

*   **Regular Rotation:** Periodically rotate your OpenAI and Discord API keys. This limits the window of opportunity if a key is ever compromised.
*   **Minimal Permissions:** If possible, create API keys with the minimum necessary permissions for the task.

### 4.4 Monitoring for Breaches

*   **Log Auditing:** Regularly review your application and database logs for any suspicious activity.
*   **Alerting:** Set up alerts for failed login attempts to your VM or database.
*   **OpenAI Usage Monitoring:** Monitor your OpenAI usage dashboard for any unexpected spikes, which could indicate a compromised API key.

## 5. Free AI Alternatives for Enhanced Privacy and Cost-Effectiveness

While OpenAI offers powerful models, several free-tier APIs and local models can be used for your AI Matching Service, offering different trade-offs in terms of cost, privacy, and performance.

### 5.1 Recommended Free AI Options

| Provider | Model(s) Recommended | Pros | Cons | Use Case | Setup Notes |
| :------- | :------------------- | :--- | :--- | :------- | :---------- |
| **Groq Cloud** | Llama 3.1 (8B, 70B), Mixtral 8x7B | Extremely fast inference, access to powerful open-source models, generous free tier. | Rate limits can be tight for largest models. | Best balance of speed, intelligence, and free limits. | Requires a Groq API key. Update `AiMatchingService` to use Groq API endpoint. |
| **Google Gemini API** | Gemini 1.5 Flash | Very high rate limits for free tier, massive context window (1M+ tokens). | Free tier data *may* be used for model improvement. | Best for processing very long job descriptions or multiple CVs. | Requires a Google Cloud Project and Gemini API key. Update `AiMatchingService` to use Gemini API endpoint. |
| **Ollama (Local LLMs)** | Llama 3.1 8B, Mistral, Phi-3 | 100% private (data never leaves your machine), no rate limits, free forever. | Requires local hardware (GPU/RAM), slower than cloud APIs. | Absolute highest privacy priority. | Install Ollama on your Proxmox VM, download models, and update `AiMatchingService` to call the local Ollama endpoint. |

### 5.2 Integrating Free AI Alternatives

To switch from OpenAI to one of these alternatives, you would typically need to:

1.  **Obtain an API Key:** For Groq or Gemini, sign up on their respective platforms and get an API key.
2.  **Update Environment Variables:** Add the new API key (e.g., `GROQ_API_KEY` or `GEMINI_API_KEY`) to your `.env` file.
3.  **Modify `AiMatchingService`:** Adjust the `AiMatchingService` to use the new API client and endpoint. For example, if using Groq, you would replace the OpenAI client with the Groq client and specify the desired model.
4.  **Adjust Prompting:** Some models may require slight adjustments to the prompt for optimal performance.

By leveraging these free alternatives, you can maintain the powerful AI capabilities of your Job Hunter while managing costs and enhancing privacy according to your preferences.
