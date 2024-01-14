/**
 * Represents a store that can be used to store and retrieve data.
 */
export interface IStore {
  /**
   * Retrieves an item from the store.
   *
   * @param id The id of the item to retrieve.
   */
  get<T>(id: string): Promise<T>;

  /**
   * Stores an item in the store.
   *
   * @param item The item to store.
   */
  create<T>(item: T): Promise<T>;

  /**
   * Updates an item in the store.
   *
   * @param id The id of the item to update.
   * @param item The updated item.
   */
  update<T>(id: string, item: T): Promise<T>;

  /**
   * Deletes an item from the store.
   *
   * @param id The id of the item to delete.
   */
  delete(id: string): Promise<void>;
}
