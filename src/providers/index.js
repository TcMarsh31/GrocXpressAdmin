"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "next-themes";

function Providers({ children }) {
  return (
    <Suspense>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Suspense>
  );
}

export default Providers;
