# Contributing to Subscription Tracker

We welcome contributions! Please follow these guidelines to ensure a smooth development process.

## Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your fork and submit a pull request

## Code Style Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Ensure components are properly typed
- Use consistent formatting (Prettier configuration)

## Database Changes

When modifying the database schema:

1. Update the database version in `src/lib/db.ts`
2. Add migration logic in the `migrateDatabase()` function
3. Update TypeScript types in `src/types/index.ts`
4. Test migrations with existing data

## Component Guidelines

- Use functional components with hooks
- Implement proper error boundaries
- Follow shadcn/ui patterns for consistency
- Ensure accessibility (ARIA labels, keyboard navigation)
- Optimize for performance (React.memo when needed)

## Testing

- Test all new features manually
- Verify database migrations work correctly
- Test import/export functionality with sample data
- Check responsive design on different screen sizes
- Validate form inputs and error handling

## Pull Request Process

1. Ensure your PR description clearly describes the changes
2. Reference any related issues
3. Include screenshots for UI changes
4. Verify all existing functionality still works
5. Update documentation if needed

## Issue Reporting

When reporting bugs or requesting features:

1. Use clear, descriptive titles
2. Provide steps to reproduce for bugs
3. Include browser/OS information
4. Add screenshots if applicable
5. Specify expected vs actual behavior

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Community Guidelines

- Be respectful and inclusive in all interactions
- Help newcomers get started with the project
- Provide constructive feedback on contributions
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## Getting Help

- Browse existing issues and feature requests on our [UserJot boards](https://subscriptionlister.userjot.com/board/bugs)
- Join discussions on GitHub issues
- Ask questions in pull request reviews
- Check the project documentation and README

Thank you for contributing to Subscription Tracker! 