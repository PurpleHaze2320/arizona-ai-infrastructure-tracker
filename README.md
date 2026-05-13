# Arizona AI Infrastructure Tracker

A neutral OSINT-style dashboard for tracking Arizona data center growth, AI infrastructure, power demand, water planning, zoning activity, economic upside, community response, and public transparency.

![Status](https://img.shields.io/badge/status-prototype-orange)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-cyan)
![Focus](https://img.shields.io/badge/focus-Arizona%20AI%20Infrastructure-blue)

## Purpose

This project does **not** argue for or against data centers.

It turns public information into a balanced dashboard so professionals, residents, policymakers, job seekers, and infrastructure watchers can see visible tradeoffs:

- Where projects are being proposed or approved
- What stage they are in
- How power demand and grid planning are being discussed
- What water/cooling information is public
- What economic benefits are being claimed
- What concerns communities are raising
- How transparent the public record appears

## Features

- Interactive Arizona command-center map
- Project cards with neutral scoring
- Separate scores for power, water, economic upside, community sensitivity, infrastructure readiness, transparency, and policy momentum
- No single “good/bad” score
- Search and filters
- Source links for every record
- Confidence/source-grade badges
- Export filtered dataset as JSON or CSV
- LinkedIn-ready summary panel
- Built-in methodology and constraints section
- GitHub Pages workflow included

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

The repo includes `.github/workflows/deploy.yml` and `vite.config.js` with this base path:

```js
base: "/arizona-ai-infrastructure-tracker/"
```

If you rename the GitHub repo, update the `base` value in `vite.config.js`.

## Data files

- `src/data/projects.json`
- `src/data/signals.json`
- `src/data/weights.json`

## Scoring philosophy

The tracker avoids labels like “good” or “bad.” It uses separate dimensions:

- Infrastructure Readiness
- Power Demand Complexity
- Water Planning Strength
- Economic Upside
- Community Sensitivity
- Public Transparency
- Policy Momentum

Higher scores do not always mean better or worse. Each score is labeled by what it measures.

## Constraints

- No unsourced claims
- No political labels
- No investment advice
- No guessing exact water or power use unless sourced
- Separate developer claims from community concerns
- Separate public concerns from verified engineering facts
- Show source grade and last updated date
- Use “reported,” “proposed,” or “estimated” when applicable

## Disclaimer

This dashboard is a public-information tracker. It does not endorse or oppose any project. Scores are designed to summarize planning complexity, public transparency, and visible tradeoffs based on available sources.
