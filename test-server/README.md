# BirdNet Mock API Server

Mock API server for E2E testing the BirdNet app with Maestro.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start server
pnpm start
```

Server runs on **http://localhost:3001**

## Endpoints

- **`GET /health`** - Health check endpoint
- **`POST /analyze?scenario=<scenario>`** - Returns mock bird detections based on scenario

## Available Scenarios

| Scenario        | Description                                          |
| --------------- | ---------------------------------------------------- |
| `success`       | Returns 3 bird detections (default)                  |
| `single_result` | Returns 1 bird detection                             |
| `no_results`    | Returns empty results array                          |
| `error`         | Returns HTTP 500 error response                      |
| `proxy`         | Forwards request to real AWS API (requires env vars) |

## Example Usage

```bash
# Test success scenario
curl -X POST "http://localhost:3001/analyze?scenario=success" \
  -H "Content-Type: application/json" \
  -d '{"audio": [0,0,0]}'

# Test error scenario
curl -X POST "http://localhost:3001/analyze?scenario=error" \
  -H "Content-Type: application/json" \
  -d '{"audio": [0,0,0]}'
```

## Proxy Mode (Real API Testing)

The mock server can act as a proxy to test the real AWS API. It automatically loads credentials from the project's `.env` file:

```bash
# Make sure your .env file has these variables set:
# EXPO_PUBLIC_BIRDNET_API_URL=https://your-api-gateway.amazonaws.com/prod/identify-bird
# EXPO_PUBLIC_BIRDNET_API_KEY=your-api-key-here

# Start server (it will auto-load from .env)
pnpm start

# Server will forward proxy requests to real API
curl -X POST "http://localhost:3001/analyze?scenario=proxy" \
  -H "Content-Type: application/json" \
  -d '{"audio": [0,0,0,...]}'
```

**Use Cases:**

- Test real API integration without changing app code
- Debug API requests/responses
- Verify API Gateway configuration
- E2E testing with Maestro

## Documentation

For complete testing documentation, including:

- How to write E2E tests
- Mock server integration with Maestro
- Adding new test scenarios
- CI/CD setup

See: **[docs/TESTING.md](../docs/TESTING.md)**

## Files

- `mock-api.js` - Express server with mock responses
- `package.json` - Dependencies and scripts
