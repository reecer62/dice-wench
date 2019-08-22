const { execSync } = require('child_process')

function bullshit() {
	const bs = execSync('py bullshit.py')
	console.log('BS: ' + bs)
	return bs
}

module.exports = bullshit
