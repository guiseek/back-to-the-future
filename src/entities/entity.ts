import { Group, type AnimationClip } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("js/");
gltfLoader.setDRACOLoader(dracoLoader);

interface LoadMessage {
  scene: Group;
  animations: AnimationClip[];
}

interface LoadEvent {
  (value: LoadMessage): void;
}

export const addOnLoad = <T extends Group>(group: T) => {
  return ({ scene }: LoadMessage) => group.add(scene);
};

export class Entity extends Group {
  #onLoad = new Set<LoadEvent>();
  set onLoad(fn: LoadEvent) {
    this.#onLoad.add(fn);
  }

  constructor(path: string) {
    super();
    this.#initialize(path);
  }

  async #initialize(path: string) {
    await gltfLoader.loadAsync(path).then(({ scene, animations }) => {
      for (const fn of this.#onLoad) fn({ scene, animations });
    });
  }
}
