import React, { useEffect } from "react";

interface AppIntroAnimationProps {
  onComplete: () => void;
}

/**
 * Web routes open directly into their task surface. The native animated
 * intro is intentionally not reused here because it blocks keyboard-first
 * access to authentication and duplicates the web welcome composition.
 */
export function AppIntroAnimation({ onComplete }: AppIntroAnimationProps) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return null;
}
