/**
 * Base repository interface for common CRUD operations
 * Provides standardized patterns for all repositories
 */
export interface BaseRepository<T> {
  /**
   * Get all entities for a user
   */
  getAll(clerkUserId: string): Promise<T[]>;

  /**
   * Get entity by ID
   */
  getById(id: number): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(
    data: Omit<T, "id" | "created_at" | "updated_at"> & {
      clerkUserId: string;
    }
  ): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: number, data: Partial<T>, clerkUserId?: string): Promise<T>;

  /**
   * Delete an entity (soft delete)
   */
  delete(id: number, clerkUserId?: string): Promise<void>;
}

/**
 * Base repository interface for UUID-based entities
 * Provides standardized patterns for repositories that use UUID primary keys
 */
export interface UUIDBaseRepository<T> {
  /**
   * Get all entities
   */
  getAll(): Promise<T[]>;

  /**
   * Get entity by ID (UUID string)
   */
  getById(id: string): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: string): Promise<void>;
}

/**
 * Base repository interface for user-specific entities
 * Entities that belong to a specific user (customer_id relationship)
 */
export interface UserSpecificRepository<T> extends BaseRepository<T> {
  /**
   * Get all entities for a specific user
   */
  getUserEntities(clerkUserId: string): Promise<T[]>;

  /**
   * Create entity for a specific user
   */
  createForUser(
    data: Omit<T, "id" | "customer_id" | "created_at" | "updated_at"> & {
      clerkUserId: string;
    }
  ): Promise<T>;
}

/**
 * Base repository interface for searchable entities
 */
export interface SearchableRepository<T> extends BaseRepository<T> {
  /**
   * Search entities by query
   */
  search(query: string): Promise<T[]>;

  /**
   * Get entities by category
   */
  getByCategory(category: string): Promise<T[]>;
}

/**
 * Base repository interface for entities with status
 */
export interface StatusRepository<T> extends BaseRepository<T> {
  /**
   * Get entities by status
   */
  getByStatus(status: string): Promise<T[]>;

  /**
   * Update entity status
   */
  updateStatus(id: number, status: string, clerkUserId?: string): Promise<T>;
}
