import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes with more permissive settings
app.use("*", cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}));

// Add a middleware to log all requests
app.use("*", async (c, next) => {
  if (DEBUG) console.log(`Backend request: ${c.req.method} ${c.req.url}`);
  
  // Add CORS headers to all responses
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  // Handle OPTIONS requests for CORS preflight
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  // Add request timeout handling - increased to 3 minutes for long-running operations
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (DEBUG) console.log('Backend request timeout triggered');
      reject(new Error('Request timeout'));
    }, 180000); // 3 minute timeout
  });

  try {
    const responsePromise = next();
    return await Promise.race([responsePromise, timeoutPromise]);
  } catch (error) {
    if (DEBUG) console.log('Backend middleware error:', error);
    
    if (error.message === 'Request timeout') {
      return c.json({ 
        success: false,
        error: {
          message: 'Request timed out',
          code: 'TIMEOUT_ERROR'
        }
      }, 504);
    }
    throw error;
  }
});

// Add error handling middleware
app.onError((err, c) => {
  console.error('Server error:', err);
  
  if (DEBUG) {
    console.log('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
  }
  
  // Add CORS headers to error responses
  c.header('Access-Control-Allow-Origin', '*');
  
  // Return a structured error response
  return c.json({
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: 'SERVER_ERROR',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  }, 500);
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`Error in tRPC handler for ${path}:`, error);
      
      if (DEBUG) {
        console.log('TRPC error details:', {
          message: error.message,
          code: error.code,
          path,
          stack: error.stack
        });
      }
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  if (DEBUG) console.log('Health check endpoint called');
  return c.json({ status: "ok", message: "API is running" });
});

// Add a fallback route
app.all("*", (c) => {
  if (DEBUG) console.log(`Route not found: ${c.req.method} ${c.req.url}`);
  return c.json({ 
    success: false,
    error: {
      message: "Route not found",
      code: "NOT_FOUND"
    }
  }, 404);
});

export default app;
