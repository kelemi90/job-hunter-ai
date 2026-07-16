# Technical Architecture & Assessment: Automated Job Market Monitoring

## 1. Project Assessment & Feasibility

Your project idea of an automated job market monitoring system is excellent and highly feasible. As you noted, the difficulty rating of 4/10 for a basic version and 7–8/10 for a polished one is accurate. Since you are already working with NestJS, TypeScript, PostgreSQL, and Prisma, you have a solid foundation for building a robust backend system capable of scheduling tasks, processing data, and delivering notifications.

This project not only solves a real-world problem—saving you time and effort in job hunting—but also serves as a strong portfolio piece demonstrating skills in backend architecture, API integration, scheduled jobs, and data processing.

## 2. Recommended Architecture

Based on your technology stack and the requirements of the project, here is the recommended architecture:

### Backend (NestJS + TypeScript)
NestJS is perfectly suited for this due to its modular architecture and built-in support for task scheduling (via `@nestjs/schedule`). You can structure the application into distinct modules:
- **Scraper/Collector Module:** Responsible for fetching data from the job boards.
- **Matcher/Scorer Module:** Implements the scoring logic against your CV preferences.
- **Notification Module:** Handles sending alerts via email, Telegram, or Discord.
- **Database Module:** Manages connections and queries using Prisma.

### Database (PostgreSQL + Prisma)
Prisma provides a type-safe ORM that integrates seamlessly with NestJS. Your schema should include models for:
- **User/Preferences:** Storing skills, locations, salary expectations, etc.
- **Job Posting:** Storing fetched jobs with unique identifiers to avoid duplicates.
- **Match Score:** Recording the score and reasoning for each job against a profile.

### Scheduling (Cron Jobs)
Use NestJS's `@Cron()` decorator to schedule the collectors to run three times a week (e.g., `0 8 * * 1,3,5` for Mon, Wed, Fri at 08:00).

## 3. Data Sources & Integration Strategies

You mentioned focusing on Duunitori.fi, Jobly.fi, and Työmarkkinatori.fi for the Helsinki, Espoo, Vantaa, and Oulu regions. Here is the technical breakdown for integrating with these platforms:

### Duunitori.fi
Duunitori has a public, undocumented JSON API used by their frontend. 
- **Endpoint:** `https://duunitori.fi/api/v1/jobentries`
- **Parameters:** `search=developer`, `alue=oulu`, `alue=helsinki`, `format=json`
- **Integration:** You can query this API directly. It returns structured JSON data including job titles, company names, locations, and descriptions. This is the most reliable method and avoids the complexities and terms-of-service issues of HTML scraping.

### Työmarkkinatori.fi
Työmarkkinatori offers official APIs for job postings [1].
- **Integration:** They provide a Retrieval API (`Noutorajapinta`) that allows external services to fetch job postings. Access requires an API key, which involves submitting an activation form to the KEHA Centre [1]. The API uses a RESTful structure and returns data in Newline-delimited JSON (NDjson) format.

### Jobly.fi
Jobly.fi (formerly Monster.fi) is part of Alma Media.
- **Integration:** While they offer an API for *importing* job ads [2], a public retrieval API for job seekers is not explicitly documented. You may need to explore RSS feeds if available, or carefully evaluate web scraping options while strictly adhering to their Terms of Service regarding automated data extraction.

## 4. Implementation Steps

1.  **Initialize the Project:** Set up the NestJS project with Prisma and PostgreSQL. Define your initial database schema for Jobs and Preferences.
2.  **Build Collectors:** Start with Duunitori, as its JSON API is readily accessible. Implement the HTTP requests to fetch jobs based on your location and keyword filters.
3.  **Implement the Matching Logic:** Create the scoring system. Begin with the deterministic keyword-based approach (+10 for NestJS, +5 for PostgreSQL, etc.). Ensure you filter out jobs already saved in the database.
4.  **Set up Notifications:** Integrate a simple notification system, such as a Telegram bot or Discord webhook, to send the summaries of high-scoring jobs.
5.  **Schedule the Tasks:** Use NestJS scheduling to automate the execution of the collectors and matchers.
6.  **Iterate and Enhance:** Once the basic system is running, explore integrating an AI model (like OpenAI's API) to generate detailed match explanations, as you suggested. You can also begin the process of requesting API access for Työmarkkinatori.

## References

[1] Job Market Finland. "Interfaces for job postings". Available: https://tyomarkkinatori.fi/en/instructions-and-support/interfaces/interfaces-for-job-postings
[2] Alma Career. "Importing job ads to Finnish job boards". Available: https://integrations.almacareer.com/job-boards/finland-job-ads-import-api/
