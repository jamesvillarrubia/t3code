import type { DesktopBridge } from "@t3tools/contracts";
import { parseOpenThreadAction, type ThreadDeepLink } from "@t3tools/shared/threadDeepLink";

/** Opens a thread when the desktop main process forwards a `t3code://thread/...` link. */
export function installDesktopThreadDeepLinks(
  bridge: Pick<DesktopBridge, "onMenuAction"> | undefined,
  openThread: (link: ThreadDeepLink) => void,
): (() => void) | undefined {
  return bridge?.onMenuAction((action) => {
    const link = parseOpenThreadAction(action);
    if (link) openThread(link);
  });
}
