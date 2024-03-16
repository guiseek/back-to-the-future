/// <reference types="vite/client" />

declare const container: HTMLDivElement;
declare const gameOverDialog: HTMLDialogElement;
declare const restart: HTMLButtonElement;
declare const explosion: HTMLAudioElement;
declare const audio: HTMLAudioElement;

type EventWithTarget<E extends Event, T> = E & { target: T };

type HTMLElementEventMap = {
  [K in keyof HTMLElementEventMap]: EventWithTarget<
    HTMLElementEventMap[K],
    HTMLElement
  >;
};



interface HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface E extends HTMLElementEventMap {}
