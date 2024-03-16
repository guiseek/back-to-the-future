import { quaternionFromOrientation } from "./quaternion-from-orientation";
import { isMobile } from "./is-mobile";
import { Quaternion } from "three";

type Direction = "n" | "w" | "s" | "e";

export class Control {
  readonly key = {
    W: 0,
    Q: 0,
    E: 0,
    A: 0,
    S: 0,
    D: 0,
    Up: 0,
    Left: 0,
    Down: 0,
    Right: 0,
    Space: 0,
    ShiftLeft: 0,
    ControlLeft: 0,
    Escape: 0,
  };

  readonly direction = {
    North: 0,
    West: 0,
    South: 0,
    East: 0,
    Some: 0,
  };

  directions = new Set<Direction>();

  #touched = false;
  #onTouched: VoidFunction[] = [];
  set onTouched(fn: VoidFunction) {
    this.#onTouched.push(fn);
  }

  #onKeyDown: VoidFunction[] = [];
  set onKeyDown(fn: VoidFunction) {
    this.#onKeyDown.push(fn);
  }

  #onKeyUp: VoidFunction[] = [];
  set onKeyUp(fn: VoidFunction) {
    this.#onKeyUp.push(fn);
  }

  readonly deviceRotation = new Quaternion();
  #onRotation: ((value: Quaternion) => void)[] = [];
  set onRotation(cb: (value: Quaternion) => void) {
    this.#onRotation.push(cb);
  }

  resetTouched() {
    this.#touched = false;
  }

  initialize() {
    onkeydown = this.#onKeyDownEvent;
    onkeyup = this.#onKeyUpEvent;

    if (isMobile() && "ondeviceorientation" in window) {
      ondeviceorientation = (event) => {
        const [w, x, y, z] = quaternionFromOrientation(event);
        const rotation = this.deviceRotation.set(x, y, z, w);
        for (const cb of this.#onRotation) cb(rotation);

        if (!this.#touched) {
          for (const fn of this.#onTouched) fn();
          this.#touched = true;
        }
      };
    }
  }

  #onKeyDownEvent = ({ code }: KeyboardEvent) => {
    if (this.#validateKeyCode(code)) {
      this.#setCodeToKeyValue(code, 1);

      for (const fn of this.#onKeyDown) fn();

      if (!this.#touched) {
        for (const fn of this.#onTouched) fn();
        this.#touched = true;
      }
    }
  };

  #onKeyUpEvent = ({ code }: KeyboardEvent) => {
    if (this.#validateKeyCode(code)) {
      if (!this.#touched) {
        for (const fn of this.#onTouched) fn();
        this.#touched = true;
      }

      this.#setCodeToKeyValue(code, 0);

      for (const fn of this.#onKeyUp) fn();
    }
  };

  #setCodeToKeyValue(code: string, value: number) {
    this.key[this.#formatKey(code)] = value;
  }

  #validateKeyCode(code: string) {
    const key = this.#formatKey(code);
    return Object.keys(this.key).includes(key);
  }

  #formatKey(code: string) {
    type Key = keyof typeof this.key;
    return code.replace("Key", "").replace("Arrow", "") as Key;
  }
}
