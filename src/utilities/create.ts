type Child = Node | Text | string;

interface Handler<T extends Element> {
  (value: T): T;
}

export function create<
  Tag extends keyof HTMLElementTagNameMap,
  Attrs extends HTMLElementTagNameMap[Tag]
>(
  tag: Tag,
  attrs: Partial<Attrs> = {},
  handler: Handler<HTMLElementTagNameMap[Tag]>,
  ...children: Child[]
): HTMLElementTagNameMap[Tag] {
  const el = document.createElement(tag);
  el.append(...children);

  return handler(Object.assign(el, attrs));
}
