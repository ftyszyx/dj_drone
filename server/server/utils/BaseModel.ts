import "reflect-metadata";
export class BaseModel<Entity extends BaseEntity> {
  private entity_name: EntityType;
  constructor(public entity: Entity) {
    this.entity_name = entity[TABLE_NAME_KEY] as EntityType;
  }
  public get Name() {
    return this.entity_name;
  }

  init() {
    Logger.info(`model:${this.entity_name} init`);
    try {
      if (!this.entity) {
        throw new Error(`Entity not defined for model class`);
      }
      this.initTable();
    } catch (error) {
      console.error(`Failed to initialize model:`, error);
      throw error;
    }
  }

  initTable() {
    throw new Error("Not implemented");
  }
}
