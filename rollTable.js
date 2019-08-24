const { execSync } = require('child_process')
const fs = require('fs')

/**
 * Gets a random line from a file (eg. quotes, bullshit table, madness table)
 *
 * @param {String} fileName - name of file to get a random line from
 */
function rollTable(filename) {
	return new Promise((res, rej) => fs.readFile(filename, 'utf8', (err, data) => { if(err) rej(err); else res(data) }))
	.then(data => {
		const lines = data.split("\n").filter(s => s.length > 0)
		let p = 1, n = 1, current = null
		for(let line of lines) {
			if(Math.random() < p)
				current = line
			n += 1
			p = 1 / n
		}
		return current
	})
}

module.exports = rollTable
