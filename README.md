# MCDM Decision Calculator

A React/Next.js web application for multi-criteria decision making (MCDM), designed as an **educational tool** to teach employers and HR practitioners how to apply structured, quantitative decision-making methods to the candidate selection process. The tool supports five MCDM methods — AHP, Fuzzy AHP, TOPSIS, Fuzzy TOPSIS, and Hybrid Fuzzy AHP-TOPSIS — and accompanies a teaching case study that demonstrates each method on a real-world interview selection dataset. Users can define their own evaluation criteria and candidates, perform step-by-step calculations, and compare results across methods to understand how different modeling assumptions affect hiring decisions.

**Live Demo**: https://ahp-calculator-puce.vercel.app/

**GitHub**: https://github.com/KhoiNguyenVGU/ahp_calculator

## Supported Methods

| Method | Description |
|--------|-------------|
| **AHP** | Analytic Hierarchy Process — pairwise comparisons with Saaty scale, consistency check (CR) |
| **Fuzzy AHP** | AHP extended with Triangular Fuzzy Numbers (TFNs) for linguistic judgments; uses Chang's extent analysis |
| **TOPSIS** | Technique for Order of Preference by Similarity to Ideal Solution — requires explicit weights and a performance matrix |
| **Fuzzy TOPSIS** | TOPSIS with TFN-based linguistic ratings and weights; handles benefit/cost criteria |
| **Hybrid Fuzzy AHP-TOPSIS** | Derives criteria weights via Fuzzy AHP, then ranks alternatives via Fuzzy TOPSIS |

## Features

- **Five MCDM methods** selectable via tabs
- **Step-by-step guided workflow** with a progress indicator for each method
- **Pairwise comparison matrices** (AHP, Fuzzy AHP, and Hybrid) using the Saaty scale
- **Triangular Fuzzy Number (TFN) support** across Fuzzy AHP, Fuzzy TOPSIS, and Hybrid
- **Benefit / cost criteria** classification in TOPSIS and Fuzzy TOPSIS
- **Consistency Ratio (CR)** calculation and validation for AHP-based methods (CR < 0.10)
- **Ranked results** with scores, weights, closeness coefficients, and composition tables
- **Export results** to file (via `exportResults.ts`)
- **Interview dataset integration** — includes a preprocessed Kaggle interview selection dataset (`public/interview-data-processed.csv`) and a Python preprocessing notebook (`processing.ipynb`)

## Project Structure

```
ahp-calculator/
├── src/
│   ├── app/                        # Next.js app router (page.tsx, layout.tsx, globals.css)
│   ├── components/
│   │   ├── StepIndicator.tsx       # Shared multi-step progress bar
│   │   ├── ahp/                    # AHP components
│   │   ├── fuzzyahp/               # Fuzzy AHP components
│   │   ├── topsis/                 # TOPSIS components
│   │   ├── fuzzytopsis/            # Fuzzy TOPSIS components
│   │   └── hybrid/                 # Hybrid Fuzzy AHP-TOPSIS components
│   └── utils/
│       ├── ahp.ts                  # AHP calculation logic
│       ├── fahp.ts                 # Fuzzy AHP calculation logic
│       ├── topsis.ts               # TOPSIS calculation logic
│       ├── fuzzyTopsis.ts          # Fuzzy TOPSIS calculation logic
│       ├── hybridFuzzyATPTopsis.ts # Hybrid Fuzzy AHP-TOPSIS logic
│       └── exportResults.ts        # Export helper
└── public/
    ├── sample-interview-data.csv     # Sample data file
    ├── Data - Base.csv               # Original Kaggle dataset (21,256 rows, 52 columns)
    └── interview-data-processed.csv  # Preprocessed interview selection dataset
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
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
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com) and deploy automatically

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Authors

1. Dat Nguyen Tran Quoc (10422017@student.vgu.edu.vn)
2. Minh Giap Nguyen (10422024@student.vgu.edu.vn)
3. Khoi Nguyen Nguyen (10422058@student.vgu.edu.vn)

## License

This project only serves for education purposes and belongs to the property of the Vietnamese-German University (VGU)
