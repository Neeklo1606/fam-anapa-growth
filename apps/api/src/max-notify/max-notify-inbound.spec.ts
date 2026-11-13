import { describe, expect, it, vi } from "vitest";

import { MaxNotifyInboundService } from "./max-notify-inbound.service";

function setup(validCode = "fam0123456789abcdef01") {
  const upsert = vi.fn().mockResolvedValue({});
  const prisma = {
    maxNotifySubscriber: { upsert, findUnique: vi.fn().mockResolvedValue(null) },
  };
  const sendDmText = vi.fn().mockResolvedValue(undefined);
  const integration = {
    getBotTokenForOutbound: vi.fn().mockResolvedValue("tok"),
    consumeLinkCode: vi.fn(async (c: string) => c === validCode),
    sendDmText,
  };
  const svc = new MaxNotifyInboundService(prisma as never, integration as never);
  return { svc, upsert, sendDmText, integration };
}

describe("MaxNotifyInboundService link invite", () => {
  it("bot_started с верным payload сразу одобряет пользователя", async () => {
    const { svc, upsert, sendDmText } = setup();
    await svc.handleUpdate({
      update_type: "bot_started",
      user: { user_id: 42, first_name: "Иван" },
      payload: "fam0123456789abcdef01",
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ maxUserId: "42", status: "APPROVED" }) }),
    );
    expect(sendDmText.mock.calls[0]?.[2]).toContain("подключён");
  });

  it("bot_started с неверным payload не одобряет", async () => {
    const { svc, upsert } = setup();
    await svc.handleUpdate({ update_type: "bot_started", user: { user_id: 42 }, payload: "famdeadbeef" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("код, присланный текстом «/start fam…», тоже одобряет", async () => {
    const { svc, upsert } = setup();
    await svc.handleUpdate({
      update_type: "message_created",
      message: { sender: { user_id: 7 }, body: { text: "/start fam0123456789abcdef01" } },
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ maxUserId: "7", status: "APPROVED" }) }),
    );
  });
});
