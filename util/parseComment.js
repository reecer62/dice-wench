/**
 * Splits the message into strings starting with the "!" character
 * Slices the array of strings to obtain the last string which contains the comment
 *
 * @param {String} text - message content
 */
module.exports = function(text) {
	if (text.indexOf('!') === -1) {
		return null
	} else {
		return text.slice(text.indexOf('!') + 1)
	}
}
