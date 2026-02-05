# AHP Decision Calculator

A React/Next.js web application for multi-criteria decision making using the Analytic Hierarchy Process (AHP).

## Features

- **Define Decision Problem**: Set your goal, criteria, and alternatives
- **Pairwise Comparisons**: Compare criteria and alternatives using the Saaty scale (1-9)
- **Automatic Calculations**: Computes weights using geometric mean method
- **Consistency Check**: Validates the consistency of your judgments (CR < 10%)
- **Visual Results**: Clear ranking with percentage scores and composition table

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd ahp-calculator
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## How to Use

1. **Define Your Problem**
   - Enter your decision goal (e.g., "Satisfaction with School")
   - Add criteria (e.g., Learning, Friends, School Life, etc.)
   - Add alternatives (e.g., School A, School B, School C)

2. **Compare Criteria**
   - Use the Saaty scale (1-9) to compare each pair of criteria
   - 1 = Equal importance, 9 = Extreme importance
   - Use fractions (1/3, 1/5, etc.) for inverse comparisons

3. **Compare Alternatives**
   - For each criterion, compare how well alternatives perform
   - Navigate through tabs to complete all comparisons

4. **View Results**
   - See the winning alternative with the highest weighted score
   - Review criteria weights and consistency ratios
   - Analyze the composition table showing detailed scores

## The AHP Method

The Analytic Hierarchy Process (AHP) is a structured technique for organizing and analyzing complex decisions. It was developed by Thomas L. Saaty in the 1970s.

### Saaty Scale

| Value | Meaning |
|-------|---------|
| 1 | Equal importance |
| 3 | Moderate importance |
| 5 | Strong importance |
| 7 | Very strong importance |
| 9 | Extreme importance |
| 2,4,6,8 | Intermediate values |

### Consistency Ratio

- CR < 0.10 (10%): Acceptable consistency
- CR > 0.10: Judgments should be reviewed

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## License

MIT
