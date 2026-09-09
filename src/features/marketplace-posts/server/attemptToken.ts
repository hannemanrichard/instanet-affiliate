import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type MarketplaceAttemptTokenPayload = {
  postId: number;
  partnerId: number;
  exp: number;
};

const getSecret = () => {
  const secret =
    process.env.MARKETPLACE_ATTEMPT_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim();

  if (!secret) {
    throw new Error("Missing MARKETPLACE_ATTEMPT_SECRET or CLERK_SECRET_KEY");
  }

  return secret;
};

const encodePayload = (payload: MarketplaceAttemptTokenPayload) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

const sign = (encodedPayload: string) =>
  createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

export const createMarketplaceAttemptToken = (input: {
  postId: number;
  partnerId: number;
  ttlMs?: number;
}) => {
  const payload: MarketplaceAttemptTokenPayload = {
    postId: input.postId,
    partnerId: input.partnerId,
    exp: Date.now() + (input.ttlMs ?? TOKEN_TTL_MS),
  };
  const encodedPayload = encodePayload(payload);
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifyMarketplaceAttemptToken = (
  token: string,
  expectedPostId: number
): MarketplaceAttemptTokenPayload => {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Invalid marketplace attempt token");
  }

  const expectedSignature = sign(encodedPayload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("Invalid marketplace attempt token signature");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as MarketplaceAttemptTokenPayload;

  if (
    !payload ||
    payload.postId !== expectedPostId ||
    !Number.isFinite(payload.partnerId) ||
    !Number.isFinite(payload.exp)
  ) {
    throw new Error("Invalid marketplace attempt token payload");
  }

  if (payload.exp < Date.now()) {
    throw new Error("Marketplace attempt token expired");
  }

  return payload;
};
