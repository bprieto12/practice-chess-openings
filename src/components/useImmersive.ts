import { useEffect } from "react";

/**
 * Marks a full-screen task (a board screen). On phones and tablets the bottom
 * tab bar is hidden while it's mounted, so the board gets the room and nothing
 * sits on top of the controls. Such screens must offer their own way back.
 */
export function useImmersive() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("immersive");
    return () => root.classList.remove("immersive");
  }, []);
}
