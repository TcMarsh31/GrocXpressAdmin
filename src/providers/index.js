"use client";
// import Footer from "@/components/footer";
// import Header from "@/components/headers";
import React, { Suspense } from "react";

function Providers({ children }) {
  return (
    <Suspense>
      {/* <Header /> */}
      <div className="mt-10 md:mt-20 mb-10">{children}</div>
      {/* <Footer /> */}
    </Suspense>
  );
}

export default Providers;
