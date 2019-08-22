const { execSync } = require('child_process')

function bullshit(fileName) {
	const bs = execSync(`py bullshit.py ${fileName}`)
	console.log('BS: ' + bs)
	return bs
}

module.exports = bullshit
