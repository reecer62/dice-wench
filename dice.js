function rollD(n, k) {
	if(n != parseInt(n) || k != parseInt(k)) {
		console.log('ERROR: n = ' + n + ', k = ' + k)
		throw 'bad dice expr'
	}
	const rolls = []
	for(let i = 0; i < parseInt(n); ++i) {
		rolls.push(Math.floor(Math.random() * (parseInt(k) - 1)) + 1)
		console.log('Rolled ' + rolls[i])
	}
	return rolls
}

function roll(dstring) {
	const dice = dstring.split('+')
	console.log('dice is: ' + dice)
	const roll = {}
	roll.sum = 0
	roll.rolls = []
	for(let i = 0; i < dice.length; ++i) {
		const d = dice[i]
		console.log('Dice expression segment: ' + d)
		if(d.includes('d')) {
			const pieces = d.split('d')
			const n = pieces[0]
			const k = pieces[1]
			console.log('n = ' + n + ', k = ' + k)
			const res = rollD(n, k)
			console.log('res = ' + res)
			roll.rolls = roll.rolls.concat(res)
		}
		else {
			if(d != parseInt(d)) {
				console.log('ERROR: d = ' + d)
				throw 'bad dice expr'
			}
			console.log('d = ' + d)
			roll.sum += parseInt(d)
		}
	}
	return roll
}

module.exports = roll
