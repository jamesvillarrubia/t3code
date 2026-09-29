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
      takePendingThreadLink: () => Promise.resolve(null),
    } satisfies Pick<DesktopBridge, "onMenuAction" | "takePendingThreadLink">;
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

  it("opens a link that arrived before the listener existed, after subscribing", async () => {
    const order: string[] = [];
    const link = { environmentId: "env-1", threadId: "thread-1" };
    const bridge = {
      onMenuAction: () => {
        order.push("subscribe");
        return () => undefined;
      },
      takePendingThreadLink: () => {
        order.push("take");
        return Promise.resolve(link);
      },
    } satisfies Pick<DesktopBridge, "onMenuAction" | "takePendingThreadLink">;
    const openThread = vi.fn();

    installDesktopThreadDeepLinks(bridge, openThread);
    await Promise.resolve();

    expect(order).toEqual(["subscribe", "take"]);
    expect(openThread).toHaveBeenCalledExactlyOnceWith(link);
  });

  it("does nothing without a desktop bridge", () => {
    expect(installDesktopThreadDeepLinks(undefined, vi.fn())).toBeUndefined();
  });
});
