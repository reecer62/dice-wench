/**
 * Gets the words from the text delimited by spaces (but still respecting quotes (but not escaped quotes)) and returns the arguments
 *
 * @param {String} text - message content
 */
module.exports = function(text) {
	return text.match(/(?:[^\s"]+|"[^"]*")+/g)
}