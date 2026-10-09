/**
 * Safe DOM patch to prevent Google Translate / browser auto-translate
 * from crashing React when text nodes are replaced or wrapped in <font> tags.
 */
if (typeof window !== "undefined" && typeof Node !== "undefined") {
  const nodeProto = Node.prototype as any;
  if (!nodeProto.__fazaTranslatePatched) {
    nodeProto.__fazaTranslatePatched = true;

    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }
}
export {};
