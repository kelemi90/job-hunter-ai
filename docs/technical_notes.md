# Job Hunter AI Technical Research Notes

## Duunitori.fi API
- **Endpoint:** `https://duunitori.fi/api/v1/jobentries`
- **Parameters:** `search`, `alue` (multiple), `format=json`, `search_also_descr=1`
- **Data Structure:** Returns `count`, `next`, `previous`, and `results` array.
- **Job Details:** Each result contains `heading`, `company_name`, `municipality_name`, `descr`, `slug`, `date_posted`.
- **Slug to URL:** `https://duunitori.fi/tyopaikat/tyo/${slug}`

## Työmarkkinatori.fi API
- **Official API (P67):** Requires registration with KEHA Centre.
- **Production Endpoint:** `https://api.ahtp.fi/kipa/p67/v2/jobpostings`
- **Internal/Public Search:** Uses a different mechanism but accessible via public vacancies page.
- **Codesets:** Uses ESCO for occupations and skills.

## Jobly.fi (Alma Media)
- **Status:** Formerly Monster.fi.
- **Integration:** RSS feeds are common for Alma Career sites.
- **Terms:** Scraping is restricted; use official feeds where possible.

## Project Architecture
- **Framework:** NestJS (Monorepo)
- **Database:** PostgreSQL + Prisma 7
- **Modules:** 
  - `PrismaModule`: Global database access.
  - `ScraperModule`: Contains `DuunitoriService`, `TyomarkkinatoriService`, `JoblyService`.
  - `MatchingModule`: Scoring logic for job matches.
- **Scoring Logic:**
  - Skill Match: +10 (title), +5 (description)
  - Location Match: +10
  - Remote Mention: +5
  - Seniority Mismatch: -10
