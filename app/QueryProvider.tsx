"use client";

import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Define props interface
interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider component that wraps the application with TanStack Query provider
 * Handles global query and mutation error handling
 */
const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Create a client with configuration
  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global defaults for queries
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            // Global defaults for mutations
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Global error handling for queries
            console.error(
              `Something went wrong: ${error.message}, Query: ${query.queryKey[0]}`,
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            // Global error handling for mutations
            console.error(`Mutation failed: ${error.message}`);
          },
        }),
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};

export default QueryProvider;
