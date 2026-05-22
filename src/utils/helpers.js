/**
 * Capitalizes the first letter of each word in a name.
 * @param {string} name 
 * @returns {string}
 */
export const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
