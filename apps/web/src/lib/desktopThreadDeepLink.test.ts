import type { DesktopBridge } from "@t3tools/contracts";
import { formatOpenThreadAction } from "@t3tools/shared/threadDeepLink";
import { describe, expect, it, vi } from "vite-plus/test";
import { installDesktopThreadDeepLinks } from "./desktopThreadDeepLink";

describe("desktop thread deep links", () => {
  it("opens the thread named by an open-thread menu action until uninstalled", () => {
    let menuAction: ((action: string) => void) | undefined;
    const bridge = {
      onMenuAction: (listener) => {
        menuAction = listener;
        return () => {
          menuAction = undefined;
        };
      },
    } satisfies Pick<DesktopBridge, "onMenuAction">;
    const openThread = vi.fn();
    const uninstall = installDesktopThreadDeepLinks(bridge, openThread);

    menuAction?.("open-settings");
    menuAction?.("open-thread:env-1/a/b");
    expect(openThread).not.toHaveBeenCalled();

    menuAction?.(formatOpenThreadAction({ environmentId: "env-1", threadId: "thread-1" }));
    expect(openThread).toHaveBeenCalledExactlyOnceWith({
      environmentId: "env-1",
      threadId: "thread-1",
    });

    uninstall?.();
    expect(menuAction).toBeUndefined();
  });

  it("does nothing without a desktop bridge", () => {
    expect(installDesktopThreadDeepLinks(undefined, vi.fn())).toBeUndefined();
  });
});
