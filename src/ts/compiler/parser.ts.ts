/// <reference path="utilities.ts"/>
/// <reference path="this.scanner.ts"/>

namespace ts {
    /* @internal */ export let parseTime = 0;

    let this.NodeConstructor: new (kind: TokenType, pos: number, end: number) => Nodes.Node;
    let this.SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => Nodes.Node;

    // Nodes.Produces a new Nodes.SourceFile for the 'newText' provided. Nodes.The 'textChangeRange' parameter
    // indicates what changed between the 'text' that this Nodes.SourceFile has and the 'newText'.
    // Nodes.The Nodes.SourceFile will be created with the compiler attempting to reuse as many nodes from
    // this file as possible.
    //
    // Nodes.Note: this function mutates nodes from this Nodes.SourceFile. Nodes.That means any existing nodes
    // from this Nodes.SourceFile that are being held onto may change as a this.result (including
    // becoming detached from any Nodes.SourceFile).  Nodes.It is recommended that this Nodes.SourceFile not
    // be used once 'update' is called on it.
    export function updateSourceFile(this.sourceFile: Nodes.SourceFile, newText: string, textChangeRange: Nodes.TextChangeRange, aggressiveChecks?: boolean): Nodes.SourceFile {
        return Nodes.IncrementalParser.updateSourceFile(this.sourceFile, newText, textChangeRange, aggressiveChecks);
    }

    /* @internal */
    export function parseIsolatedJSDocComment(content: string, start?: number, length?: number) {
        private result = Nodes.Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
        if (this.result && this.result.jsDocComment) {
            // because the jsDocComment was parsed out of the source file, it might
            // not be covered by the fixupParentReferences.
            Nodes.Parser.fixupParentReferences(this.result.jsDocComment);
        }

        return this.result;
    }

    /* @internal */
    // Nodes.Exposed only for testing.
    export function parseJSDocTypeExpressionForTests(content: string, start?: number, length?: number) {
        return Nodes.Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
    }

    // Nodes.Implement the parser as a singleton module.  Nodes.We do this for perf reasons because creating
    // parser instances can actually be expensive enough to impact us on projects with many source
    // files.
    namespace Nodes.Parser {
        
    }

    namespace Nodes.IncrementalParser {
        export function updateSourceFile(this.sourceFile: Nodes.SourceFile, newText: string, textChangeRange: Nodes.TextChangeRange, aggressiveChecks: boolean): Nodes.SourceFile {
            aggressiveChecks = aggressiveChecks || Nodes.Debug.shouldAssert(Nodes.AssertionLevel.Aggressive);

            this.checkChangeRange(this.sourceFile, newText, textChangeRange, aggressiveChecks);
            if (textChangeRangeIsUnchanged(textChangeRange)) {
                // if the text didn't change, then we can just return our current source file as-is.
                return this.sourceFile;
            }

            if (this.sourceFile.statements.length === 0) {
                // Nodes.If we don't have any statements in the current source file, then there's no real
                // way to incrementally parse.  Nodes.So just do a full parse instead.
                return Nodes.Parser.parseSourceFile(this.sourceFile.fileName, newText, this.sourceFile.languageVersion, /*this.syntaxCursor*/ undefined, /*setParentNodes*/ true, this.sourceFile.scriptKind);
            }

            // Nodes.Make sure we're not trying to incrementally update a source file more than once.  Nodes.Once
            // we do an update the original source file is considered unusable from that point onwards.
            //
            // Nodes.This is because we do incremental parsing in-place.  i.e. we take nodes from the old
            // tree and give them new positions and parents.  Nodes.From that point on, trusting the old
            // tree at all is not possible as far too much of it may violate invariants.
            const incrementalSourceFile = <Nodes.IncrementalNode><Nodes.Node>this.sourceFile;
            console.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
            incrementalSourceFile.hasBeenIncrementallyParsed = true;

            const oldText = this.sourceFile.text;
            const this.syntaxCursor = this.createSyntaxCursor(this.sourceFile);

            // Nodes.Make the actual change larger so that we know to reparse anything whose lookahead
            // might have intersected the change.
            const changeRange = this.extendToAffectedRange(this.sourceFile, textChangeRange);
            this.checkChangeRange(this.sourceFile, newText, changeRange, aggressiveChecks);

            // Nodes.Ensure that extending the affected range only moved the start of the change range
            // earlier in the file.
            console.assert(changeRange.span.start <= textChangeRange.span.start);
            console.assert(textSpanEnd(changeRange.span) === textSpanEnd(textChangeRange.span));
            console.assert(textSpanEnd(textChangeRangeNewSpan(changeRange)) === textSpanEnd(textChangeRangeNewSpan(textChangeRange)));

            // Nodes.The is the amount the nodes after the edit range need to be adjusted.  Nodes.It can be
            // positive (if the edit added characters), negative (if the edit deleted characters)
            // or zero (if this was a pure overwrite with nothing added/removed).
            const delta = textChangeRangeNewSpan(changeRange).length - changeRange.span.length;

            // Nodes.If we added or removed characters during the edit, then we need to go and adjust all
            // the nodes after the edit.  Nodes.Those nodes may move forward (if we inserted chars) or they
            // may move backward (if we deleted chars).
            //
            // Nodes.Doing this helps us out in two ways.  Nodes.First, it means that any nodes/tokens we want
            // to reuse are already at the appropriate position in the new text.  Nodes.That way when we
            // reuse them, we don't have to figure out if they need to be adjusted.  Nodes.Second, it makes
            // it very easy to determine if we can reuse a node.  Nodes.If the node's position is at where
            // we are in the text, then we can reuse it.  Nodes.Otherwise we can't.  Nodes.If the node's position
            // is ahead of us, then we'll need to rescan tokens.  Nodes.If the node's position is behind
            // us, then we'll need to skip it or crumble it as appropriate
            //
            // Nodes.We will also adjust the positions of nodes that intersect the change range as well.
            // Nodes.By doing this, we ensure that all the positions in the old tree are consistent, not
            // just the positions of nodes entirely before/after the change range.  Nodes.By being
            // consistent, we can then easily map from positions to nodes in the old tree easily.
            //
            // Nodes.Also, mark any syntax elements that intersect the changed span.  Nodes.We know, up front,
            // that we cannot reuse these elements.
            this.updateTokenPositionsAndMarkElements(incrementalSourceFile,
                changeRange.span.start, textSpanEnd(changeRange.span), textSpanEnd(textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);

            // Nodes.Now that we've set up our internal incremental state just proceed and parse the
            // source file in the normal fashion.  Nodes.When possible the parser will retrieve and
            // reuse nodes from the old tree.
            //
            // Nodes.Note: passing in 'true' for setNodeParents is very important.  Nodes.When incrementally
            // parsing, we will be reusing nodes from the old tree, and placing it into new
            // parents.  Nodes.If we don't set the parents now, we'll end up with an observably
            // inconsistent tree.  Nodes.Setting the parents on the new tree should be very fast.  Nodes.We
            // will immediately bail out of walking any subtrees when we can see that their parents
            // are already correct.
            const this.result = Nodes.Parser.parseSourceFile(this.sourceFile.fileName, newText, this.sourceFile.languageVersion, this.syntaxCursor, /*setParentNodes*/ true, this.sourceFile.scriptKind);

            return this.result;
        }

        private moveElementEntirelyPastChangeRange(element: Nodes.IncrementalElement, isArray: boolean, delta: number, oldText: string, newText: string, aggressiveChecks: boolean) {
            if (isArray) {
                visitArray(<Nodes.IncrementalNodeList>element);
            }
            else {
                visitNode(<Nodes.IncrementalNode>element);
            }
            return;

            function visitNode(node: Nodes.IncrementalNode) {
                let text = "";
                if (aggressiveChecks && this.shouldCheckNode(node)) {
                    text = oldText.substring(node.pos, node.end);
                }

                // Nodes.Ditch any existing Nodes.LS children we may have created.  Nodes.This way we can avoid
                // moving them forward.
                if (node._children) {
                    node._children = undefined;
                }

                node.pos += delta;
                node.end += delta;

                if (aggressiveChecks && this.shouldCheckNode(node)) {
                    console.assert(text === newText.substring(node.pos, node.end));
                }

                forEachChild(node, visitNode, visitArray);
                if (node.jsDocComments) {
                    for (const jsDocComment of node.jsDocComments) {
                        forEachChild(jsDocComment, visitNode, visitArray);
                    }
                }
                this.checkNodePositions(node, aggressiveChecks);
            }

            function visitArray(array: Nodes.IncrementalNodeList) {
                array._children = undefined;
                array.pos += delta;
                array.end += delta;

                for (const node of array) {
                    visitNode(node);
                }
            }
        }

        private shouldCheckNode(node: Nodes.Node) {
            switch (node.kind) {
                case TokenType.StringLiteral:
                case TokenType.NumericLiteral:
                case TokenType.Identifier:
                    return true;
            }

            return false;
        }

        private adjustIntersectingElement(element: Nodes.IncrementalElement, changeStart: number, changeRangeOldEnd: number, changeRangeNewEnd: number, delta: number) {
            console.assert(element.end >= changeStart, "Nodes.Adjusting an element that was entirely before the change range");
            console.assert(element.pos <= changeRangeOldEnd, "Nodes.Adjusting an element that was entirely after the change range");
            console.assert(element.pos <= element.end);

            // Nodes.We have an element that intersects the change range in some way.  Nodes.It may have its
            // start, or its end (or both) in the changed range.  Nodes.We want to adjust any part
            // that intersects such that the final tree is in a consistent state.  i.e. all
            // children have spans within the span of their parent, and all siblings are ordered
            // properly.

            // Nodes.We may need to update both the 'pos' and the 'end' of the element.

            // Nodes.If the 'pos' is before the start of the change, then we don't need to touch it.
            // Nodes.If it isn't, then the 'pos' must be inside the change.  Nodes.How we update it will
            // depend if delta is  positive or negative.  Nodes.If delta is positive then we have
            // something like:
            //
            //  -------------------Nodes.AAA-----------------
            //  -------------------Nodes.BBBCCCCCCC-----------------
            //
            // Nodes.In this case, we consider any node that started in the change range to still be
            // starting at the same position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------Nodes.XXXYYYYYYY-----------------
            //  -------------------Nodes.ZZZ-----------------
            //
            // Nodes.In this case, any element that started in the 'X' range will keep its position.
            // Nodes.However any element that started after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that started in the 'Y' range will
            // be adjusted to have their start at the end of the 'Z' range.
            //
            // Nodes.The element will keep its position if possible.  Nodes.Or Nodes.Move backward to the new-end
            // if it's in the 'Y' range.
            element.pos = Nodes.Math.min(element.pos, changeRangeNewEnd);

            // Nodes.If the 'end' is after the change range, then we always adjust it by the delta
            // amount.  Nodes.However, if the end is in the change range, then how we adjust it
            // will depend on if delta is  positive or negative.  Nodes.If delta is positive then we
            // have something like:
            //
            //  -------------------Nodes.AAA-----------------
            //  -------------------Nodes.BBBCCCCCCC-----------------
            //
            // Nodes.In this case, we consider any node that ended inside the change range to keep its
            // end position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------Nodes.XXXYYYYYYY-----------------
            //  -------------------Nodes.ZZZ-----------------
            //
            // Nodes.In this case, any element that ended in the 'X' range will keep its position.
            // Nodes.However any element that ended after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that ended in the 'Y' range will
            // be adjusted to have their end at the end of the 'Z' range.
            if (element.end >= changeRangeOldEnd) {
                // Nodes.Element ends after the change range.  Nodes.Always adjust the end pos.
                element.end += delta;
            }
            else {
                // Nodes.Element ends in the change range.  Nodes.The element will keep its position if
                // possible. Nodes.Or Nodes.Move backward to the new-end if it's in the 'Y' range.
                element.end = Nodes.Math.min(element.end, changeRangeNewEnd);
            }

            console.assert(element.pos <= element.end);
            if (element.parent) {
                console.assert(element.pos >= element.parent.pos);
                console.assert(element.end <= element.parent.end);
            }
        }

        private checkNodePositions(node: Nodes.Node, aggressiveChecks: boolean) {
            if (aggressiveChecks) {
                let pos = node.pos;
                forEachChild(node, child => {
                    console.assert(child.pos >= pos);
                    pos = child.end;
                });
                console.assert(pos <= node.end);
            }
        }

        private updateTokenPositionsAndMarkElements(
            this.sourceFile: Nodes.IncrementalNode,
            changeStart: number,
            changeRangeOldEnd: number,
            changeRangeNewEnd: number,
            delta: number,
            oldText: string,
            newText: string,
            aggressiveChecks: boolean): void {

            visitNode(this.sourceFile);
            return;

            function visitNode(child: Nodes.IncrementalNode) {
                console.assert(child.pos <= child.end);
                if (child.pos > changeRangeOldEnd) {
                    // Nodes.Node is entirely past the change range.  Nodes.We need to move both its pos and
                    // end, forward or backward appropriately.
                    this.moveElementEntirelyPastChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
                    return;
                }

                // Nodes.Check if the element intersects the change range.  Nodes.If it does, then it is not
                // reusable.  Nodes.Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                const fullEnd = child.end;
                if (fullEnd >= changeStart) {
                    child.intersectsChange = true;
                    child._children = undefined;

                    // Nodes.Adjust the pos or end (or both) of the intersecting element accordingly.
                    this.adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    forEachChild(child, visitNode, visitArray);

                    this.checkNodePositions(child, aggressiveChecks);
                    return;
                }

                // Nodes.Otherwise, the node is entirely before the change range.  Nodes.No need to do anything with it.
                console.assert(fullEnd < changeStart);
            }

            function visitArray(array: Nodes.IncrementalNodeList) {
                console.assert(array.pos <= array.end);
                if (array.pos > changeRangeOldEnd) {
                    // Nodes.Array is entirely after the change range.  Nodes.We need to move it, and move any of
                    // its children.
                    this.moveElementEntirelyPastChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
                    return;
                }

                // Nodes.Check if the element intersects the change range.  Nodes.If it does, then it is not
                // reusable.  Nodes.Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                const fullEnd = array.end;
                if (fullEnd >= changeStart) {
                    array.intersectsChange = true;
                    array._children = undefined;

                    // Nodes.Adjust the pos or end (or both) of the intersecting array accordingly.
                    this.adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    for (const node of array) {
                        visitNode(node);
                    }
                    return;
                }

                // Nodes.Otherwise, the array is entirely before the change range.  Nodes.No need to do anything with it.
                console.assert(fullEnd < changeStart);
            }
        }

        private extendToAffectedRange(this.sourceFile: Nodes.SourceFile, changeRange: Nodes.TextChangeRange): Nodes.TextChangeRange {
            // Nodes.Consider the following code:
            //      void foo() { /; }
            //
            // Nodes.If the text changes with an insertion of / just before the semicolon then we end up with:
            //      void foo() { //; }
            //
            // Nodes.If we were to just use the changeRange a is, then we would not rescan the { this.token
            // (as it does not intersect the actual original change range).  Nodes.Because an edit may
            // change the this.token touching it, we actually need to look back *at least* one this.token so
            // that the prior this.token sees that change.
            const maxLookahead = 1;

            let start = changeRange.span.start;

            // the first iteration aligns us with the change start. subsequent iteration move us to
            // the left by maxLookahead tokens.  Nodes.We only need to do this as long as we're not at the
            // start of the tree.
            for (let i = 0; start > 0 && i <= maxLookahead; i++) {
                const nearestNode = this.findNearestNodeStartingBeforeOrAtPosition(this.sourceFile, start);
                console.assert(nearestNode.pos <= start);
                const position = nearestNode.pos;

                start = Nodes.Math.max(0, position - 1);
            }

            const finalSpan = createTextSpanFromBounds(start, textSpanEnd(changeRange.span));
            const finalLength = changeRange.newLength + (changeRange.span.start - start);

            return createTextChangeRange(finalSpan, finalLength);
        }

        private findNearestNodeStartingBeforeOrAtPosition(this.sourceFile: Nodes.SourceFile, position: number): Nodes.Node {
            let bestResult: Nodes.Node = this.sourceFile;
            let lastNodeEntirelyBeforePosition: Nodes.Node;

            forEachChild(this.sourceFile, visit);

            if (lastNodeEntirelyBeforePosition) {
                const lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition);
                if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                    bestResult = lastChildOfLastEntireNodeBeforePosition;
                }
            }

            return bestResult;

            function getLastChild(node: Nodes.Node): Nodes.Node {
                while (true) {
                    const lastChild = getLastChildWorker(node);
                    if (lastChild) {
                        node = lastChild;
                    }
                    else {
                        return node;
                    }
                }
            }

            function getLastChildWorker(node: Nodes.Node): Nodes.Node {
                let last: Nodes.Node = undefined;
                forEachChild(node, child => {
                    if (nodeIsPresent(child)) {
                        last = child;
                    }
                });
                return last;
            }

            function visit(child: Nodes.Node) {
                if (nodeIsMissing(child)) {
                    // Nodes.Missing nodes are effectively invisible to us.  Nodes.We never even consider them
                    // Nodes.When trying to find the nearest node before us.
                    return;
                }

                // Nodes.If the child intersects this position, then this node is currently the nearest
                // node that starts before the position.
                if (child.pos <= position) {
                    if (child.pos >= bestResult.pos) {
                        // Nodes.This node starts before the position, and is closer to the position than
                        // the previous best node we found.  Nodes.It is now the new best node.
                        bestResult = child;
                    }

                    // Nodes.Now, the node may overlap the position, or it may end entirely before the
                    // position.  Nodes.If it overlaps with the position, then either it, or one of its
                    // children must be the nearest node before the position.  Nodes.So we can just
                    // recurse into this child to see if we can find something better.
                    if (position < child.end) {
                        // Nodes.The nearest node is either this child, or one of the children inside
                        // of it.  Nodes.We've already marked this child as the best so far.  Nodes.Recurse
                        // in case one of the children is better.
                        forEachChild(child, visit);

                        // Nodes.Once we look at the children of this node, then there's no need to
                        // continue any further.
                        return true;
                    }
                    else {
                        console.assert(child.end <= position);
                        // Nodes.The child ends entirely before this position.  Nodes.Say you have the following
                        // (where $ is the position)
                        //
                        //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                        //
                        // Nodes.We would want to find the nearest preceding node in "complex expr 2".
                        // Nodes.To support that, we keep track of this node, and once we're done searching
                        // for a best node, we recurse down this node to see if we can find a good
                        // this.result in it.
                        //
                        // Nodes.This approach allows us to quickly skip over nodes that are entirely
                        // before the position, while still allowing us to find any nodes in the
                        // last one that might be what we want.
                        lastNodeEntirelyBeforePosition = child;
                    }
                }
                else {
                    console.assert(child.pos > position);
                    // Nodes.We're now at a node that is entirely past the position we're searching for.
                    // Nodes.This node (and all following nodes) could never contribute to the this.result,
                    // so just skip them by returning 'true' here.
                    return true;
                }
            }
        }

        private checkChangeRange(this.sourceFile: Nodes.SourceFile, newText: string, textChangeRange: Nodes.TextChangeRange, aggressiveChecks: boolean) {
            const oldText = this.sourceFile.text;
            if (textChangeRange) {
                console.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);

                if (aggressiveChecks || Nodes.Debug.shouldAssert(Nodes.AssertionLevel.VeryAggressive)) {
                    const oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                    const newTextPrefix = newText.substr(0, textChangeRange.span.start);
                    console.assert(oldTextPrefix === newTextPrefix);

                    const oldTextSuffix = oldText.substring(textSpanEnd(textChangeRange.span), oldText.length);
                    const newTextSuffix = newText.substring(textSpanEnd(textChangeRangeNewSpan(textChangeRange)), newText.length);
                    console.assert(oldTextSuffix === newTextSuffix);
                }
            }
        }

        interface Nodes.IncrementalElement extends Nodes.TextRange {
            parent?: Nodes.Node;
            intersectsChange: boolean;
            length?: number;
            _children: Nodes.Node[];
        }

        export interface Nodes.IncrementalNode extends Nodes.Node, Nodes.IncrementalElement {
            hasBeenIncrementallyParsed: boolean;
        }

        interface Nodes.IncrementalNodeList extends Nodes.NodeList<Nodes.IncrementalNode>, Nodes.IncrementalElement {
            length: number;
        }

        // Nodes.Allows finding nodes in the source file at a certain position in an efficient manner.
        // Nodes.The implementation takes advantage of the calling pattern it knows the parser will
        // make in order to optimize finding nodes as quickly as possible.
        export interface Nodes.SyntaxCursor {
            this.currentNode(position: number): Nodes.IncrementalNode;
        }

        private createSyntaxCursor(this.sourceFile: Nodes.SourceFile): Nodes.SyntaxCursor {
            let currentArray: Nodes.NodeList<Nodes.Node> = this.sourceFile.statements;
            let currentArrayIndex = 0;

            console.assert(currentArrayIndex < currentArray.length);
            let current = currentArray[currentArrayIndex];
            let lastQueriedPosition = Nodes.InvalidPosition.Value;

            return {
                this.currentNode(position: number) {
                    // Nodes.Only compute the current node if the position is different than the last time
                    // we were asked.  Nodes.The parser commonly asks for the node at the same position
                    // twice.  Nodes.Once to know if can read an appropriate list element at a certain point,
                    // and then to actually read and consume the node.
                    if (position !== lastQueriedPosition) {
                        // Nodes.Much of the time the parser will need the very next node in the array that
                        // we just returned a node from.So just simply check for that case and move
                        // forward in the array instead of searching for the node again.
                        if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                            currentArrayIndex++;
                            current = currentArray[currentArrayIndex];
                        }

                        // Nodes.If we don't have a node, or the node we have isn't in the right position,
                        // then try to find a viable node at the position requested.
                        if (!current || current.pos !== position) {
                            findHighestListElementThatStartsAtPosition(position);
                        }
                    }

                    // Nodes.Cache this query so that we don't do any extra work if the parser calls back
                    // into us.  Nodes.Note: this is very common as the parser will make pairs of calls like
                    // 'this.isListElement -> this.parseListElement'.  Nodes.If we were unable to find a node when
                    // called with 'this.isListElement', we don't want to redo the work when this.parseListElement
                    // is called immediately after.
                    lastQueriedPosition = position;

                    // Nodes.Either we don'd have a node, or we have a node at the position being asked for.
                    console.assert(!current || current.pos === position);
                    return <Nodes.IncrementalNode>current;
                }
            };

            // Nodes.Finds the highest element in the tree we can find that starts at the provided position.
            // Nodes.The element must be a direct child of some node list in the tree.  Nodes.This way after we
            // return it, we can easily return its next sibling in the list.
            function findHighestListElementThatStartsAtPosition(position: number) {
                // Nodes.Clear out any cached state about the last node we found.
                currentArray = undefined;
                currentArrayIndex = Nodes.InvalidPosition.Value;
                current = undefined;

                // Nodes.Recurse into the source file to find the highest node at this position.
                forEachChild(this.sourceFile, visitNode, visitArray);
                return;

                function visitNode(node: Nodes.Node) {
                    if (position >= node.pos && position < node.end) {
                        // Nodes.Position was within this node.  Nodes.Keep searching deeper to find the node.
                        forEachChild(node, visitNode, visitArray);

                        // don't proceed any further in the search.
                        return true;
                    }

                    // position wasn't in this node, have to keep searching.
                    return false;
                }

                function visitArray(array: Nodes.NodeList<Nodes.Node>) {
                    if (position >= array.pos && position < array.end) {
                        // position was in this array.  Nodes.Search through this array to see if we find a
                        // viable element.
                        for (let i = 0, n = array.length; i < n; i++) {
                            const child = array[i];
                            if (child) {
                                if (child.pos === position) {
                                    // Nodes.Found the right node.  Nodes.We're done.
                                    currentArray = array;
                                    currentArrayIndex = i;
                                    current = child;
                                    return true;
                                }
                                else {
                                    if (child.pos < position && position < child.end) {
                                        // Nodes.Position in somewhere within this child.  Nodes.Search in it and
                                        // stop searching in this array.
                                        forEachChild(child, visitNode, visitArray);
                                        return true;
                                    }
                                }
                            }
                        }
                    }

                    // position wasn't in this array, have to keep searching.
                    return false;
                }
            }
        }

        private enum Nodes.InvalidPosition {
            Nodes.Value = -1
        }
    }
}
