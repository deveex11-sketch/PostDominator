# Post Dominator – Social Media Scheduler

Post Dominator is a social media scheduling platform that helps agencies, creators, and small businesses plan, automate, and analyze their cross-channel content strategy. From calendar planning to AI-assisted copy tweaks, the app centralizes day-to-day publishing workflows so teams can stay consistent without being online 24/7.

## Why Post Dominator?

- Unified planner for all major platforms (Facebook, Instagram, X, LinkedIn, TikTok, YouTube Shorts)
- Bulk upload and queue management to keep campaigns organized
- AI content suggestions and hashtag recommendations to accelerate ideation
- Approval workflows to keep managers, clients, and contributors aligned
- Post-performance analytics with actionable insights on reach, engagement, and audience growth
- Collaboration tools (mentions, notes, campaign timelines) that reduce context switching

## Core Features

- **Content Calendar** – Drag-and-drop scheduler with platform-specific previews and timezone-aware targeting.
- **Smart Queue** – Automatically fills posting gaps based on configured cadence and best-time recommendations.
- **Asset Library** – Central repository for brand-safe media with tagging, search, and usage tracking.
- **Automation Recipes** – Rules that can auto-publish evergreen content, recycle top performers, or notify stakeholders.
- **Analytics Hub** – Cross-network dashboards and exportable reports covering KPIs, conversion funnels, and audience segments.
- **Integrations** – Native connectors for cloud storage, CMS systems, URL shorteners, and CRM tools.

## Architecture Overview

| Layer | Tech |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, Shadcn UI |
| API | Next.js Route Handlers with tRPC-style contracts |
| Data | PostgreSQL (primary), Redis (caching and job queues) |
| Auth | OAuth for social platforms, NextAuth for workspace login |
| Background Jobs | BullMQ workers handling publishing, analytics sync, and notification delivery |

The project follows a feature-colocation structure to keep related UI, hooks, handlers, and utilities bundled per domain area. Shared primitives live in `src/shared`, while platform-specific logic resides in `src/modules/<feature>`.

## Getting Started

1. **Clone**
   ```bash
   git clone https://github.com/your-org/post-dominator.git
   ```
2. **Install**
   ```bash
   npm install
   ```
3. **Configure**
   - Duplicate `.env.example` into `.env.local`.
   - Fill in workspace domain, database credentials, Redis URL, and OAuth secrets for each social network you plan to connect.
4. **Setup Database**
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. **Run**
   ```bash
   npm run dev
   ```
   The app launches at `http://localhost:3000`.

## Key Scripts

```text
npm run dev        # start local dev server
npm run build      # build production bundle
npm run lint       # run ESLint checks
npm run test       # unit/integration tests
npm run db:studio  # open Prisma Studio
```

## Project Roadmap

- Multi-workspace analytics benchmarking
- AI-driven campaign briefs and copy rewriting
- Deeper TikTok and YouTube Shorts automation
- Slack/Teams bot for approval flows
- Mobile companion app (iOS and Android)

## Contributing

1. Create a feature branch from `main`.
2. Make your changes and include tests where applicable.
3. Run `npm run lint` and `npm run test`.
4. Submit a pull request describing the change, testing details, and screenshots if relevant.

Bug reports and feature ideas are always welcome—open an issue or start a discussion if you want to collaborate.

## License

This project is released under the MIT License. See `LICENSE` for details.
