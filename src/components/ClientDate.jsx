"use client";

import React from "react";

// Render ISO timestamp on first render (matches server output) then
// replace with localized string after hydration to avoid hydration warnings.
export default function ClientDate({ iso }) {
  const [label, setLabel] = React.useState(iso);

  React.useEffect(() => {
    try {
      const d = new Date(iso);
      setLabel(d.toLocaleString());
    } catch {
      // keep ISO if parsing fails
    }
  }, [iso]);

  return <time dateTime={iso}>{label}</time>;
}
