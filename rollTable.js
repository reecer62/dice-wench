const { execSync } = require('child_process')

/**
 * Gets a random line from a file (eg. quotes, bullshit table, madness table)
 *
 * @param {String} fileName - name of file to get a random line from
 */
function rollTable(fileName) {
	return execSync(`py rollTable.py ${fileName}`)
}

module.exports = rollTable
