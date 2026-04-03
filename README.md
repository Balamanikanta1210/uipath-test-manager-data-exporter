# UiPath Test Manager Data Exporter

Enterprise-grade UiPath Test Manager data exporter with API authentication, advanced table operations, and hierarchical Excel export.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Balamanikanta1210/uipath-test-manager-data-exporter)

## Overview

A professional enterprise web application for UiPath Test Manager integration that enables users to authenticate with the Test Manager API, fetch test case data with advanced filtering and grouping capabilities, and export selected test cases to Excel format with proper hierarchical data structure. The application features a clean settings interface for API configuration, a robust data table with sorting/filtering/grouping, intelligent scope parsing, and sophisticated Excel export logic that preserves nested test step structures.

## Key Features

- **API Authentication**: Secure OAuth-based authentication with UiPath Test Manager API
- **Configuration Interface**: Clean settings panel with intelligent scope parsing that converts pasted scope strings into visual tags
- **Advanced Data Table**: Robust table with column sorting, filtering, checkbox selection, and dual-view toggle (Standard flat list vs Grouped by Labels)
- **Excel Export**: Sophisticated export functionality that preserves nested test step hierarchy with proper formatting
- **Dual-View Mode**: Toggle between standard flat list and grouped view categorized by test case labels
- **Smart Scope Management**: Hybrid input that automatically parses scope strings and displays them as tags
- **Hierarchical Data Structure**: Proper Excel formatting with multi-line cells for nested test steps including pre-conditions, numbered steps, and post-conditions

## Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router** for navigation

### UI Components & Styling
- **Tailwind CSS 4** for utility-first styling
- **shadcn/ui** component library with Radix UI primitives
- **Lucide React** for icons
- **Framer Motion** for animations

### UiPath Integration
- **@uipath/uipath-typescript** - Official UiPath SDK for API integration

### Data Management
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **ExcelJS** for Excel file generation and export

### Development Tools
- **TypeScript 5.8** for type safety
- **ESLint** for code quality
- **Cloudflare Pages** for deployment

## Prerequisites

- **Bun** runtime (v1.0 or higher)
- **UiPath Test Manager** account with API access
- **OAuth Client Credentials** (Client ID and Client Secret)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd uipath-test-manager-exporter
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

Create a `.env` file in the project root with your UiPath credentials:

```env
VITE_UIPATH_BASE_URL=https://cloud.uipath.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
VITE_UIPATH_REDIRECT_URI=http://localhost:3000
VITE_UIPATH_SCOPE=OR.Execution OR.Execution.Read
```

## Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Development Commands

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint for code quality checks

## Usage

### 1. Configure API Connection

1. Open the configuration sidebar (left panel)
2. Enter your UiPath Test Manager credentials:
   - **URL**: Your UiPath instance URL (cloud or on-premise)
   - **Organization**: Your organization name
   - **Tenant**: Your tenant name
   - **Client ID**: OAuth client ID
   - **Client Secret**: OAuth client secret (hidden input)
   - **Scope**: Required API scopes (supports paste-to-parse)

3. Click **Get Records** to authenticate and fetch test cases

### 2. View and Filter Test Cases

- Use column headers to sort data (ascending/descending)
- Apply column-level filters using text inputs
- Toggle between **Standard View** (flat list) and **Grouped View** (by labels)
- Select specific test cases using checkboxes

### 3. Export to Excel

1. Select test cases using checkboxes (or select all)
2. Click the **Export** button
3. Excel file will be generated with:
   - Dynamic columns (ID, Name, Description, Custom Fields)
   - Properly formatted Test Steps with nested structure
   - Pre-conditions, numbered steps, and post-conditions

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   └── use-theme.ts    # Theme management
├── pages/              # Application pages
│   └── HomePage.tsx    # Main application page
├── lib/                # Utility functions
└── index.css           # Global styles and Tailwind config
```

## Deployment

### Deploy to Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Balamanikanta1210/uipath-test-manager-data-exporter)

#### Manual Deployment

1. Build the project:

```bash
bun run build
```

2. Deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy dist
```

3. Configure environment variables in Cloudflare Pages dashboard:
   - Add all `VITE_*` variables from your `.env` file
   - Update `VITE_UIPATH_REDIRECT_URI` to your production URL

#### Automatic Deployment

Connect your repository to Cloudflare Pages for automatic deployments:

1. Go to Cloudflare Pages dashboard
2. Create a new project
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Add environment variables
6. Deploy

## Security Considerations

- **Client Secret**: Never logged to console or persisted in localStorage
- **Token Management**: Access tokens stored securely in component state
- **CORS**: Ensure Test Manager API allows requests from your domain
- **OAuth Flow**: Uses secure Client Credentials flow for authentication

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Authentication Issues

- Verify OAuth credentials are correct
- Check that redirect URI matches exactly (including protocol and port)
- Ensure required scopes are granted in UiPath

### CORS Errors

- Test Manager API may require CORS proxy or origin whitelisting
- Contact your UiPath administrator to whitelist your domain

### Large Dataset Performance

- Use pagination for datasets with 1000+ test cases
- Consider implementing server-side filtering for very large datasets

### Excel Export Issues

- Test steps with very long descriptions may exceed Excel's 32,767 character limit per cell
- The application will truncate with a warning if needed

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue in the GitHub repository
- Contact UiPath support for API-related questions
- Check UiPath Test Manager documentation for API details

## Acknowledgments

- Built with [UiPath TypeScript SDK](https://www.npmjs.com/package/@uipath/uipath-typescript)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)