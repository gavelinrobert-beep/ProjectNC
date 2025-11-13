/**
 * Test setup configuration for frontend tests.
 * Configures Vitest, React Testing Library, and Mock Service Worker.
 */
import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock API handlers for testing
const handlers = [
  // Health check endpoint
  http.get('/health', () => {
    return HttpResponse.json({ status: 'healthy' });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock successful login
    if (body.email && body.password) {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: body.email,
          name: 'Test User',
          role: 'admin'
        }
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Assets/vehicles endpoints
  http.get('/api/assets', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test Vehicle 1',
        type: 'truck',
        status: 'available',
        latitude: 40.7128,
        longitude: -74.0060,
        fuel_level: 75
      },
      {
        id: 2,
        name: 'Test Vehicle 2',
        type: 'van',
        status: 'in_use',
        latitude: 40.7580,
        longitude: -73.9855,
        fuel_level: 50
      }
    ]);
  }),

  // Facilities endpoints
  http.get('/api/facilities', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Main Warehouse',
        type: 'warehouse',
        latitude: 40.7589,
        longitude: -73.9851,
        status: 'operational'
      }
    ]);
  }),

  // Tasks/missions endpoints
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Delivery Task 1',
        status: 'pending',
        priority: 'high',
        assigned_to: null
      }
    ]);
  }),

  // Alerts endpoints
  http.get('/api/alerts', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Test Alert',
        message: 'This is a test alert',
        severity: 'warning',
        active: true
      }
    ]);
  }),

  // User profile
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    });
  })
];

// Create MSW server instance
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: (success: PositionCallback) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 100,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition);
  },
  watchPosition: () => 1,
  clearWatch: () => {},
};

Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation,
});

// Suppress console errors during tests (optional, remove if you want to see them)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
