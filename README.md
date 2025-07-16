# Subscription Tracker

A modern web application for tracking and managing your subscriptions built with Next.js 15, TypeScript, and shadcn/ui.

## Features

- **Dashboard Overview**: View all subscriptions with payment calendar and statistics
- **Subscription Management**: Add, edit, and delete subscriptions with detailed information
- **Label System**: Organize subscriptions with custom labels for easy filtering
- **Payment Calendar**: Visual calendar showing upcoming payment dates with hover tooltips
- **Import/Export**: Support for CSV, JSON, and Excel formats
- **Local Storage**: SQLite database for offline-first data management
- **Dark/Light Theme**: Toggle between themes with system preference detection

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite (via sql.js)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ts_subscriptions_tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── [feature].tsx     # Feature components
├── lib/                  # Utility functions
│   ├── db.ts            # Database operations
│   ├── export-utils.ts  # Export functionality
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
```

## Database Schema

### Subscriptions Table
- `id`: Primary key
- `name`: Service name
- `cost`: Monthly cost
- `billing_cycle`: Payment frequency
- `next_payment`: Next payment date
- `category`: Service category
- `website_url`: Service website
- `labels`: JSON array of labels
- `notes`: Additional notes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on:

- Development setup and workflow
- Code style guidelines  
- Database change procedures
- Component development standards
- Testing requirements
- Pull request process
- Issue reporting guidelines

## License

This project is open source and available under the [MIT License](LICENSE).

## Community & Support

### Project Links

- **GitHub Repository**: [https://github.com/mo9a7i/ts_subscriptions_tracker](https://github.com/mo9a7i/ts_subscriptions_tracker)
- **Project Page**: [https://mo9a7i.github.io/ts_subscriptions_tracker/](https://mo9a7i.github.io/ts_subscriptions_tracker/)

### Feedback & Bug Reports

We use UserJot for community feedback and issue tracking:

- **Bug Reports**: [Report bugs and issues](https://subscriptionlister.userjot.com/board/bugs?cursor=1&order=top&limit=10)
- **Feature Requests**: [Request new features](https://subscriptionlister.userjot.com/board/features)

### Getting Help

- Browse existing issues and feature requests on our UserJot boards
- Submit bug reports with detailed reproduction steps
- Vote on features you'd like to see implemented
- For development questions, open an issue on [GitHub](https://github.com/mo9a7i/ts_subscriptions_tracker/issues)
