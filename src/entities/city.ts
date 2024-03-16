import { Entity, addOnLoad } from "./entity";

export class City extends Entity {
  constructor() {
    super("models/city.glb");
    this.onLoad = addOnLoad(this);
  }
}
