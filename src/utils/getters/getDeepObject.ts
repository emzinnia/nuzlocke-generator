// https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-object
export function getDeepObject(theObject, n) {
    let result = null;
    if (theObject instanceof Array) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < theObject.length; i++) {
            result = getDeepObject(theObject[i], n);
            if (result) {
                break;
            }
        }
    } else {
        for (const prop in theObject) {
            if (prop === n) {
                return theObject;
            }
            if (
                theObject[prop] instanceof Object ||
                theObject[prop] instanceof Array
            ) {
                result = getDeepObject(theObject[prop], n);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
}
