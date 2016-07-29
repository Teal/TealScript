/// <reference path="types.ts"/>
/// <reference path="../del.ts"/>
/* @internal */
var ts;
(function (ts) {
    function createFileMap(keyMapper) {
        var files = {};
        return {
            get: get,
            set: set,
            contains: contains,
            remove: remove,
            forEachValue: forEachValueInMap,
            clear: clear,
        };
        function forEachValueInMap(f) {
            for (var key in files) {
                f(key, files[key]);
            }
        }
        // path should already be well-formed so it does not need to be normalized
        function get(path) {
            return files[toKey(path)];
        }
        function set(path, value) {
            files[toKey(path)] = value;
        }
        function contains(path) {
            return hasProperty(files, toKey(path));
        }
        function remove(path) {
            var key = toKey(path);
            delete files[key];
        }
        function clear() {
            files = {};
        }
        function toKey(path) {
            return keyMapper ? keyMapper(path) : path;
        }
    }
    ts.createFileMap = createFileMap;
    function toPath(fileName, basePath, getCanonicalFileName) {
        var nonCanonicalizedPath = isRootedDiskPath(fileName)
            ? normalizePath(fileName)
            : getNormalizedAbsolutePath(fileName, basePath);
        return getCanonicalFileName(nonCanonicalizedPath);
    }
    ts.toPath = toPath;
    /**
     * Iterates through 'array' by index and performs the callback on each element of array until the callback
     * returns a truthy value, then returns that value.
     * If no such value is found, the callback is applied to each element of array and undefined is returned.
     */
    function forEach(array, callback) {
        if (array) {
            for (var i = 0, len = array.length; i < len; i++) {
                var result = callback(array[i], i);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
    ts.forEach = forEach;
    function contains(array, value, areEqual) {
        if (array) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (areEqual ? areEqual(v, value) : v === value) {
                    return true;
                }
            }
        }
        return false;
    }
    ts.contains = contains;
    function indexOf(array, value) {
        if (array) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
        }
        return -1;
    }
    ts.indexOf = indexOf;
    function indexOfAnyCharCode(text, charCodes, start) {
        for (var i = start || 0, len = text.length; i < len; i++) {
            if (contains(charCodes, text.charCodeAt(i))) {
                return i;
            }
        }
        return -1;
    }
    ts.indexOfAnyCharCode = indexOfAnyCharCode;
    function countWhere(array, predicate) {
        var count = 0;
        if (array) {
            for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                var v = array_2[_i];
                if (predicate(v)) {
                    count++;
                }
            }
        }
        return count;
    }
    ts.countWhere = countWhere;
    function filter(array, f) {
        var result;
        if (array) {
            result = [];
            for (var _i = 0, array_3 = array; _i < array_3.length; _i++) {
                var item = array_3[_i];
                if (f(item)) {
                    result.push(item);
                }
            }
        }
        return result;
    }
    ts.filter = filter;
    function filterMutate(array, f) {
        var outIndex = 0;
        for (var _i = 0, array_4 = array; _i < array_4.length; _i++) {
            var item = array_4[_i];
            if (f(item)) {
                array[outIndex] = item;
                outIndex++;
            }
        }
        array.length = outIndex;
    }
    ts.filterMutate = filterMutate;
    function map(array, f) {
        var result;
        if (array) {
            result = [];
            for (var _i = 0, array_5 = array; _i < array_5.length; _i++) {
                var v = array_5[_i];
                result.push(f(v));
            }
        }
        return result;
    }
    ts.map = map;
    function concatenate(array1, array2) {
        if (!array2 || !array2.length)
            return array1;
        if (!array1 || !array1.length)
            return array2;
        return array1.concat(array2);
    }
    ts.concatenate = concatenate;
    function deduplicate(array, areEqual) {
        var result;
        if (array) {
            result = [];
            for (var _i = 0, array_6 = array; _i < array_6.length; _i++) {
                var item = array_6[_i];
                if (!contains(result, item, areEqual)) {
                    result.push(item);
                }
            }
        }
        return result;
    }
    ts.deduplicate = deduplicate;
    function sum(array, prop) {
        var result = 0;
        for (var _i = 0, array_7 = array; _i < array_7.length; _i++) {
            var v = array_7[_i];
            result += v[prop];
        }
        return result;
    }
    ts.sum = sum;
    function addRange(to, from) {
        if (to && from) {
            for (var _i = 0, from_1 = from; _i < from_1.length; _i++) {
                var v = from_1[_i];
                to.push(v);
            }
        }
    }
    ts.addRange = addRange;
    function rangeEquals(array1, array2, pos, end) {
        while (pos < end) {
            if (array1[pos] !== array2[pos]) {
                return false;
            }
            pos++;
        }
        return true;
    }
    ts.rangeEquals = rangeEquals;
    /**
     * Returns the last element of an array if non-empty, undefined otherwise.
     */
    function lastOrUndefined(array) {
        if (array.length === 0) {
            return undefined;
        }
        return array[array.length - 1];
    }
    ts.lastOrUndefined = lastOrUndefined;
    /**
     * Performs a binary search, finding the index at which 'value' occurs in 'array'.
     * If no such index is found, returns the 2's-complement of first index at which
     * number[index] exceeds number.
     * @param array A sorted array whose first element must be no larger than number
     * @param number The value to be searched for in the array.
     */
    function binarySearch(array, value) {
        var low = 0;
        var high = array.length - 1;
        while (low <= high) {
            var middle = low + ((high - low) >> 1);
            var midValue = array[middle];
            if (midValue === value) {
                return middle;
            }
            else if (midValue > value) {
                high = middle - 1;
            }
            else {
                low = middle + 1;
            }
        }
        return ~low;
    }
    ts.binarySearch = binarySearch;
    function reduceLeft(array, f, initial) {
        if (array) {
            var count = array.length;
            if (count > 0) {
                var pos = 0;
                var result = void 0;
                if (arguments.length <= 2) {
                    result = array[pos];
                    pos++;
                }
                else {
                    result = initial;
                }
                while (pos < count) {
                    result = f(result, array[pos]);
                    pos++;
                }
                return result;
            }
        }
        return initial;
    }
    ts.reduceLeft = reduceLeft;
    function reduceRight(array, f, initial) {
        if (array) {
            var pos = array.length - 1;
            if (pos >= 0) {
                var result = void 0;
                if (arguments.length <= 2) {
                    result = array[pos];
                    pos--;
                }
                else {
                    result = initial;
                }
                while (pos >= 0) {
                    result = f(result, array[pos]);
                    pos--;
                }
                return result;
            }
        }
        return initial;
    }
    ts.reduceRight = reduceRight;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasProperty(map, key) {
        return hasOwnProperty.call(map, key);
    }
    ts.hasProperty = hasProperty;
    function getKeys(map) {
        var keys = [];
        for (var key in map) {
            keys.push(key);
        }
        return keys;
    }
    ts.getKeys = getKeys;
    function getProperty(map, key) {
        return hasOwnProperty.call(map, key) ? map[key] : undefined;
    }
    ts.getProperty = getProperty;
    function isEmpty(map) {
        for (var id in map) {
            if (hasProperty(map, id)) {
                return false;
            }
        }
        return true;
    }
    ts.isEmpty = isEmpty;
    function clone(object) {
        var result = {};
        for (var id in object) {
            result[id] = object[id];
        }
        return result;
    }
    ts.clone = clone;
    function extend(first, second) {
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!hasProperty(result, id)) {
                result[id] = second[id];
            }
        }
        return result;
    }
    ts.extend = extend;
    function forEachValue(map, callback) {
        var result;
        for (var id in map) {
            if (result = callback(map[id]))
                break;
        }
        return result;
    }
    ts.forEachValue = forEachValue;
    function forEachKey(map, callback) {
        var result;
        for (var id in map) {
            if (result = callback(id))
                break;
        }
        return result;
    }
    ts.forEachKey = forEachKey;
    function lookUp(map, key) {
        return hasProperty(map, key) ? map[key] : undefined;
    }
    ts.lookUp = lookUp;
    function copyMap(source, target) {
        for (var p in source) {
            target[p] = source[p];
        }
    }
    ts.copyMap = copyMap;
    /**
     * Creates a map from the elements of an array.
     *
     * @param array the array of input elements.
     * @param makeKey a function that produces a key for a given element.
     *
     * This function makes no effort to avoid collisions; if any two elements produce
     * the same key with the given 'makeKey' function, then the element with the higher
     * index in the array will be the one associated with the produced key.
     */
    function arrayToMap(array, makeKey) {
        var result = {};
        forEach(array, function (value) {
            result[makeKey(value)] = value;
        });
        return result;
    }
    ts.arrayToMap = arrayToMap;
    /**
     * Reduce the properties of a map.
     *
     * @param map The map to reduce
     * @param callback An aggregation function that is called for each entry in the map
     * @param initial The initial value for the reduction.
     */
    function reduceProperties(map, callback, initial) {
        var result = initial;
        if (map) {
            for (var key in map) {
                if (hasProperty(map, key)) {
                    result = callback(result, map[key], String(key));
                }
            }
        }
        return result;
    }
    ts.reduceProperties = reduceProperties;
    /**
     * Tests whether a value is an array.
     */
    function isArray(value) {
        return Array.isArray ? Array.isArray(value) : value instanceof Array;
    }
    ts.isArray = isArray;
    function memoize(callback) {
        var value;
        return function () {
            if (callback) {
                value = callback();
                callback = undefined;
            }
            return value;
        };
    }
    ts.memoize = memoize;
    function formatStringFromArgs(text, args, baseIndex) {
        baseIndex = baseIndex || 0;
        return text.replace(/{(\d+)}/g, function (match, index) { return args[+index + baseIndex]; });
    }
    ts.localizedDiagnosticMessages = undefined;
    function getLocaleSpecificMessage(message) {
        return ts.localizedDiagnosticMessages && ts.localizedDiagnosticMessages[message.key]
            ? ts.localizedDiagnosticMessages[message.key]
            : message.message;
    }
    ts.getLocaleSpecificMessage = getLocaleSpecificMessage;
    function createFileDiagnostic(file, start, length, message) {
        var end = start + length;
        Debug.assert(start >= 0, "start must be non-negative, is " + start);
        Debug.assert(length >= 0, "length must be non-negative, is " + length);
        if (file) {
            Debug.assert(start <= file.text.length, "start must be within the bounds of the file. " + start + " > " + file.text.length);
            Debug.assert(end <= file.text.length, "end must be the bounds of the file. " + end + " > " + file.text.length);
        }
        var text = getLocaleSpecificMessage(message);
        if (arguments.length > 4) {
            text = formatStringFromArgs(text, arguments, 4);
        }
        return {
            file: file,
            start: start,
            length: length,
            messageText: text,
            category: message.category,
            code: message.code,
        };
    }
    ts.createFileDiagnostic = createFileDiagnostic;
    /* internal */
    function formatMessage(dummy, message) {
        var text = getLocaleSpecificMessage(message);
        if (arguments.length > 2) {
            text = formatStringFromArgs(text, arguments, 2);
        }
        return text;
    }
    ts.formatMessage = formatMessage;
    function createCompilerDiagnostic(message) {
        var text = getLocaleSpecificMessage(message);
        if (arguments.length > 1) {
            text = formatStringFromArgs(text, arguments, 1);
        }
        return {
            file: undefined,
            start: undefined,
            length: undefined,
            messageText: text,
            category: message.category,
            code: message.code
        };
    }
    ts.createCompilerDiagnostic = createCompilerDiagnostic;
    function chainDiagnosticMessages(details, message) {
        var text = getLocaleSpecificMessage(message);
        if (arguments.length > 2) {
            text = formatStringFromArgs(text, arguments, 2);
        }
        return {
            messageText: text,
            category: message.category,
            code: message.code,
            next: details
        };
    }
    ts.chainDiagnosticMessages = chainDiagnosticMessages;
    function concatenateDiagnosticMessageChains(headChain, tailChain) {
        var lastChain = headChain;
        while (lastChain.next) {
            lastChain = lastChain.next;
        }
        lastChain.next = tailChain;
        return headChain;
    }
    ts.concatenateDiagnosticMessageChains = concatenateDiagnosticMessageChains;
    function compareValues(a, b) {
        if (a === b)
            return 0 /* EqualTo */;
        if (a === undefined)
            return -1 /* LessThan */;
        if (b === undefined)
            return 1 /* GreaterThan */;
        return a < b ? -1 /* LessThan */ : 1 /* GreaterThan */;
    }
    ts.compareValues = compareValues;
    function compareStrings(a, b, ignoreCase) {
        if (a === b)
            return 0 /* EqualTo */;
        if (a === undefined)
            return -1 /* LessThan */;
        if (b === undefined)
            return 1 /* GreaterThan */;
        if (ignoreCase) {
            if (String.prototype.localeCompare) {
                var result = a.localeCompare(b, /*locales*/ undefined, { usage: "sort", sensitivity: "accent" });
                return result < 0 ? -1 /* LessThan */ : result > 0 ? 1 /* GreaterThan */ : 0 /* EqualTo */;
            }
            a = a.toUpperCase();
            b = b.toUpperCase();
            if (a === b)
                return 0 /* EqualTo */;
        }
        return a < b ? -1 /* LessThan */ : 1 /* GreaterThan */;
    }
    ts.compareStrings = compareStrings;
    function compareStringsCaseInsensitive(a, b) {
        return compareStrings(a, b, /*ignoreCase*/ true);
    }
    ts.compareStringsCaseInsensitive = compareStringsCaseInsensitive;
    function getDiagnosticFileName(diagnostic) {
        return diagnostic.file ? diagnostic.file.fileName : undefined;
    }
    function compareDiagnostics(d1, d2) {
        return compareValues(getDiagnosticFileName(d1), getDiagnosticFileName(d2)) ||
            compareValues(d1.start, d2.start) ||
            compareValues(d1.length, d2.length) ||
            compareValues(d1.code, d2.code) ||
            compareMessageText(d1.messageText, d2.messageText) ||
            0 /* EqualTo */;
    }
    ts.compareDiagnostics = compareDiagnostics;
    function compareMessageText(text1, text2) {
        while (text1 && text2) {
            // We still have both chains.
            var string1 = typeof text1 === "string" ? text1 : text1.messageText;
            var string2 = typeof text2 === "string" ? text2 : text2.messageText;
            var res = compareValues(string1, string2);
            if (res) {
                return res;
            }
            text1 = typeof text1 === "string" ? undefined : text1.next;
            text2 = typeof text2 === "string" ? undefined : text2.next;
        }
        if (!text1 && !text2) {
            // if the chains are done, then these messages are the same.
            return 0 /* EqualTo */;
        }
        // We still have one chain remaining.  The shorter chain should come first.
        return text1 ? 1 /* GreaterThan */ : -1 /* LessThan */;
    }
    function sortAndDeduplicateDiagnostics(diagnostics) {
        return deduplicateSortedDiagnostics(diagnostics.sort(compareDiagnostics));
    }
    ts.sortAndDeduplicateDiagnostics = sortAndDeduplicateDiagnostics;
    function deduplicateSortedDiagnostics(diagnostics) {
        if (diagnostics.length < 2) {
            return diagnostics;
        }
        var newDiagnostics = [diagnostics[0]];
        var previousDiagnostic = diagnostics[0];
        for (var i = 1; i < diagnostics.length; i++) {
            var currentDiagnostic = diagnostics[i];
            var isDupe = compareDiagnostics(currentDiagnostic, previousDiagnostic) === 0 /* EqualTo */;
            if (!isDupe) {
                newDiagnostics.push(currentDiagnostic);
                previousDiagnostic = currentDiagnostic;
            }
        }
        return newDiagnostics;
    }
    ts.deduplicateSortedDiagnostics = deduplicateSortedDiagnostics;
    function normalizeSlashes(path) {
        return path.replace(/\\/g, "/");
    }
    ts.normalizeSlashes = normalizeSlashes;
    // Returns length of path root (i.e. length of "/", "x:/", "//server/share/, file:///user/files")
    function getRootLength(path) {
        if (path.charCodeAt(0) === ts.CharCode.slash) {
            if (path.charCodeAt(1) !== ts.CharCode.slash)
                return 1;
            var p1 = path.indexOf("/", 2);
            if (p1 < 0)
                return 2;
            var p2 = path.indexOf("/", p1 + 1);
            if (p2 < 0)
                return p1 + 1;
            return p2 + 1;
        }
        if (path.charCodeAt(1) === ts.CharCode.colon) {
            if (path.charCodeAt(2) === ts.CharCode.slash)
                return 3;
            return 2;
        }
        // Per RFC 1738 'file' URI schema has the shape file://<host>/<path>
        // if <host> is omitted then it is assumed that host value is 'localhost',
        // however slash after the omitted <host> is not removed.
        // file:///folder1/file1 - this is a correct URI
        // file://folder2/file2 - this is an incorrect URI
        if (path.lastIndexOf("file:///", 0) === 0) {
            return "file:///".length;
        }
        var idx = path.indexOf("://");
        if (idx !== -1) {
            return idx + "://".length;
        }
        return 0;
    }
    ts.getRootLength = getRootLength;
    ts.directorySeparator = "/";
    function getNormalizedParts(normalizedSlashedPath, rootLength) {
        var parts = normalizedSlashedPath.substr(rootLength).split(ts.directorySeparator);
        var normalized = [];
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (part !== ".") {
                if (part === ".." && normalized.length > 0 && lastOrUndefined(normalized) !== "..") {
                    normalized.pop();
                }
                else {
                    // A part may be an empty string (which is 'falsy') if the path had consecutive slashes,
                    // e.g. "path//file.ts".  Drop these before re-joining the parts.
                    if (part) {
                        normalized.push(part);
                    }
                }
            }
        }
        return normalized;
    }
    function normalizePath(path) {
        path = normalizeSlashes(path);
        var rootLength = getRootLength(path);
        var normalized = getNormalizedParts(path, rootLength);
        return path.substr(0, rootLength) + normalized.join(ts.directorySeparator);
    }
    ts.normalizePath = normalizePath;
    function getDirectoryPath(path) {
        return path.substr(0, Math.max(getRootLength(path), path.lastIndexOf(ts.directorySeparator)));
    }
    ts.getDirectoryPath = getDirectoryPath;
    function isUrl(path) {
        return path && !isRootedDiskPath(path) && path.indexOf("://") !== -1;
    }
    ts.isUrl = isUrl;
    function isRootedDiskPath(path) {
        return getRootLength(path) !== 0;
    }
    ts.isRootedDiskPath = isRootedDiskPath;
    function normalizedPathComponents(path, rootLength) {
        var normalizedParts = getNormalizedParts(path, rootLength);
        return [path.substr(0, rootLength)].concat(normalizedParts);
    }
    function getNormalizedPathComponents(path, currentDirectory) {
        path = normalizeSlashes(path);
        var rootLength = getRootLength(path);
        if (rootLength === 0) {
            // If the path is not rooted it is relative to current directory
            path = combinePaths(normalizeSlashes(currentDirectory), path);
            rootLength = getRootLength(path);
        }
        return normalizedPathComponents(path, rootLength);
    }
    ts.getNormalizedPathComponents = getNormalizedPathComponents;
    function getNormalizedAbsolutePath(fileName, currentDirectory) {
        return getNormalizedPathFromPathComponents(getNormalizedPathComponents(fileName, currentDirectory));
    }
    ts.getNormalizedAbsolutePath = getNormalizedAbsolutePath;
    function getNormalizedPathFromPathComponents(pathComponents) {
        if (pathComponents && pathComponents.length) {
            return pathComponents[0] + pathComponents.slice(1).join(ts.directorySeparator);
        }
    }
    ts.getNormalizedPathFromPathComponents = getNormalizedPathFromPathComponents;
    function getNormalizedPathComponentsOfUrl(url) {
        // Get root length of http://www.website.com/folder1/folder2/
        // In this example the root is:  http://www.website.com/
        // normalized path components should be ["http://www.website.com/", "folder1", "folder2"]
        var urlLength = url.length;
        // Initial root length is http:// part
        var rootLength = url.indexOf("://") + "://".length;
        while (rootLength < urlLength) {
            // Consume all immediate slashes in the protocol
            // eg.initial rootlength is just file:// but it needs to consume another "/" in file:///
            if (url.charCodeAt(rootLength) === ts.CharCode.slash) {
                rootLength++;
            }
            else {
                // non slash character means we continue proceeding to next component of root search
                break;
            }
        }
        // there are no parts after http:// just return current string as the pathComponent
        if (rootLength === urlLength) {
            return [url];
        }
        // Find the index of "/" after website.com so the root can be http://www.website.com/ (from existing http://)
        var indexOfNextSlash = url.indexOf(ts.directorySeparator, rootLength);
        if (indexOfNextSlash !== -1) {
            // Found the "/" after the website.com so the root is length of http://www.website.com/
            // and get components after the root normally like any other folder components
            rootLength = indexOfNextSlash + 1;
            return normalizedPathComponents(url, rootLength);
        }
        else {
            // Can't find the host assume the rest of the string as component
            // but make sure we append "/"  to it as root is not joined using "/"
            // eg. if url passed in was http://website.com we want to use root as [http://website.com/]
            // so that other path manipulations will be correct and it can be merged with relative paths correctly
            return [url + ts.directorySeparator];
        }
    }
    function getNormalizedPathOrUrlComponents(pathOrUrl, currentDirectory) {
        if (isUrl(pathOrUrl)) {
            return getNormalizedPathComponentsOfUrl(pathOrUrl);
        }
        else {
            return getNormalizedPathComponents(pathOrUrl, currentDirectory);
        }
    }
    function getRelativePathToDirectoryOrUrl(directoryPathOrUrl, relativeOrAbsolutePath, currentDirectory, getCanonicalFileName, isAbsolutePathAnUrl) {
        var pathComponents = getNormalizedPathOrUrlComponents(relativeOrAbsolutePath, currentDirectory);
        var directoryComponents = getNormalizedPathOrUrlComponents(directoryPathOrUrl, currentDirectory);
        if (directoryComponents.length > 1 && lastOrUndefined(directoryComponents) === "") {
            // If the directory path given was of type test/cases/ then we really need components of directory to be only till its name
            // that is  ["test", "cases", ""] needs to be actually ["test", "cases"]
            directoryComponents.length--;
        }
        // Find the component that differs
        var joinStartIndex;
        for (joinStartIndex = 0; joinStartIndex < pathComponents.length && joinStartIndex < directoryComponents.length; joinStartIndex++) {
            if (getCanonicalFileName(directoryComponents[joinStartIndex]) !== getCanonicalFileName(pathComponents[joinStartIndex])) {
                break;
            }
        }
        // Get the relative path
        if (joinStartIndex) {
            var relativePath = "";
            var relativePathComponents = pathComponents.slice(joinStartIndex, pathComponents.length);
            for (; joinStartIndex < directoryComponents.length; joinStartIndex++) {
                if (directoryComponents[joinStartIndex] !== "") {
                    relativePath = relativePath + ".." + ts.directorySeparator;
                }
            }
            return relativePath + relativePathComponents.join(ts.directorySeparator);
        }
        // Cant find the relative path, get the absolute path
        var absolutePath = getNormalizedPathFromPathComponents(pathComponents);
        if (isAbsolutePathAnUrl && isRootedDiskPath(absolutePath)) {
            absolutePath = "file:///" + absolutePath;
        }
        return absolutePath;
    }
    ts.getRelativePathToDirectoryOrUrl = getRelativePathToDirectoryOrUrl;
    function getBaseFileName(path) {
        if (path === undefined) {
            return undefined;
        }
        var i = path.lastIndexOf(ts.directorySeparator);
        return i < 0 ? path : path.substring(i + 1);
    }
    ts.getBaseFileName = getBaseFileName;
    function combinePaths(path1, path2) {
        if (!(path1 && path1.length))
            return path2;
        if (!(path2 && path2.length))
            return path1;
        if (getRootLength(path2) !== 0)
            return path2;
        if (path1.charAt(path1.length - 1) === ts.directorySeparator)
            return path1 + path2;
        return path1 + ts.directorySeparator + path2;
    }
    ts.combinePaths = combinePaths;
    /**
     * Removes a trailing directory separator from a path.
     * @param path The path.
     */
    function removeTrailingDirectorySeparator(path) {
        if (path.charAt(path.length - 1) === ts.directorySeparator) {
            return path.substr(0, path.length - 1);
        }
        return path;
    }
    ts.removeTrailingDirectorySeparator = removeTrailingDirectorySeparator;
    /**
     * Adds a trailing directory separator to a path, if it does not already have one.
     * @param path The path.
     */
    function ensureTrailingDirectorySeparator(path) {
        if (path.charAt(path.length - 1) !== ts.directorySeparator) {
            return path + ts.directorySeparator;
        }
        return path;
    }
    ts.ensureTrailingDirectorySeparator = ensureTrailingDirectorySeparator;
    function comparePaths(a, b, currentDirectory, ignoreCase) {
        if (a === b)
            return 0 /* EqualTo */;
        if (a === undefined)
            return -1 /* LessThan */;
        if (b === undefined)
            return 1 /* GreaterThan */;
        a = removeTrailingDirectorySeparator(a);
        b = removeTrailingDirectorySeparator(b);
        var aComponents = getNormalizedPathComponents(a, currentDirectory);
        var bComponents = getNormalizedPathComponents(b, currentDirectory);
        var sharedLength = Math.min(aComponents.length, bComponents.length);
        for (var i = 0; i < sharedLength; i++) {
            var result = compareStrings(aComponents[i], bComponents[i], ignoreCase);
            if (result !== 0 /* EqualTo */) {
                return result;
            }
        }
        return compareValues(aComponents.length, bComponents.length);
    }
    ts.comparePaths = comparePaths;
    function containsPath(parent, child, currentDirectory, ignoreCase) {
        if (parent === undefined || child === undefined)
            return false;
        if (parent === child)
            return true;
        parent = removeTrailingDirectorySeparator(parent);
        child = removeTrailingDirectorySeparator(child);
        if (parent === child)
            return true;
        var parentComponents = getNormalizedPathComponents(parent, currentDirectory);
        var childComponents = getNormalizedPathComponents(child, currentDirectory);
        if (childComponents.length < parentComponents.length) {
            return false;
        }
        for (var i = 0; i < parentComponents.length; i++) {
            var result = compareStrings(parentComponents[i], childComponents[i], ignoreCase);
            if (result !== 0 /* EqualTo */) {
                return false;
            }
        }
        return true;
    }
    ts.containsPath = containsPath;
    function fileExtensionIs(path, extension) {
        var pathLen = path.length;
        var extLen = extension.length;
        return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
    }
    ts.fileExtensionIs = fileExtensionIs;
    function fileExtensionIsAny(path, extensions) {
        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
            var extension = extensions_1[_i];
            if (fileExtensionIs(path, extension)) {
                return true;
            }
        }
        return false;
    }
    ts.fileExtensionIsAny = fileExtensionIsAny;
    // Reserved characters, forces escaping of any non-word (or digit), non-whitespace character.
    // It may be inefficient (we could just match (/[-[\]{}()*+?.,\\^$|#\s]/g), but this is future
    // proof.
    var reservedCharacterPattern = /[^\w\s\/]/g;
    var wildcardCharCodes = [ts.CharCode.asterisk, ts.CharCode.question];
    function getRegularExpressionForWildcard(specs, basePath, usage) {
        if (specs === undefined || specs.length === 0) {
            return undefined;
        }
        var pattern = "";
        var hasWrittenSubpattern = false;
        spec: for (var _i = 0, specs_1 = specs; _i < specs_1.length; _i++) {
            var spec = specs_1[_i];
            if (!spec) {
                continue;
            }
            var subpattern = "";
            var hasRecursiveDirectoryWildcard = false;
            var hasWrittenComponent = false;
            var components = getNormalizedPathComponents(spec, basePath);
            if (usage !== "exclude" && components[components.length - 1] === "**") {
                continue spec;
            }
            // getNormalizedPathComponents includes the separator for the root component.
            // We need to remove to create our regex correctly.
            components[0] = removeTrailingDirectorySeparator(components[0]);
            var optionalCount = 0;
            for (var _a = 0, components_1 = components; _a < components_1.length; _a++) {
                var component = components_1[_a];
                if (component === "**") {
                    if (hasRecursiveDirectoryWildcard) {
                        continue spec;
                    }
                    subpattern += "(/.+?)?";
                    hasRecursiveDirectoryWildcard = true;
                    hasWrittenComponent = true;
                }
                else {
                    if (usage === "directories") {
                        subpattern += "(";
                        optionalCount++;
                    }
                    if (hasWrittenComponent) {
                        subpattern += ts.directorySeparator;
                    }
                    subpattern += component.replace(reservedCharacterPattern, replaceWildcardCharacter);
                    hasWrittenComponent = true;
                }
            }
            while (optionalCount > 0) {
                subpattern += ")?";
                optionalCount--;
            }
            if (hasWrittenSubpattern) {
                pattern += "|";
            }
            pattern += "(" + subpattern + ")";
            hasWrittenSubpattern = true;
        }
        if (!pattern) {
            return undefined;
        }
        return "^(" + pattern + (usage === "exclude" ? ")($|/)" : ")$");
    }
    ts.getRegularExpressionForWildcard = getRegularExpressionForWildcard;
    function replaceWildcardCharacter(match) {
        return match === "*" ? "[^/]*" : match === "?" ? "[^/]" : "\\" + match;
    }
    function getFileMatcherPatterns(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory) {
        path = normalizePath(path);
        currentDirectory = normalizePath(currentDirectory);
        var absolutePath = combinePaths(currentDirectory, path);
        return {
            includeFilePattern: getRegularExpressionForWildcard(includes, absolutePath, "files"),
            includeDirectoryPattern: getRegularExpressionForWildcard(includes, absolutePath, "directories"),
            excludePattern: getRegularExpressionForWildcard(excludes, absolutePath, "exclude"),
            basePaths: getBasePaths(path, includes, useCaseSensitiveFileNames)
        };
    }
    ts.getFileMatcherPatterns = getFileMatcherPatterns;
    function matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory, getFileSystemEntries) {
        path = normalizePath(path);
        currentDirectory = normalizePath(currentDirectory);
        var patterns = getFileMatcherPatterns(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory);
        var regexFlag = useCaseSensitiveFileNames ? "" : "i";
        var includeFileRegex = patterns.includeFilePattern && new RegExp(patterns.includeFilePattern, regexFlag);
        var includeDirectoryRegex = patterns.includeDirectoryPattern && new RegExp(patterns.includeDirectoryPattern, regexFlag);
        var excludeRegex = patterns.excludePattern && new RegExp(patterns.excludePattern, regexFlag);
        var result = [];
        for (var _i = 0, _a = patterns.basePaths; _i < _a.length; _i++) {
            var basePath = _a[_i];
            visitDirectory(basePath, combinePaths(currentDirectory, basePath));
        }
        return result;
        function visitDirectory(path, absolutePath) {
            var _a = getFileSystemEntries(path), files = _a.files, directories = _a.directories;
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var current = files_1[_i];
                var name_1 = combinePaths(path, current);
                var absoluteName = combinePaths(absolutePath, current);
                if ((!extensions || fileExtensionIsAny(name_1, extensions)) &&
                    (!includeFileRegex || includeFileRegex.test(absoluteName)) &&
                    (!excludeRegex || !excludeRegex.test(absoluteName))) {
                    result.push(name_1);
                }
            }
            for (var _b = 0, directories_1 = directories; _b < directories_1.length; _b++) {
                var current = directories_1[_b];
                var name_2 = combinePaths(path, current);
                var absoluteName = combinePaths(absolutePath, current);
                if ((!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName)) &&
                    (!excludeRegex || !excludeRegex.test(absoluteName))) {
                    visitDirectory(name_2, absoluteName);
                }
            }
        }
    }
    ts.matchFiles = matchFiles;
    /**
     * Computes the unique non-wildcard base paths amongst the provided include patterns.
     */
    function getBasePaths(path, includes, useCaseSensitiveFileNames) {
        // Storage for our results in the form of literal paths (e.g. the paths as written by the user).
        var basePaths = [path];
        if (includes) {
            // Storage for literal base paths amongst the include patterns.
            var includeBasePaths = [];
            for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
                var include = includes_1[_i];
                // We also need to check the relative paths by converting them to absolute and normalizing
                // in case they escape the base path (e.g "..\somedirectory")
                var absolute = isRootedDiskPath(include) ? include : normalizePath(combinePaths(path, include));
                var wildcardOffset = indexOfAnyCharCode(absolute, wildcardCharCodes);
                var includeBasePath = wildcardOffset < 0
                    ? removeTrailingDirectorySeparator(getDirectoryPath(absolute))
                    : absolute.substring(0, absolute.lastIndexOf(ts.directorySeparator, wildcardOffset));
                // Append the literal and canonical candidate base paths.
                includeBasePaths.push(includeBasePath);
            }
            // Sort the offsets array using either the literal or canonical path representations.
            includeBasePaths.sort(useCaseSensitiveFileNames ? compareStrings : compareStringsCaseInsensitive);
            // Iterate over each include base path and include unique base paths that are not a
            // subpath of an existing base path
            include: for (var i = 0; i < includeBasePaths.length; i++) {
                var includeBasePath = includeBasePaths[i];
                for (var j = 0; j < basePaths.length; j++) {
                    if (containsPath(basePaths[j], includeBasePath, path, !useCaseSensitiveFileNames)) {
                        continue include;
                    }
                }
                basePaths.push(includeBasePath);
            }
        }
        return basePaths;
    }
    function ensureScriptKind(fileName, scriptKind) {
        // Using scriptKind as a condition handles both:
        // - 'scriptKind' is unspecified and thus it is `undefined`
        // - 'scriptKind' is set and it is `Unknown` (0)
        // If the 'scriptKind' is 'undefined' or 'Unknown' then we attempt
        // to get the ScriptKind from the file name. If it cannot be resolved
        // from the file name then the default 'TS' script kind is returned.
        return (scriptKind || getScriptKindFromFileName(fileName)) || 3 /* TS */;
    }
    ts.ensureScriptKind = ensureScriptKind;
    function getScriptKindFromFileName(fileName) {
        var ext = fileName.substr(fileName.lastIndexOf("."));
        switch (ext.toLowerCase()) {
            case ".js":
                return 1 /* JS */;
            case ".jsx":
                return 2 /* JSX */;
            case ".ts":
                return 3 /* TS */;
            case ".tsx":
                return 4 /* TSX */;
            default:
                return 0 /* Unknown */;
        }
    }
    ts.getScriptKindFromFileName = getScriptKindFromFileName;
    /**
     *  List of supported extensions in order of file resolution precedence.
     */
    ts.supportedTypeScriptExtensions = [".ts", ".tsx", ".d.ts"];
    ts.supportedJavascriptExtensions = [".js", ".jsx"];
    var allSupportedExtensions = ts.supportedTypeScriptExtensions.concat(ts.supportedJavascriptExtensions);
    function getSupportedExtensions(options) {
        return options && options.allowJs ? allSupportedExtensions : ts.supportedTypeScriptExtensions;
    }
    ts.getSupportedExtensions = getSupportedExtensions;
    function isSupportedSourceFileName(fileName, compilerOptions) {
        if (!fileName) {
            return false;
        }
        for (var _i = 0, _a = getSupportedExtensions(compilerOptions); _i < _a.length; _i++) {
            var extension = _a[_i];
            if (fileExtensionIs(fileName, extension)) {
                return true;
            }
        }
        return false;
    }
    ts.isSupportedSourceFileName = isSupportedSourceFileName;
    function getExtensionPriority(path, supportedExtensions) {
        for (var i = supportedExtensions.length - 1; i >= 0; i--) {
            if (fileExtensionIs(path, supportedExtensions[i])) {
                return adjustExtensionPriority(i);
            }
        }
        // If its not in the list of supported extensions, this is likely a
        // TypeScript file with a non-ts extension
        return 0 /* Highest */;
    }
    ts.getExtensionPriority = getExtensionPriority;
    /**
     * Adjusts an extension priority to be the highest priority within the same range.
     */
    function adjustExtensionPriority(extensionPriority) {
        if (extensionPriority < 2 /* DeclarationAndJavaScriptFiles */) {
            return 0 /* TypeScriptFiles */;
        }
        else if (extensionPriority < 5 /* Limit */) {
            return 2 /* DeclarationAndJavaScriptFiles */;
        }
        else {
            return 5 /* Limit */;
        }
    }
    ts.adjustExtensionPriority = adjustExtensionPriority;
    /**
     * Gets the next lowest extension priority for a given priority.
     */
    function getNextLowestExtensionPriority(extensionPriority) {
        if (extensionPriority < 2 /* DeclarationAndJavaScriptFiles */) {
            return 2 /* DeclarationAndJavaScriptFiles */;
        }
        else {
            return 5 /* Limit */;
        }
    }
    ts.getNextLowestExtensionPriority = getNextLowestExtensionPriority;
    var extensionsToRemove = [".d.ts", ".ts", ".js", ".tsx", ".jsx"];
    function removeFileExtension(path) {
        for (var _i = 0, extensionsToRemove_1 = extensionsToRemove; _i < extensionsToRemove_1.length; _i++) {
            var ext = extensionsToRemove_1[_i];
            var extensionless = tryRemoveExtension(path, ext);
            if (extensionless !== undefined) {
                return extensionless;
            }
        }
        return path;
    }
    ts.removeFileExtension = removeFileExtension;
    function tryRemoveExtension(path, extension) {
        return fileExtensionIs(path, extension) ? path.substring(0, path.length - extension.length) : undefined;
    }
    ts.tryRemoveExtension = tryRemoveExtension;
    function isJsxOrTsxExtension(ext) {
        return ext === ".jsx" || ext === ".tsx";
    }
    ts.isJsxOrTsxExtension = isJsxOrTsxExtension;
    function changeExtension(path, newExtension) {
        return (removeFileExtension(path) + newExtension);
    }
    ts.changeExtension = changeExtension;
    function Symbol(flags, name) {
        this.flags = flags;
        this.name = name;
        this.declarations = undefined;
    }
    function Type(checker, flags) {
        this.flags = flags;
    }
    function Signature(checker) {
    }
    function Node(kind, pos, end) {
        this.kind = kind;
        this.pos = pos;
        this.end = end;
        this.flags = 0 /* None */;
        this.parent = undefined;
    }
    ts.objectAllocator = {
        getNodeConstructor: function () { return Node; },
        getSourceFileConstructor: function () { return Node; },
        getSymbolConstructor: function () { return Symbol; },
        getTypeConstructor: function () { return Type; },
        getSignatureConstructor: function () { return Signature; }
    };
    var Debug;
    (function (Debug) {
        var currentAssertionLevel = 0 /* None */;
        function shouldAssert(level) {
            return currentAssertionLevel >= level;
        }
        Debug.shouldAssert = shouldAssert;
        function assert(expression, message, verboseDebugInfo) {
            if (!expression) {
                var verboseDebugString = "";
                if (verboseDebugInfo) {
                    verboseDebugString = "\r\nVerbose Debug Information: " + verboseDebugInfo();
                }
                debugger;
                throw new Error("Debug Failure. False expression: " + (message || "") + verboseDebugString);
            }
        }
        Debug.assert = assert;
        function fail(message) {
            Debug.assert(/*expression*/ false, message);
        }
        Debug.fail = fail;
    })(Debug = ts.Debug || (ts.Debug = {}));
    function copyListRemovingItem(item, list) {
        var copiedList = [];
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var e = list_1[_i];
            if (e !== item) {
                copiedList.push(e);
            }
        }
        return copiedList;
    }
    ts.copyListRemovingItem = copyListRemovingItem;
    function createGetCanonicalFileName(useCaseSensitivefileNames) {
        return useCaseSensitivefileNames
            ? (function (fileName) { return fileName; })
            : (function (fileName) { return fileName.toLowerCase(); });
    }
    ts.createGetCanonicalFileName = createGetCanonicalFileName;
})(ts || (ts = {}));
//# sourceMappingURL=core.js.map