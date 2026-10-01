/**
 * Google Translate rewrites the live DOM. For every translatable text node it
 * **removes the original text node** and substitutes a
 * `<font style="vertical-align: inherit">` wrapper holding the translation.
 * (Observed in-browser with a MutationObserver; older builds of the widget
 * re-parented the original node into the wrapper instead.)
 *
 * React still holds a reference to the node that is now detached, so the next
 * commit that removes it - Radix tab panels, dialogs, conditional renders, list
 * updates, Framer Motion exits - throws:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * Rewriting every component that renders translatable text is not tractable
 * (any unmount of a translated subtree can hit this), so the guards below make
 * the two DOM mutations React performs during a commit tolerant of nodes that
 * were moved or dropped underneath us:
 *
 * - `removeChild` removes the node from wherever it actually lives - the
 *   `<font>` wrapper, or nothing at all when Google already detached it - and
 *   prunes the empty wrapper Google leaves behind.
 * - `insertBefore` falls back to appending when the reference node is no longer
 *   a child of the target, which is the same failure mode on the insert path.
 *
 * Both are no-ops for callers that respect the DOM contract, so behaviour is
 * unchanged unless Google has rewritten the tree.
 */

const PATCH_FLAG = '__exegesisDomStabilityGuards';

type PatchedNode = Node & { [PATCH_FLAG]?: boolean };

/** Google wraps translated text in `<font>` elements; the app never renders them. */
function isGoogleWrapper(node: Node | null): node is HTMLElement {
  return node !== null && node.nodeType === 1 && (node as Element).tagName === 'FONT';
}

export function installDomStabilityGuards(): void {
  if (typeof Node === 'undefined') return;

  const prototype = Node.prototype as PatchedNode;
  if (prototype[PATCH_FLAG]) return;

  const nativeRemoveChild = Node.prototype.removeChild;
  const nativeInsertBefore = Node.prototype.insertBefore;
  const nativeAppendChild = Node.prototype.appendChild;

  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode === this) return nativeRemoveChild.call(this, child);

    const actualParent = child.parentNode;
    // Already detached: React is cleaning up after itself, nothing to do.
    if (!actualParent) return child;

    const removed = nativeRemoveChild.call(actualParent, child);
    // Drop the empty `<font>` wrapper Google left behind with the text it held.
    if (isGoogleWrapper(actualParent) && actualParent.childNodes.length === 0) {
      const grandParent = actualParent.parentNode;
      if (grandParent) nativeRemoveChild.call(grandParent, actualParent);
    }
    return removed;
  };

  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    child: Node | null,
  ): T {
    // The reference node is no longer a child of this parent because Google
    // moved or removed it, so it is not a valid insertion point; appending
    // keeps the commit working and avoids the same NotFoundError.
    if (child && child.parentNode !== this) return nativeAppendChild.call(this, node);
    return nativeInsertBefore.call(this, node, child);
  };

  prototype[PATCH_FLAG] = true;
}
