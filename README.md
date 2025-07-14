# TypeScript Subscriptions Tracker

A modern subscription management application built with Next.js 15, TypeScript, and Tailwind CSS. Track your recurring subscriptions, manage payments, and export your data with ease.

## Features

- **Subscription Management**: Add, edit, and delete subscription services
- **Multi-Currency Support**: Track subscriptions in USD, EUR, GBP, CAD, and SAR with automatic conversion
- **Smart Sorting**: Sort by next payment date, service name, or amount
- **Label System**: Organize subscriptions with custom labels and filtering
- **Auto-Renewal Tracking**: Toggle automatic renewal for each subscription
- **Data Export**: Export your subscription data as JSON or Excel (XLSX) files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Offline Storage**: Uses IndexedDB for local data persistence

## Import & Export Functionality

The application provides comprehensive data import and export options:

### JSON Import
- Import subscription data from JSON files
- **Duplicate Detection**: Automatically detects and skips existing subscriptions based on ID matching
- **Validation**: Validates imported data structure and required fields
- **Detailed Results**: Shows import statistics (imported, skipped, errors)
- **Error Handling**: Reports specific validation errors and failed imports
- **Safe Operation**: Only adds new subscriptions, never overwrites existing data

### JSON Export
- Complete subscription data in JSON format
- Includes all fields: service details, payment info, labels, comments, and timestamps
- Filtered exports available when using label filters
- Automatic filename generation with date stamps

### Excel Export
- Structured spreadsheet with readable column headers
- Currency conversion to SAR for easy comparison
- Optimized column widths for better readability
- Includes creation and update timestamps
- Filtered exports maintain label context in filenames

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI with Radix primitives
- **Database**: IndexedDB (client-side storage)
- **Export**: XLSX library for Excel export functionality
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Shadcn/UI components
│   └── ...             # Application components
├── lib/                # Utility functions
│   ├── db.ts           # IndexedDB wrapper
│   ├── currency.ts     # Currency conversion utilities
│   ├── export-utils.ts # Data export functionality
│   └── ...
└── types/              # TypeScript type definitions
```

## Usage

1. **Add Subscriptions**: Click "Add Subscription" to create new subscription entries
2. **Import Data**: Use the Export dropdown to import subscriptions from JSON files
3. **Manage Data**: Edit or delete existing subscriptions from the list
4. **Filter & Sort**: Use labels to filter and sort options to organize your view
5. **Export Data**: Use the Export dropdown to download your data as JSON or Excel files
6. **Track Payments**: Monitor upcoming payments and auto-renewal status

## Development

This project uses:
- **Package Manager**: pnpm
- **Code Style**: TypeScript strict mode
- **UI Framework**: Tailwind CSS with CSS variables
- **Component Library**: Shadcn/UI

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
