export function camelCase(string: string) {
    return string
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        // Checks if the matched substring is numeric or consists of white spaces
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        
        // Converts the matched substring to lowercase if it is the first character,
        // otherwise converts it to uppercase
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      })
      .replace(/-/g, ''); // Remove "-" characters
  }

export function slugify(string: string) {
    return string
        .toLowerCase() // Converts the string to lowercase
        .trim() // Removes leading and trailing whitespaces
        .replace(/[^\w\s-]/g, '') // Removes any characters that are not alphanumeric, whitespace, or hyphen
        .replace(/[\s_-]+/g, '-') // Replaces multiple consecutive whitespaces, underscores, or hyphens with a single hyphen
        .replace(/^-+|-+$/g, ''); // Removes any leading or trailing hyphens
}