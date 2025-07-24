import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

/**
 * Creates context for an incoming request
 * @param opts - Request options from the adapter
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  if (DEBUG) console.log('Creating tRPC context for request');
  
  try {
    // Get request headers
    const headers = opts.req.headers;
    
    // Extract any authentication information if needed
    // const authHeader = headers.get('authorization');
    
    // In a real app, you would validate the auth token and get the user
    // const user = await validateAuthToken(authHeader);
    
    // For now, we'll just return a simple context
    return {
      headers,
      // user,
      req: opts.req,
    };
  } catch (error) {
    console.error('Error creating context:', error);
    
    // Return a basic context even if there's an error
    return {
      headers: opts.req.headers,
      req: opts.req,
    };
  }
};

export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (DEBUG) {
      console.log('tRPC error:', {
        message: error.message,
        code: error.code,
        data: error.data,
        shape
      });
    }
    
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        // Include the stack in development
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Create a protected procedure that requires authentication
 * This is a placeholder - in a real app, you would check if the user is authenticated
 */
export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    // In a real app, you would check if the user is authenticated
    // if (!ctx.user) {
    //   throw new TRPCError({
    //     code: 'UNAUTHORIZED',
    //     message: 'You must be logged in to access this resource',
    //   });
    // }
    
    return next({
      ctx: {
        // Include the user in the context
        // ...ctx,
        // user: ctx.user,
      },
    });
  });
