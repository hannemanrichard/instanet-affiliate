import type { UserOption } from "../domain/repositories";

/**
 * Randomly selects a user from the provided array for fair distribution.
 * Returns null if the array is empty.
 *
 * @param users - Array of UserOption (agents or trackers)
 * @returns A randomly selected UserOption or null if array is empty
 */
export const assignRandomUser = (users: UserOption[]): UserOption | null => {
  if (!users || users.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
};
