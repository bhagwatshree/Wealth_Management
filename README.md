# Wealth Management Platform

A full-stack wealth management application built with **React/Vite** (client) and **Express/Node.js** (server). The platform provides three role-based portals — Customer, Fund Manager, and Service Provider — with TMF Open API integration and Apache Fineract as the core banking backend.

## Architecture

```
┌─────────────────────┐       ┌─────────────────────────────────────┐
│   React Client      │       │         Express Server              │
│   (Vite, MUI)       │       │                                     │
│   Port 5173 HTTPS   │──────▶│   Port 4000 HTTPS                   │
│                     │ /api  │                                     │
│  ┌───────────────┐  │       │  ┌────────────┐  ┌──────────────┐  │
│  │ Customer      │  │       │  │ Fineract   │  │ Orchestration│  │
│  │ Portal        │  │       │  │ Proxy (16  │  │ Layer (DxL)  │  │
│  ├───────────────┤  │       │  │ routes)    │  │ KYC/CRM/CVM  │  │
│  │ Fund Manager  │  │       │  ├────────────┤  ├──────────────┤  │
│  │ Portal        │  │       │  │ Offers     │  │ TMF Open API │  │
│  ├───────────────┤  │       │  │ Engine     │  │ 620/629/632  │  │
│  │ Service       │  │       │  │ NAV/Batch  │  │ 681/688      │  │
│  │ Provider      │  │       │  ├────────────┤  ├──────────────┤  │
│  └───────────────┘  │       │  │ Event Bus  │  │ Workflows    │  │
└─────────────────────┘       │  └────────────┘  └──────────────┘  │
                              │                         │           │
                              └─────────────────────────┼───────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │ Apache Fineract  │
                                              │ Port 8443 HTTPS  │
                                              └──────────────────┘
```

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 18, Vite 5, Material UI 5, React Router 6, Axios |
| Backend  | Node.js, Express 4, Helmet, Morgan, node-cron           |
| Testing  | Vitest, React Testing Library, jsdom                    |
| Backend  | Apache Fineract (external)                              |
| APIs     | TMF Open APIs (620, 629, 632, 681, 688)                 |

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Apache Fineract** instance (default: `https://localhost:8443`)
- **OpenSSL** (to generate self-signed certificates for development)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/bhagwatshree/Wealth_Management.git
cd Wealth_Management
```

### 2. Generate self-signed SSL certificates

Both the client and server run over HTTPS. Generate development certificates:

```bash
mkdir certs
openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### 3. Configure environment variables

Create the server `.env` file:

```bash
cp server/.env.example server/.env
```

Or create `server/.env` manually (see [Environment Variables](#environment-variables) below).

### 4. Install dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 5. Start development servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Client**: https://localhost:5173
- **Server**: https://localhost:4000

> Your browser may warn about the self-signed certificate. Accept the warning to proceed.

## Environment Variables

Create a `server/.env` file with the following variables:

| Variable             | Default                                                | Description                          |
| -------------------- | ------------------------------------------------------ | ------------------------------------ |
| `PORT`               | `4000`                                                 | Server HTTPS port                    |
| `FINERACT_BASE_URL`  | `https://localhost:8443/fineract-provider/api/v1`      | Fineract API base URL                |
| `FINERACT_USERNAME`  | `mifos`                                                | Fineract username                    |
| `FINERACT_PASSWORD`  | `password`                                             | Fineract password                    |
| `FINERACT_TENANT_ID` | `default`                                              | Fineract tenant ID                   |
| `CORS_ORIGIN`        | `https://localhost:5173`                               | Allowed CORS origin                  |
| `SSL_KEY`            | `../certs/key.pem`                                     | Path to SSL private key              |
| `SSL_CERT`           | `../certs/cert.pem`                                    | Path to SSL certificate              |
| `DXL_AUTO_VERIFY_KYC`| `false`                                                | Auto-verify KYC (optional)           |
| `NAV_UPDATE_CRON`    | `0 18 * * 1-5`                                         | NAV update schedule (optional)       |
| `SFTP_DEFAULT_PORT`  | `22`                                                   | SFTP port for file ingestion         |
| `SFTP_TIMEOUT`       | `30000`                                                | SFTP connection timeout (ms)         |
| `BATCH_DATA_DIR`     | `../data`                                              | Batch processing data directory      |

### Example `.env`

```env
PORT=4000
FINERACT_BASE_URL=https://localhost:8443/fineract-provider/api/v1
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=password
FINERACT_TENANT_ID=default
CORS_ORIGIN=https://localhost:5173
SSL_KEY=../certs/key.pem
SSL_CERT=../certs/cert.pem
```

## Available Scripts

### Root

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start both client and server concurrently|
| `npm run dev:server` | Start only the backend server            |
| `npm run dev:client` | Start only the React frontend            |

### Client (`cd client`)

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start Vite dev server (HTTPS) |
| `npm run build`      | Build for production          |
| `npm run preview`    | Preview production build      |
| `npm run test`       | Run tests once                |
| `npm run test:watch` | Run tests in watch mode       |

### Server (`cd server`)

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start with nodemon (auto-reload)   |
| `npm start`          | Start for production               |
| `npm run test`       | Run tests once                     |
| `npm run test:watch` | Run tests in watch mode            |

## Project Structure

```
Wealth_Management/
├── package.json                          # Root scripts (concurrently)
├── .gitignore
├── certs/                                # SSL certificates (not in repo)
│   ├── cert.pem
│   └── key.pem
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js                    # HTTPS, proxy to :4000
│   ├── vitest.config.js
│   └── src/
│       ├── main.jsx                      # App entry point
│       ├── App.jsx                       # Router setup
│       ├── theme.js                      # MUI theme
│       ├── api/                          # API client modules
│       │   ├── axiosInstance.js
│       │   ├── customerApi.js
│       │   ├── fundManagerApi.js
│       │   ├── offersApi.js
│       │   ├── orchestrationApi.js
│       │   ├── serviceProviderApi.js
│       │   └── tmfApi.js
│       ├── components/                   # Shared UI components
│       ├── hooks/                        # Custom React hooks
│       ├── portals/
│       │   ├── customer/                 # Customer portal pages
│       │   ├── fundManager/             # Fund manager portal pages
│       │   └── serviceProvider/         # Service provider portal pages
│       ├── utils/                        # Formatters, constants, helpers
│       └── __tests__/                    # Client unit tests
└── server/
    ├── package.json
    ├── .env                              # Environment config (not in repo)
    ├── vitest.config.js
    └── src/
        ├── index.js                      # HTTPS server entry point
        ├── config/
        │   ├── env.js                    # Environment variable loader
        │   ├── errorConfig.js            # YAML error config with hot-reload
        │   └── errors.yml                # Error message definitions
        ├── middleware/
        │   └── errorHandler.js           # PII-stripping error handler
        ├── services/
        │   └── fineractClient.js         # Axios client for Fineract
        ├── routes/                       # 16 Fineract proxy routes
        ├── orchestration/                # DxL orchestration layer
        │   ├── routes/                   # KYC, onboarding, CRM, screening, workflows
        │   ├── services/                 # Business logic services
        │   ├── store/                    # In-memory data stores
        │   └── workflows/               # Onboarding & campaign workflows
        ├── offers/                       # Offer management engine
        │   ├── routes/                   # Product catalog, NAV, batch
        │   ├── services/                 # NAV, SFTP, batch scheduler
        │   ├── parsers/                  # File parsers (NAV, holdings)
        │   └── store/                    # Product & NAV stores
        ├── integration/tmf/              # TMF Open API implementation
        │   ├── common/                   # TMF envelope, errors, validator
        │   └── routes/                   # TMF 620/629/632/681/688
        ├── events/                       # Event bus system
        ├── data/                         # Sample/seed data (JSON)
        └── tests/                        # Server unit tests

```

## API Endpoints

### Health Check
- `GET /api/health` — Returns `{ "status": "UP" }`

### Fineract Proxy Routes (`/api/...`)
Offices, Staff, Clients, Loan Products, Savings Products, Charges, Funds, GL Accounts, Journal Entries, GL Closures, Accounting Rules, Currencies, Payment Types, Reports, Audits, Financial Activity Accounts

### Orchestration Layer (`/api/dxl/...`)
| Route               | Description              |
| ------------------- | ------------------------ |
| `/api/dxl/kyc`      | KYC management           |
| `/api/dxl/onboard`  | Customer onboarding      |
| `/api/dxl/screening`| Screening services       |
| `/api/dxl/crm`      | CRM integration          |
| `/api/dxl/cvm`      | Customer value management|
| `/api/dxl/workflows`| Workflow engine          |

### Offers Engine (`/api/offers/...`)
| Route                  | Description             |
| ---------------------- | ----------------------- |
| `/api/offers/products` | Product catalog         |
| `/api/offers/nav`      | NAV management          |
| `/api/offers/batch`    | Batch processing        |

### TMF Open APIs (`/api/tmf/...`)
| Route              | TMF Standard                |
| ------------------ | --------------------------- |
| `/api/tmf/tmf620`  | Product Catalog Management  |
| `/api/tmf/tmf629`  | Customer Management         |
| `/api/tmf/tmf632`  | Party Management            |
| `/api/tmf/tmf681`  | Communication Management    |
| `/api/tmf/tmf688`  | Event Management            |

## Running Tests

```bash
# Run all tests (client + server)
cd client && npm test && cd ../server && npm test

# Client tests with watch mode
cd client && npm run test:watch

# Server tests with watch mode
cd server && npm run test:watch
```

## Security Features

- **HTTPS-only** communication (client and server)
- **Helmet.js** for HTTP security headers
- **CORS** with configurable allowed origins
- **PII stripping** in error responses (emails, card numbers, SSN, Aadhaar, PAN, phone numbers)
- **Error ID tracking** for support and debugging
- **SQL/DB error sanitization** before reaching the client

## License

This project is proprietary. All rights reserved.
