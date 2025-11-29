# Echo - Cross-Chain Oracle Bridge UI

## Overview

Echo is the frontend interface for the cross-chain oracle bridge system. It provides a web-based dashboard for creating, viewing, and managing oracle bridges that mirror Chainlink price feeds from origin chains to destination chains using Reactive Network.

## Features

- Create new oracle bridges by selecting origin chains and price feeds
- View all deployed bridges in a dashboard grid
- Inspect bridge details including contract addresses
- Fund Reactive contracts and destination callback proxies
- Persistent storage of bridge data in browser localStorage
- Support for multiple origin chains (Base-Sepolia, Binance Smart Chain, Avalanche Fuji, Polygon Amoy)
- Support for multiple price feeds per chain

## Tech Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: State management with localStorage persistence

## Project Structure

```
ui/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── api.ts                     # Backend API client functions
│   ├── types.ts                   # TypeScript type definitions
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles and Tailwind directives
│   ├── components/
│   │   ├── BridgeCard.tsx         # Bridge card display component
│   │   ├── BridgeDetails.tsx     # Bridge details panel component
│   │   └── CreateBridgeModal.tsx  # Create new bridge form component
│   ├── config/
│   │   └── origins.ts             # Origin chain and feed configurations
│   └── hooks/
│       └── useLocalStorage.ts     # LocalStorage state management hook
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tailwind.config.cjs           # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown by Vite).

## Building for Production

Build the application:
```bash
npm run build
```

The production build will be output to the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

## Configuration

### Backend API URL

The frontend connects to the backend API. By default, it uses `http://localhost:3001`. To change this, set the `VITE_API_BASE_URL` environment variable:

```bash
VITE_API_BASE_URL=http://your-api-url:3001 npm run dev
```

### Origin Chains and Feeds

Origin chains and their available price feeds are configured in `src/config/origins.ts`. Each chain entry includes:
- Chain ID
- Chain name
- RPC URL
- List of available Chainlink price feeds with addresses and labels

To add or modify chains, edit this file.

## Usage

### Creating a Bridge

1. Click the "Create New Oracle/Bridge" button in the header
2. Select an origin chain from the dropdown
3. Select a price feed from the filtered dropdown
4. Click "Create"
5. The backend will deploy the necessary contracts and return the bridge information
6. The new bridge will appear in the dashboard

### Viewing Bridge Details

1. Click on any bridge card in the dashboard
2. The details panel will expand below the card showing:
   - Origin feed address (clickable to copy)
   - Destination feed address (clickable to copy)
   - Reactive contract address (clickable to copy)
   - Funding buttons

### Funding Contracts

**Fund Reactive Contract:**
1. Click on a bridge to view details
2. Click the "Fund RC" button
3. This sends ETH to the Reactive contract on Lasna via the system contract

**Fund Destination Callback Proxy:**
1. Click on a bridge to view details
2. Click the "Fund Destination Callback Proxy" button
3. This sends ETH to the callback proxy on the destination chain

## State Management

Bridge data is stored in browser localStorage using the `useLocalStorageState` hook. This ensures:
- Bridges persist across browser sessions
- No backend database required for bridge metadata
- Each bridge includes:
  - Unique ID
  - Origin and destination chain information
  - Contract addresses
  - Feed metadata (decimals, description)
  - Status (deploying, active, error)
  - Creation timestamp

## API Integration

The frontend communicates with the backend via functions defined in `src/api.ts`:

- `createBridge()`: Creates a new bridge by calling `POST /api/bridges`
- `fundReactive()`: Funds a Reactive contract by calling `POST /api/fund/reactive`
- `fundDestination()`: Funds a destination callback proxy by calling `POST /api/fund/destination`

## Styling

The UI uses Tailwind CSS with a custom dark theme:
- Background: Black (`#05060b`)
- Accent color: Neon blue (`#4da3ff`)
- Card borders: Subtle outline with glow effects
- Typography: JetBrains Mono monospace font
- Responsive design with mobile support

Custom styles are defined in `src/index.css` and component-level classes use Tailwind utilities.

## Components

### App.tsx

Main application component that:
- Manages bridge state using localStorage
- Handles bridge creation via API calls
- Renders the header with "Create New Oracle/Bridge" button
- Displays a grid of deployed bridge cards
- Shows bridge details when a bridge is selected

### BridgeCard.tsx

Displays a bridge card showing:
- Price feed description
- Origin chain ID and name
- Destination chain ID
- Clickable to expand/collapse details

### BridgeDetails.tsx

Shows detailed information for a selected bridge:
- Origin feed address (copyable on click)
- Destination feed address (copyable on click)
- Reactive contract address (copyable on click)
- "Fund RC" button with loading and error states
- "Fund Destination Callback Proxy" button with loading and error states

### CreateBridgeModal.tsx

Inline panel for creating new bridges:
- Origin chain selector dropdown
- Price feed selector dropdown (filtered by selected chain)
- Create button that calls the backend API
- Success and error message display
- Loading states during bridge creation

## Linting

Run the linter:
```bash
npm run lint
```

## Browser Support

The application is tested and works on modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

**Blank screen on load:**
- Check that the backend server is running on port 3001
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly if using a custom backend URL

**Bridges not persisting:**
- Check browser localStorage is enabled
- Clear localStorage if data appears corrupted: `localStorage.clear()`

**Styling issues:**
- Ensure Tailwind CSS is properly configured
- Check that `@tailwindcss/postcss` is installed
- Verify `postcss.config.cjs` includes the Tailwind plugin
