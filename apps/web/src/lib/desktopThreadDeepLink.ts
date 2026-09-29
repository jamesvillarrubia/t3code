import type { DesktopBridge } from "@t3tools/contracts";
import { parseOpenThreadAction, type ThreadDeepLink } from "@t3tools/shared/threadDeepLink";

/**
 * Opens a thread when the desktop main process forwards a `t3code://thread/...` link.
 * A link that arrived before this listener existed (cold launch) is pulled after subscribing.
 */
export function installDesktopThreadDeepLinks(
  bridge: Pick<DesktopBridge, "onMenuAction" | "takePendingThreadLink"> | undefined,
  openThread: (link: ThreadDeepLink) => void,
): (() => void) | undefined {
  if (!bridge) return undefined;
  const unsubscribe = bridge.onMenuAction((action) => {
    const link = parseOpenThreadAction(action);
    if (link) openThread(link);
  });
  // Main clears the link once taken, so open it even if this listener was replaced
  // meanwhile (StrictMode, or `navigate` changing identity); a replacement gets none.
  void bridge.takePendingThreadLink().then(
    (link) => {
      if (link) openThread(link);
    },
    () => undefined,
  );
  return unsubscribe;
}
