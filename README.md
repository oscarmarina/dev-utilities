# Developer utilities for handling DOM, events, and other web development tasks

This repository provides a set of utility functions designed to facilitate DOM manipulation, event handling, and other common tasks in web development. These functions address various needs such as re-dispatching events, checking element visibility, and traversing the DOM tree.

## Table of Contents

- [Re-dispatch Event Functions](#re-dispatch-event-functions)
  - [redispatchEventFromEvent](#redispatcheventfromevent)
  - [redispatchEvent](#redispatchevent)
- [Element Visibility and Focus Functions](#element-visibility-and-focus-functions)
  - [isElementInvisible](#iselementinvisible)
  - [isFocusable](#isfocusable)
  - [getFirstAndLastFocusableChildren](#getfirstandlastfocusablechildren)
- [DOM Traversal Functions](#dom-traversal-functions)
  - [walkComposedTree](#walkcomposedtree)
  - [getDeepActiveElement](#getdeepactiveelement)
  - [deepContains](#deepcontains)
  - [composedAncestors](#composedancestors)
- [Event Handling Functions](#event-handling-functions)
  - [isClickInsideRect](#isclickinsiderect)
- [Miscellaneous Functions](#miscellaneous-functions)
  - [randomID](#randomid)
  - [urlToPlainObject](#urltoplainobject)

## Re-dispatch Event Functions

### `redispatchEventFromEvent`

Re-dispatches an event from the provided element. This function stops the propagation of bubbling events and dispatches a copy of the event from the specified element.

```javascript
/**
 * Re-dispatches an event from the provided element.
 *
 * @param {Element} element - The element to dispatch the event from.
 * @param {Event} ev - The event to re-dispatch.
 * @param {Object} [options={}] - An object with properties to override in the new event.
 * @returns {boolean} - Whether or not the event was dispatched (if cancelable).
 */
const redispatchEventFromEvent = (element, ev, options = {}) => {
  if (ev.bubbles && (!element.shadowRoot || ev.composed)) {
    ev.stopPropagation();
  }

  const copy = Reflect.construct(ev.constructor, [ev.type, { ...ev, ...options }]);
  const dispatched = element.dispatchEvent(copy);
  if (!dispatched) {
    ev.preventDefault();
  }

  return dispatched;
};
```

### `redispatchEvent`

This function simplifies re-dispatching an event. If the event parameter is a string, it creates a new `CustomEvent` and dispatches it.

```javascript
/**
 * Re-dispatches an event from the provided element.
 *
 * @param {Element} element - The element to dispatch the event from.
 * @param {Event|string} ev - The event to re-dispatch. If it's a string, a new Event is created.
 * @param {Object} [options={}] - An object with properties to override in the new event.
 * @returns {boolean} - Whether or not the event was dispatched (if cancelable).
 */
export const redispatchEvent = (element, ev, options = {}) => {
  if (typeof ev === 'string') {
    const eventType = ev;
    const newEvent = new CustomEvent(eventType);
    return redispatchEventFromEvent(element, newEvent, options);
  }
  return redispatchEventFromEvent(element, ev, options);
};
```

## Element Visibility and Focus Functions

### `isElementInvisible`

Checks if an element should be ignored based on its visibility or specific attributes.

```javascript
/**
 * Checks if an element should be ignored.
 *
 * @param {Element} element - The DOM element to check.
 * @param {Array} [exceptions=['dialog', '[popover]']] - Array of Elements to ignore when checking the element.
 * @returns {boolean} True if the element should be ignored by a screen reader, false otherwise.
 */
export const isElementInvisible = (element, exceptions = ['dialog', '[popover]']) => {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  if (element.matches(exceptions.join(','))) {
    return false;
  }

  const computedStyle = window.getComputedStyle(element);
  const isStyleHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden';
  const isAttributeHidden = element.matches('[disabled], [hidden], [inert], [aria-hidden="true"]');

  return isStyleHidden || isAttributeHidden;
};
```

### `isFocusable`

Determines if an element is focusable based on standard criteria or custom element properties.

```javascript
/**
 * Checks if an element is focusable.
 *
 * @param {Element} element - The DOM element to check for focusability.
 * @returns {boolean} True if the element is focusable, false otherwise.
 */
export const isFocusable = element => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const knownFocusableElements = `a[href],area[href],button:not([disabled]),details,iframe,object,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contentEditable="true"],[tabindex]:not([tabindex^="-"]),audio[controls],video[controls]`;

  if (element.matches(knownFocusableElements)) {
    return true;
  }

  const isDisabledCustomElement =
    element.localName.includes('-') && element.matches('[disabled], [aria-disabled="true"]');
  if (isDisabledCustomElement) {
    return false;
  }
  return /** @type {ShadowRoot | *} */ (element.shadowRoot)?.delegatesFocus ?? false;
};
```

### `getFirstAndLastFocusableChildren`

Retrieves the first and last focusable children of a node using a TreeWalker.

```javascript
/**
 * Retrieves the first and last focusable children of a node.
 *
 * @param {IterableIterator<HTMLElement>} walker - The TreeWalker object used to traverse the node's children.
 * @returns {[first: HTMLElement|null, last: HTMLElement|null]} An object containing the first and last focusable children.
 */
export const getFirstAndLastFocusableChildren = walker => {
  let firstFocusableChild = null;
  let lastFocusableChild = null;

  for (const currentNode of walker) {
    if (!firstFocusableChild) {
      firstFocusableChild = currentNode;
    }
    lastFocusableChild = currentNode;
  }

  return [firstFocusableChild, lastFocusableChild];
};
```

## DOM Traversal Functions

### `walkComposedTree`

Traverse the composed tree from the root, selecting elements that meet the provided filter criteria.

```javascript
/**
 * Traverse the composed tree from the root, selecting elements that meet the provided filter criteria.
 *
 * @param {Node} node - The root node for traversal.
 * @param {number} [whatToShow=0] - NodeFilter code for node types to include.
 * @param {function} [filter=(n: Node) => true] - Filters nodes. Child nodes are considered even if parent does not satisfy the filter.
 * @param {function} [skipNode=(n: Node) => false] - Determines whether to skip a node and its children.
 * @returns {IterableIterator<Node>} An iterator yielding nodes meeting the filter criteria.
 */
export function* walkComposedTree(
  node,
  whatToShow = 0,
  filter = () => true,
  skipNode = () => false,
) {
  if ((whatToShow && node.nodeType !== whatToShow) || skipNode(node)) {
    return;
  }

  if (filter(node)) {
    yield node;
  }

  const children =
    node instanceof HTMLElement && node.shadowRoot
      ? node.shadowRoot.children
      : node instanceof HTMLSlotElement
        ? node.assignedNodes({ flatten: true })
        : node.childNodes;

  for (const child of children) {
    yield* walkComposedTree(child, whatToShow, filter, skipNode);
  }
}
```

### `getDeepActiveElement`

Returns the deepest active element considering Shadow DOM subtrees.

```javascript
/**
 * Returns the deepest active element, considering Shadow DOM subtrees.
 *
 * @param {Document | ShadowRoot} root - The root element to start the search from.
 * @returns {Element} The deepest active element or body element if no active element is found.
 */
export const getDeepActiveElement = (root = document) => {
  const activeEl = root?.activeElement;
  if (activeEl) {
    if (activeEl.shadowRoot) {
      return getDeepActiveElement(activeEl.shadowRoot) ?? activeEl;
    }
    return activeEl;
  }
  return document.body;
};
```

### `deepContains`

Checks if a container node contains the target node, considering Shadow DOM boundaries.

```javascript
/**
 * Returns true if the first node contains the second, even if the second node is in a shadow tree.
 *
 * @param {Node} container - The container to search within.
 * @param {Node} target - The node that may be inside the container.
 * @returns {boolean} - True if the container contains the target node.
 */
export const deepContains = (container, target) => {
  let current = target;
  while (current) {
    const parent = current.assignedSlot || current.parentNode || current.host;
    if (parent === container) {
      return true;
    }
    current = parent;
  }
  return false;
};
```

### `composedAncestors`

Yields the ancestors of the given node in the composed tree, considering Shadow DOM

.

```javascript
/**
 * Return the ancestors of the given node in the composed tree.
 *
 * @param {Node} node - The node to find ancestors for.
 * @returns {Iterable<Node>} - The ancestors in the composed tree.
 */
export function* composedAncestors(node) {
  for (let current = node; current; ) {
    const next =
      current instanceof HTMLElement && current.assignedSlot
        ? current.assignedSlot
        : current instanceof ShadowRoot
          ? current.host
          : current.parentNode;
    if (next) {
      yield next;
    }
    current = next;
  }
}
```

## Event Handling Functions

### `isClickInsideRect`

Checks if a click event occurred inside a given bounding rectangle.

```javascript
/**
 * Checks if a click event occurred inside a given bounding rectangle.
 *
 * @param {DOMRect} rect - The bounding rectangle.
 * @param {PointerEvent} ev - The click event.
 * @returns {boolean} True if the click occurred inside the rectangle, false otherwise.
 */
export const isClickInsideRect = (rect, ev) => {
  const { top, left, height, width } = rect;
  const { clientX, clientY } = ev;
  return clientY >= top && clientY <= top + height && clientX >= left && clientX <= left + width;
};
```

## Miscellaneous Functions

### `randomID`

Generates a random alphanumeric string of a specified length.

```javascript
/**
 * Generates a random alphanumeric string of a specified length.
 *
 * @param {number} [length=10] - The length of the random string to generate. Default is 10.
 * @returns {string} A random alphanumeric string of the specified length.
 */
export const randomID = (length = 10) => Math.random().toString(36).substring(2, length);
```

### `urlToPlainObject`

Converts a URL object to a plain object with its properties as key-value pairs.

```javascript
/**
 * Converts a URL object to a plain object.
 *
 * @param {URL|string} url - The URL object to parse.
 * @returns {Object} An object representing the parsed URL.
 */
export function urlToPlainObject(url) {
  const urlObject = typeof url === 'string' ? new URL(url) : url;
  const plainObject = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in urlObject) {
    if (typeof urlObject[key] === 'string') {
      plainObject[key] = urlObject[key];
    }
  }
  return plainObject;
}
```

---

## Author Information

- Original Authors: @material/web, Jan Miksovsky, Cory LaViska
