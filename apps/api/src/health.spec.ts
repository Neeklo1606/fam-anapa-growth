import { describe, it, expect, beforeAll } from "vitest";
import { Test } from "@nestjs/testing";

import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('returns status "ok"', () => {
    const body = controller.health();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("@fam/api");
    expect(typeof body.uptime).toBe("number");
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
