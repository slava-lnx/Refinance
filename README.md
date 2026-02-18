# GetMyRefinance.com — React + Vite

A mortgage refinance lead-generation marketplace website built with React, React Router, and Vite.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── main.jsx                 # Entry point (BrowserRouter setup)
├── App.jsx                  # Routes & layout
├── styles.css               # Global stylesheet
├── components/
│   ├── Header.jsx           # Navigation bar (sticky, responsive)
│   ├── Footer.jsx           # Full & minimal footer variants
│   ├── ScrollToTop.jsx      # Resets scroll on route change
│   ├── CTABanner.jsx        # Reusable call-to-action section
│   └── PageHero.jsx         # Reusable page header banner
├── pages/
│   ├── Home.jsx             # Homepage (hero, trust, steps, values, loans, testimonials, calc)
│   ├── Funnel.jsx           # 7-step lead capture quiz
│   ├── Calculator.jsx       # Refinance savings calculator
│   ├── Refinance.jsx        # Refinance info + how it works
│   ├── Loans.jsx            # Loan type comparison cards
│   ├── Learn.jsx            # Learning center / article index
│   └── About.jsx            # Company story, values, contact
└── context/
    └── FunnelContext.jsx     # Funnel state management (optional)
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with hero form |
| `/get-started` | Funnel | Multi-step lead capture (own layout) |
| `/calculator` | Calculator | Refinance calculator with live results |
| `/refinance` | Refinance | Refinance education + process steps |
| `/loans` | Loans | Loan type comparison |
| `/learn` | Learn | Article index |
| `/about` | About | Company info & contact |

## Lead Funnel Integration

The funnel (`src/pages/Funnel.jsx`) collects data in React state. Connect to your backend in the `handleSubmit` function.

## Build for Production

```bash
npm run build
```

For SPA routing in production, configure your server to serve `index.html` for all routes.

## Customization Checklist

- [ ] Replace `[Your Company Name, LLC]` in Footer.jsx
- [ ] Replace NMLS `#[XXXXXX]` with your actual ID
- [ ] Update contact info in About.jsx
- [ ] Replace placeholder testimonials in Home.jsx
- [ ] Create actual article pages for Learn section
- [ ] Replace emoji placeholders with real images
- [ ] Add analytics (e.g., `react-ga4`)
- [ ] Connect Funnel.jsx to your CRM/backend
- [ ] Legal review of all disclosures
