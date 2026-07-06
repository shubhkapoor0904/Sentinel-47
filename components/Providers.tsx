"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 55_000,      // treat data fresh for 55s
            refetchInterval: 60_000, // background refetch every 60s
            retry: 2,               // retry failed fetches twice
            retryDelay: 3000,       // 3s between retries
          },
        },
      })
  );

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
