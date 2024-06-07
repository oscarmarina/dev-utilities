/**
 * Traverse the composed tree from the root, selecting elements that meet the provided filter criteria.
 * You can pass [NodeFilter](https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter) or 0 to retrieve all nodes.
 *
 * @author Jan Miksovsky
 * @see https://github.com/JanMiksovsky/elix/blob/main/src/core/dom.js
 *
 * @param {Node} node - The root node for traversal.
 * @param {number} [whatToShow=0] - NodeFilter code for node types to include.
 * @param {function} [filter=(n: Node) => true] - Filters nodes. Child nodes are considered even if parent does not satisfy the filter.
 * @param {function} [skipNode=(n: Node) => false] - Determines whether to skip a node and its children.
 * @returns {IterableIterator<Node>} An iterator yielding nodes meeting the filter criteria.
 */
export function walkComposedTree(node: Node, whatToShow?: number, filter?: Function, skipNode?: Function): IterableIterator<Node>;
/**
 * Return the ancestors of the given node in the composed tree.
 *
 * In the composed tree, the ancestor of a node assigned to a slot is that slot,
 * not the node's DOM ancestor. The ancestor of a shadow root is its host.
 *
 * @author Jan Miksovsky
 * @see https://github.com/JanMiksovsky/elix/blob/main/src/core/dom.js
 *
 * @param {Node} node
 * @returns {Iterable<Node>}
 */
export function composedAncestors(node: Node): Iterable<Node>;
export function redispatchEventFromEvent(element: Element, ev: Event, options?: any): boolean;
export function redispatchEvent(element: Element, ev: Event | string, options?: any): boolean;
export function isElementInvisible(element: Element, exceptions?: any[]): boolean;
export function isFocusable(element: Element): boolean;
export function getFirstAndLastFocusableChildren(walker: IterableIterator<HTMLElement>): [first: HTMLElement | null, last: HTMLElement | null];
export function getDeepActiveElement(root?: Document | ShadowRoot): Element;
export function deepContains(container: Node, target: Node): boolean;
export function isClickInsideRect(rect: DOMRect, ev: PointerEvent): boolean;
export function randomID(length?: number): string;
export function urlToPlainObject(url: URL | string): any;
