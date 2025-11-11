#!/usr/bin/env node

/**
 * Mock BirdNET API Server for E2E Testing
 * Simulates different scenarios based on query parameters or endpoints
 * Can also proxy requests to real API for integration testing
 */

// Load environment variables from project root .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Real API configuration (for proxy mode)
// These must be set via environment variables when using proxy mode
const REAL_API_URL = process.env.EXPO_PUBLIC_BIRDNET_API_URL;
const REAL_API_KEY = process.env.EXPO_PUBLIC_BIRDNET_API_KEY;
console.log('🔧 REAL_API_URL:', REAL_API_URL ? 'Configured' : 'Not Configured');
console.log('🔧 REAL_API_KEY:', REAL_API_KEY ? 'Configured' : 'Not Configured');

// Load payload.json for realistic mock data
let mockPayload = null;
try {
  mockPayload = require('./payload.json');
  console.log('✅ Loaded payload.json with audio data');
} catch (error) {
  console.log('⚠️  Could not load payload.json, using empty audio array');
  mockPayload = { audio: [] };
}

// Enable JSON parsing
app.use(express.json({ limit: '10mb' }));

// CORS Middleware - Allow all origins in development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, req.query);
  next();
});

// Mock responses for different scenarios
const mockResponses = {
  success: {
    success: true,
    processing_time_ms: 234,
    results: [
      {
        species: 'Turdus migratorius',
        commonName: 'American Robin',
        confidence: 0.89,
        timestamp: Date.now(),
      },
      {
        species: 'Cyanocitta cristata',
        commonName: 'Blue Jay',
        confidence: 0.76,
        timestamp: Date.now(),
      },
      {
        species: 'Cardinalis cardinalis',
        commonName: 'Northern Cardinal',
        confidence: 0.62,
        timestamp: Date.now(),
      },
    ],
  },

  single_result: {
    success: true,
    processing_time_ms: 187,
    results: [
      {
        species: 'Turdus migratorius',
        commonName: 'American Robin',
        confidence: 0.89,
        timestamp: Date.now(),
      },
    ],
  },

  no_results: {
    success: true,
    processing_time_ms: 156,
    results: [],
  },

  error: {
    success: false,
    error: 'Service temporarily unavailable',
  },

  // HTTP 401 - Authentication error
  auth_error: {
    success: false,
    error: 'Unauthorized - Invalid API key',
  },

  // HTTP 403 - Forbidden
  forbidden_error: {
    success: false,
    error: 'Forbidden - Access denied',
  },

  // HTTP 429 - Rate limiting
  rate_limit_error: {
    success: false,
    error: 'Too Many Requests',
  },

  // HTTP 500 - Server error
  server_error: {
    success: false,
    error: 'Internal server error occurred',
  },
};

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
  const scenario = req.query.scenario || 'success';

  console.log(`🎭 Mock scenario: ${scenario}`);

  // Handle proxy mode - forward to real API
  if (scenario === 'proxy') {
    if (!REAL_API_URL || !REAL_API_KEY) {
      console.error('❌ Proxy mode requires REAL_API_URL and REAL_API_KEY environment variables');
      return res.status(500).json({
        success: false,
        error:
          'Proxy mode not configured. Set REAL_API_URL and REAL_API_KEY environment variables.',
      });
    }

    console.log(`🔄 Proxying request to real API: ${REAL_API_URL}`);
    console.log(`📢 Using payload.json audio data for proxy mode`);

    // Always use payload.json audio data in proxy mode
    const requestBody = mockPayload;
    console.log(`📦 Request body size: ${JSON.stringify(requestBody).length} bytes`);

    try {
      const fetch = (await import('node-fetch')).default;

      const startTime = Date.now();
      const response = await fetch(REAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': REAL_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      console.log(`✅ Real API responded in ${responseTime}ms with status ${response.status}`);
      console.log(`📥 Response:`, JSON.stringify(data, null, 2));

      return res.status(response.status).json(data);
    } catch (error) {
      console.error('❌ Proxy request failed:', error.message);
      return res.status(500).json({
        success: false,
        error: `Proxy failed: ${error.message}`,
      });
    }
  }

  // Handle mock scenarios
  setTimeout(() => {
    const response = mockResponses[scenario];
    console.log('✅ Mock response prepared:', response);
    if (!response) {
      return res.status(400).json({
        success: false,
        error: `Unknown scenario: ${scenario}`,
      });
    }

    // Return appropriate HTTP status codes for different error scenarios
    if (scenario === 'auth_error') {
      console.log('🔒 Simulating 401 Authentication Error');
      return res.status(401).json(response);
    }

    if (scenario === 'forbidden_error') {
      console.log('🚫 Simulating 403 Forbidden Error');
      return res.status(403).json(response);
    }

    if (scenario === 'rate_limit_error') {
      console.log('⏳ Simulating 429 Rate Limit Error');
      return res.status(429).json(response);
    }

    if (scenario === 'server_error' || scenario === 'error') {
      console.log('🚨 Simulating 500 Server Error');
      return res.status(500).json(response);
    }

    console.log(`✅ Returning ${response.results?.length || 0} results`);
    res.json(response);
  }, 500); // 500ms delay to simulate processing
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Mock BirdNET API is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock BirdNET API server running on http://localhost:${PORT}`);
  console.log(`📋 Available scenarios:`);
  console.log(`   - success: Normal successful response with multiple results`);
  console.log(`   - single_result: Successful response with one result`);
  console.log(`   - no_results: No birds detected`);
  console.log(`   - error / server_error: 500 Server Error`);
  console.log(`   - auth_error: 401 Authentication Error`);
  console.log(`   - forbidden_error: 403 Forbidden Error`);
  console.log(`   - rate_limit_error: 429 Rate Limit Error`);
  console.log(`   - proxy: Forward to real API`);
  console.log(`🔗 Example: POST http://localhost:${PORT}/analyze?scenario=auth_error`);
  if (REAL_API_URL && REAL_API_KEY) {
    console.log(`✅ Proxy mode configured - will forward to: ${REAL_API_URL}`);
  } else {
    console.log(`ℹ️  Proxy mode not configured (set REAL_API_URL and REAL_API_KEY to enable)`);
  }
});
