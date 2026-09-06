import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

const auditActorStorage = new AsyncLocalStorage<number | undefined>();

export const withAuditActor = async <T>(
  actorId: number | undefined,
  callback: () => Promise<T>
): Promise<T> => {
  return auditActorStorage.run(actorId, callback);
};

export const getAuditActorId = (): number | undefined => {
  return auditActorStorage.getStore();
};
