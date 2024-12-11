import { UserModel } from "../models/UserModel";

class ModelManager {
  private models: Map<EntityType, BaseModel<BaseEntity>> = new Map();
  public getModel(entity: EntityType) {
    return this.models.get(entity);
  }
  public registerModel(model: BaseModel<BaseEntity>) {
    this.models.set(model.Name, model);
  }

  public init() {
    this.models.forEach((model) => {
      model.init();
    });
  }
}
export const modelManager = new ModelManager();
modelManager.registerModel(new UserModel());
