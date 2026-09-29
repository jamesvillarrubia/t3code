import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import * as DesktopWindow from "../../window/DesktopWindow.ts";
import * as IpcChannels from "../channels.ts";
import * as DesktopIpc from "../DesktopIpc.ts";

export const takePendingThreadLink = DesktopIpc.makeIpcMethod({
  channel: IpcChannels.TAKE_PENDING_THREAD_LINK_CHANNEL,
  payload: Schema.Void,
  result: Schema.NullOr(Schema.Struct({ environmentId: Schema.String, threadId: Schema.String })),
  handler: Effect.fn("desktop.ipc.threadLink.takePending")(function* () {
    const desktopWindow = yield* DesktopWindow.DesktopWindow;
    return Option.getOrNull(yield* desktopWindow.takePendingThreadLink);
  }),
});
