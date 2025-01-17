//@ts-check

/**
 * Formats a duration in milliseconds as a string in the format 'HH:MM:SS'
 * @param {number|string} milliseconds The duration in milliseconds to format
 * @returns {string} The formatted time string
 */
function formatTime(milliseconds) {
    if (typeof milliseconds === 'string') {
        milliseconds = parseInt(milliseconds, 10);
    }
    const hours = (milliseconds / 3600000) | 0;
    const minutes = ((milliseconds % 3600000) / 60000) | 0;
    const seconds = ((milliseconds % 60000) / 1000) | 0;
    return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

/**
 * Test if a CSS property and value are supported by the browser
 * Used as an additional layer of protection against XSS and injection attacks
 * @param {string} property the CSS property to check
 * @param {string|number} value the value to check against the property
 * @returns {boolean} Indicates support for the CSS property and value
 */
function isValidCSSRule(property, value) {
    return CSS.supports(property, value.toString());
}

/**
 * Replace non-breaking spaces with regular spaces in a string
 * @param {string} string The string to remove non-breaking spaces from
 * @returns {string} The string with non-breaking spaces replaced by regular spaces
 */
function removeNoBreakSpace(string) {
    return string.replace(/\u00A0/g, ' ');
}

/**
 * Generates a hash from the given string containing the lowercase characters a-j.
 * Based on the classic Java String hashCode algorithm.
 * T
 * @param {string} [string=''] The string to hash
 * @returns {string} The generated hash
 */
function javaCharacterHash(string = '') {
    let hashValue = 0;
    const length = string.length;
	for (let index = 0; index < length; index++) {
		const charCode = string.charCodeAt(index);
		hashValue = (hashValue << 5) - hashValue + charCode;
        hashValue |= 0;
	}
    const digits = Math.abs(hashValue).toString();
    let hash = '';
    for (let index = 0; index < digits.length; index++) {
      hash += 'abcdefghij'[digits.charCodeAt(index) - 48];
    }
	return hash;
}

/**
 * Removes all children from the given element.
 * @param {HTMLElement} element The parent element to remove children from
 * @returns {HTMLElement} The parent element with all children removed
 */
function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}
