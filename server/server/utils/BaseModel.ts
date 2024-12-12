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
  //需要重写

  initTable() {
    throw new Error("Not implemented");
  }

  fixEntityOut(_entity: Entity): void {
    throw new Error("Not implemented");
  }

  fixEntityIn(_entity: Entity): void {
    throw new Error("Not implemented");
  }

  BeforeAdd(_entity: Entity): void {
    throw new Error("Not implemented");
  }

  AfterChange(): void {
    throw new Error("Not implemented");
  }

  objToEntity(obj: Record<string, any>): Entity {
    const co_fun = this.entity.constructor as new () => Entity;
    const entity = new co_fun() as any;
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      const value = obj[key];
      if (value) entity[key] = value;
    });
    return entity;
  }

  public GetMany(where: WhereDef<Entity>): Entity[] {
    const res = SqliteHelper.GetMany(this.entity, where);
    res.forEach(this.fixEntityOut);
    return res;
  }

  public GetAll(): Entity[] {
    const res = SqliteHelper.GetMany(this.entity, null);
    res.forEach(this.fixEntityOut);
    return res;
  }

  public GetOne(where: WhereDef<Entity>): Entity {
    const res = SqliteHelper.GetOne(this.entity, where);
    if (res == null) return null;
    this.fixEntityOut(res);
    return res;
  }

  public AddMany(objs: Record<string, any>[]): void {
    const entities = objs.map((item) => {
      let entity = this.objToEntity(item);
      this.fixEntityIn(entity);
      this.BeforeAdd(entity);
      return entity;
    });
    try {
      SqliteHelper.BegineTrancation();
      SqliteHelper.AddMany(entities);
      SqliteHelper.CommitTrancation();
      this.AfterChange();
    } catch (e: any) {
      Logger.error(`Failed to add many entities: ${e.message}`);
      SqliteHelper.RollbackTrancation();
    }
  }

  public AddOne(obj: Record<string, any>): Entity | null {
    const entity = this.objToEntity(obj);
    this.fixEntityIn(entity);
    this.BeforeAdd(entity);
    const res = SqliteHelper.AddOne(entity);
    this.AfterChange();
    return res;
  }

  public UpdateOne(obj: Record<string, any>): Entity | null {
    const entity = this.objToEntity(obj);
    const old = SqliteHelper.GetOne(this.entity, { cond: { id: entity.id } });
    if (old == null) {
      Logger.warn(`UpdateOne: entity not found: ${entity.id}`);
      return null;
    }
    this.fixEntityIn(entity);
    const res = SqliteHelper.UpdateOneById(entity, old, entity);
    if (res == null) {
      Logger.warn(`UpdateOne: entity not found: ${entity.id}`);
      return null;
    }
    this.fixEntityOut(res);
    this.AfterChange();
    return res;
  }

  public DelMany(where: WhereDef<Entity>): void {
    SqliteHelper.DelMany(this.entity, where);
    this.AfterChange();
  }

  public DeleteById(id: number): void {
    SqliteHelper.DelMany(this.entity, { cond: { id } });
    this.AfterChange();
  }
}
