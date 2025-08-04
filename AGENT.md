# Yaba: Yet Another Budgeting App - Developer Agent Guide

## Project Overview

**Yaba** is a privacy-focused, tag-based budgeting application built as an
ElectronJS desktop app with an Angular 20 frontend. The core philosophy is
"unplug the ethernet cable and budget" - providing a completely offline,
secure financial management tool that uses tags instead of traditional budget
categories.

## Key Differentiators

- **Tag-based budgeting** instead of rigid categories
- **Complete privacy** - no servers, tracking, or cloud storage required
- **Drag-and-drop CSV imports** from bank downloads
- **Real-time transaction tagging** with immediate persistence
- **Open-source transparency** for financial software trust

## Architecture Overview

### ElectronJS Structure

- **Main Process**: `window/index.ts` - Basic Electron window setup
(1280x768, dev tools enabled)
- **Renderer**: `window/renderer.ts` - Bridges to Angular app
- **Preload**: `window/preload.ts` - Security context isolation
- **Build Config**: `forge.config.ts` - Electron Forge packaging
configuration

**Status**: ⚠️ Electron integration is minimal - only renders Angular app in
window, needs proper IPC, menu system, and native features.

### Angular Application (`~/web/`)

#### Core Module Structure

- **Main Module**: `yaba.module.ts` - Bootstraps the application
- **Routing**: `routing.ts` - Defines 7 main pages
- **Main Component**: `yaba.component.ts` - Simple root component

#### Page Modules

1. **Home** (`pages/home/`) - Landing page (currently minimal).
@FutureFeature: Ability to render dashboards based on charts and graphs created
for a quick high level overview of financial health.
2. **Accounts** (`pages/accounts/`) - Account management and CSV import.
3. **Institutions** (`pages/institutions/`) - Bank/institution setup and CSV
mapping.
4. **Budgeting** (`pages/budgeting/`) - Tag-based budget tracking and
transaction editing.
5. **Charts** (`pages/charts/`) - Data visualization leveraging Google Charts
based on tags assigned by user in the budgeting and account detail pages.
6. **Prospecting** (`pages/prospecting/`) - Financial
planning/projections for future spend.
7. **Settings** (`pages/settings/`) - User preferences and app settings.
8. **Develop** (`pages/develop/`) - Debug/testing tools (only available in the
development build; not available in Production).

## Data Models & Core Concepts

### The Tag-Based System

Instead of fixed budget categories, Yaba uses **flexible tags** that can be
applied to transactions:

- **Income Tags**: Identify revenue sources
- **Expense Tags**: Track spending categories
- **Transfer Tags**: Mark account-to-account movements
- **Hide Tags**: Exclude from budget calculations
- Any number of **custom tags** to help visualize spend and financial health.

### Core Data Structures

#### Transaction (`lib/transactions.ts`)

- `id`: Unique identifier for a specified transaction.
- `accountId`: The related `account.id` to which this transaction belongs.
- `description`: A text based short description of the transaction.
- `datePending`: A date object representing when the authorization was initiated.
- `datePosted`: A date object indicating when the transaction posted/settled to the
account.
- `transactionType`: An enum type indicating if this is a sending or receiving
transaction.
- `amount`: Numeric/Float amount of the transaction.
- `tax`: If this transaction involved taxes or fees, they are indicated here.
- `currency`: An enum representing the currency the `amount` field represents.
(Default: USD)
- `merchant`: Vendor/seller or whom the source/target of the transaction.
- `tags`: List of strings associated with this transaction.

#### Account (`lib/accounts.ts`)

- `id`: Unique identifier for this account.
- `name`: A simple name for this account.
- `description`: A short text description of this account.
- `institutionId`: The related `institution.id` to which this account maps its fields.
- `accountType`: An enum representing the type of account (e.g. checking, savings,
loan, cc, etc)
- `transactions`: A list object containing the set of transactions associated with
this account.

#### Institution (`lib/institutions.ts`)

- `id`: Unique identifier for this institution.
- `name`: The name of the institution.
- `description`: A short description of the institution.
- `mappings`: A mapping list object that contains the CSV mappings for this
institution.

### Collections & Enhanced Arrays

All data models extend enhanced Array classes implementing `YabaPlural<T>`:

- **Transactions extends Array&lt;Transaction&gt;**
- **Accounts extends Array&lt;Account&gt;**
- **Institutions extends Array&lt;Institution&gt;**

Each provides:

- `add()`, `remove()`, `clear()` methods
- `byId()` lookups via `id2name` hash maps
- CSV import/export capabilities
- Filtering and aggregation methods

## Data Persistence Strategy

### Current Implementation

- **Primary Storage**: Browser `localStorage`
- **Services**: `BaseHttpService<T>` pattern with caching
- **Cache Management**: Automatic expiry and refresh logic
- **Import/Export**: JSZip + PapaParse for CSV handling

### Service Layer

- `TransactionsService` - Transaction CRUD operations
- `AccountsService` - Account management
- `InstitutionsService` - Institution setup
- `SessionService` - User session persistence

**Note**: Server endpoints defined but `useServer: false` until ElectronJS
handlers have been properly setup to interface with OS files.

## CSV Import System

### Institution Mapping Engine

The first operation is to create institutions with field mappings to their
respective CSV headings.

Each institution defines field mappings to transform bank CSV exports into
Yaba transactions:

- `fromField`: Bank CSV column name.
- `toField`: Either the target transaction key field name, or a string for the
static value.
- `mapType`: Enum of "static" or "dynamic" @FutureFeature: Enable "function"
to indicate the name of a pre-defined function that will perform a static
operation on the field upon CSV import.

### Import Workflow

The second user operation is to create an account based on the institution only
just created.

1. User drags CSV files onto account page
2. System looks up institution mappings
3. PapaParse processes CSV with configured headers
4. `Transactions.digest()` applies field mappings
5. New transactions added to account
6. Auto-save to localStorage

## Budget Calculation Engine

### Tag Aggregation

The `getBudgets()` method in Transactions:

1. Maps each transaction to `{tag, amount}` pairs
2. Aggregates amounts by tag using reducer
3. Returns sorted list of budget totals

### Filtering System

- `YabaFilters.budgetBy()` - Filter transactions by tag selection
- Date range filtering with `TransactionDeltas` presets
- Account-based filtering
- Real-time filter application with debounced updates

## Component Architecture

### Transaction Filter Controls (`controls/`)

- `account-select` - Account dropdown picker
- `institution-select` - Institution picker
- `tags-filter` - Multi-select tag filtering
- `daterange` - Date range picker
- `dropfile` - Drag-and-drop file directive

### Form Components (`forms/`)

- `account-form` - Account creation/editing
- `institution-form` - Institution setup
- `institution-mapping` - CSV field mapping interface

### Data Tables (`tables/`)

- `budgets`: The components used in the budgets page to render the budget table.
- `transactions`: The main/master transaction display component used wherever
transactions are rendered.
- `txn-stats`: Used in the prospecting page to render transaction summary info.
- `whishlist`: Used in the prospecting page to manage wishlist items.

## Technology Stack

### Frontend (Angular 20)

- **UI Framework**: Angular Material 20.1.4
- **Forms**: Reactive Forms + ng-select
- **CSV Processing**: ngx-papaparse + PapaParse 5.4.1
- **File Handling**: file-saver + JSZip
- **Charts**: angular-google-charts (for visualization)

### Build & Development

- **Build Tool**: Angular CLI + Webpack
- **Electron**: Electron 37.2.5 + Electron Forge 7.8.2
- **Testing**: Karma + Jasmine
- **Linting**: ESLint + TypeScript-ESLint

### Development Commands

- `npm run start` - Launch Electron app with Angular dev server
- `npm run build` - Compile TypeScript + Angular build
- `npm test` - Run unit tests with coverage
- `npm run package` - Create distributable Electron package

## Current TODOs & Improvement Areas

### High Priority

1. **Electron Integration**
   - Implement proper IPC communication
   - Add native menu system
   - File system access for CSV import/export
   - Window state management

2. **Home Page Development**
   - Dashboard with account summaries
   - Quick budget overview
   - Recent transaction feed

3. **Prospecting Module**
   - Legacy AngularJS code needs Angular conversion
   - Financial projection calculations
   - Income vs expense forecasting

### Medium Priority

1. **Enhanced Institution Mappings**
   - Support `function` type mappings (currently TODO)
   - Calculated field-mappings based on other transaction data
   (e.g. derive transaction type based on amount field, calc datePending based on
   datePosted if not provided, auto-tagging based on patterns (and based on user
   opt-in))

2. **Additional Account Types**
   - Investment accounts (401k, IRA, Broker)
   - Cryptocurrency tracking
   - Loan amortization

3. **Testing & Quality**
   - Expand unit test coverage
   - Add integration tests for CSV import
   - E2E testing for complete workflows

### Lower Priority

1. **Style Refactoring**
   - Break out `styles.css` into component-specific styles
   - Implement Angular Material theming
   - Responsive design improvements

2. **Advanced Features**
   - Transaction categorization suggestions
   - Recurring transaction detection
   - Export to tax software formats

## File Organization

```text
yaba/
├── window/           # Electron main process
├── web/
│   ├── app/
│   │   ├── lib/      # Core data models & utilities
│   │   ├── services/ # Data persistence layer
│   │   ├── pages/    # Full page display components
│   │   ├── controls/ # Transaction filtering components
│   │   ├── forms/    # Form components
│   │   ├── tables/   # Data table components
│   │   └── menu/     # Navigation
│   ├── assets/       # Static resources
│   └── styles.css    # Global styles (needs refactoring)
├── tests/            # Test fixtures and data
└── doc/              # Architecture diagrams
```

## Development Guidelines

### Code Quality Standards

- Follow Angular style guide and conventions
- Use TypeScript strict mode with proper typing
- Implement error boundaries and user-friendly error messages
- Maintain separation between developer exceptions and user errors

### Performance Considerations

- Utilize trackBy functions in `@for()` loops
- Prefer control flow syntax
- Implement OnPush change detection where appropriate
- Use Angular signals for reactive state management

### Security Best Practices

- Rely on Angular's built-in XSS protection
- Sanitize any dynamic content
- Validate all user inputs

This application represents a thoughtful approach to personal finance
management with a strong emphasis on privacy, flexibility, and user control.
The tag-based system provides more nuanced budgeting than traditional
category-based approaches, while the offline-first architecture ensures
financial data never leaves the user's device.
