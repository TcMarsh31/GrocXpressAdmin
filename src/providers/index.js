"use client";

import React, { Suspense } from "react";

function Providers({ children }) {
  return <Suspense>{children}</Suspense>;
}

export default Providers;
