const { execSync } = require('child_process')

/**
 * Gets a random line from a file (eg. quotes, bullshit table, madness table)
 *
 * @param {String} fileName - name of file to get a random line from
 */
function bullshit(fileName) {
	const bs = execSync(`py bullshit.py ${fileName}`)
	console.log('BS: ' + bs)
	return bs
}

module.exports = bullshit
