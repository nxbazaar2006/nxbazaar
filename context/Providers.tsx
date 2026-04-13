"use client";

import React, { type ReactNode, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import DeliverWrapper from "@/components/location/DeliverWrapper";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { SessionProvider } from "next-auth/react";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  /* ✅ Fix: Stable QueryClient (NO hydration bug) */
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          gcTime: 5 * 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 0,
        },
      },
    })
  );

  return (
   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* UploadThing SSR */}
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

      {/* Toast */}
      <Toaster position="top-center" />

      {/* Auth */}
      <SessionProvider>
        {/* React Query */}
        <QueryClientProvider client={queryClient}>
          {/* Redux */}
          <ReduxProvider store={store}>
            {/* Custom Wrapper */}
            <DeliverWrapper>
              {children}
            </DeliverWrapper>
          </ReduxProvider>

          {/* Devtools */}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}