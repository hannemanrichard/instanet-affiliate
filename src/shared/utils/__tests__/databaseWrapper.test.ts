import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { AuditLogger } from "@/shared/utils/auditLogger";

jest.mock("@/shared/utils/auditLogger", () => ({
  AuditLogger: {
    logAuditEntry: jest.fn(),
  },
}));

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("DatabaseWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs audited mutations without requiring a source field", async () => {
    const created = { id: 123, name: "Test product" };

    const result = await DatabaseWrapper.executeMutation(
      async () => ({
        data: created,
        error: null,
      }),
      {
        operation: "create",
        table: "products",
        auditLog: {
          enabled: true,
          action: "INSERT",
          changedBy: 42,
        },
      }
    );

    expect(result).toEqual(created);
    expect(AuditLogger.logAuditEntry).toHaveBeenCalledWith({
      table_name: "products",
      recordId: 123,
      action: "INSERT",
      old_values: undefined,
      new_values: created,
      changed_by: 42,
    });
  });
});
