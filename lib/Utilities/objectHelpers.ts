/**
 * Returns the deep value in an object, i.e. path = "item.author.name" will return the "name" attribute
 * from the author object nested in the item object
*/
export function deepValue(path: string, obj: object): any {
    return path.split('.').reduce((p: any, c) => p && p[c] || '', obj)
}