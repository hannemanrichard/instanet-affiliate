const DICEBEAR_INITIALS_URL = "https://api.dicebear.com/9.x/initials/svg";

export const getDicebearAvatarUrl = (seed: string): string => {
  const params = new URLSearchParams({
    seed: seed.trim() || "customer",
  });
  return `${DICEBEAR_INITIALS_URL}?${params.toString()}`;
};
