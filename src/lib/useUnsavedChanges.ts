"use client";

import { useEffect, useCallback, useRef } from "react";

export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const confirmDiscard = useCallback((): boolean => {
    if (!dirtyRef.current) return true;
    return confirm("You have unsaved changes. Are you sure you want to leave?");
  }, []);

  return { confirmDiscard };
}
