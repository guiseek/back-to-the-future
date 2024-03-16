import { isMobile, math, type Control } from "../utilities";
import { Vector3, MathUtils, Quaternion } from "three";
import { Entity, addOnLoad } from "./entity";

const MAX_YAW_ACCELERATION = 0.001; // Maximum yaw acceleration. Adjust as needed.

export class DeLorean extends Entity {
  #acceleration = 0.06;

  #rotation = new Quaternion();

  velocity = new Vector3();
  direction = new Vector3();

  #yawVelocity = 0;
  #pitchVelocity = 0;
  #rollVelocity = 0;

  #planeSpeed = 0.003;
  #maxVelocity = 0.3;
  #friction = 0.96;

  actions = {};

  initialized = false;

  constructor(private control: Control) {
    super("models/de-lorean.glb");
    this.onLoad = addOnLoad(this);
    this.position.set(0, 30, 0);
    this.control.onRotation = (deviceRotation) => {
      this.#rotation.copy(deviceRotation);
    };
  }

  restart() {
    this.#yawVelocity = 0;
    this.#pitchVelocity = 0;
    this.#rollVelocity = 0;

    this.#planeSpeed = 0.003;
    this.#maxVelocity = 0.3;
    this.#friction = 0.96;
    this.position.set(0, 30, 0);
    this.initialized = false
  }

  #rotateSmoothly(alpha: number) {
    const quaternion = new Quaternion();
    quaternion.slerpQuaternions(this.quaternion, this.#rotation, alpha);
    this.quaternion.copy(quaternion);
  }

  #toForward(speed = 0) {
    const currentSpeed = Math.min(
      speed + this.#acceleration,
      this.#maxVelocity
    );
    const direction = new Vector3(0, 0, -1).applyQuaternion(this.quaternion);
    this.position.addScaledVector(direction, -currentSpeed);
  }

  #handleInput(yawAcceleration: number) {
    if (this.control.key.E) {
      this.#yawVelocity -= yawAcceleration;
    }
    if (this.control.key.Q) {
      this.#yawVelocity += yawAcceleration;
    }

    if (this.control.key.A || this.control.key.Left) {
      this.#rollVelocity -= this.#acceleration / 100;
    }
    if (this.control.key.D || this.control.key.Right) {
      this.#rollVelocity += this.#acceleration / 100;
    }

    if (this.control.key.W || this.control.key.Up) {
      this.#pitchVelocity += this.#acceleration / 100;
    }
    if (this.control.key.S || this.control.key.Down) {
      this.#pitchVelocity -= this.#acceleration / 100;
    }
  }

  update(delta: number): void {
    this.#yawVelocity *= this.#friction;
    this.#pitchVelocity *= this.#friction;
    this.#rollVelocity *= this.#friction;

    const yawAcceleration = MathUtils.clamp(
      MathUtils.lerp(
        0.0001,
        this.#acceleration,
        Math.abs(this.#planeSpeed) / this.#maxVelocity
      ),
      0.0001,
      MAX_YAW_ACCELERATION
    );

    this.#handleInput(yawAcceleration);

    this.#toForward(this.#planeSpeed);

    if (isMobile()) {
      this.#rotateSmoothly(Math.min(4 + delta, 1));
    }

    this.#yawVelocity = math.clamp(
      this.#yawVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );
    this.#pitchVelocity = math.clamp(
      this.#pitchVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );
    this.#rollVelocity = math.clamp(
      this.#rollVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );

    this.rotateY(this.#yawVelocity);
    this.rotateX(this.#pitchVelocity);
    this.rotateZ(this.#rollVelocity);

    this.rotation.z += this.#rollVelocity;
  }
}
