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

function diceTerms(dstring) {
    let terms = []
    let exp = ""
    let pos = true
    while(dstring.length > 0) {
        let c = dstring[0]
        console.log(c,exp,pos)
        dstring = dstring.slice(1)
        switch(c) {
            case "+":
                terms.push({
                    "exp":exp,
                    "sign":pos
                })
                pos = true
                exp = ""
                break
            case "-":
                terms.push({
                    "exp":exp,
                    "sign":pos
                })
                exp = ""
                pos = false
                break
            default:
                exp += c
        }
    }
    terms.push({
        "exp":exp,
        "sign":pos
    })
    console.log("terms is " + terms)
    return terms
}

function rollDice(dstring) {
	let dice = diceTerms(dstring)//.split(/(+|-)/g)
	console.log('dice is: ' + dice)
	const roll = {}
	roll.sum = 0
	roll.rolls = []
	for(let i = 0; i < dice.length; ++i) {
		const term = dice[i]
        let d = term.exp
		console.log('Dice expression segment: ' + d)
		if(d.includes('d')) {
			const pieces = d.split('d')
			const n = pieces[0]
			const k = pieces[1]
			console.log('n = ' + n + ', k = ' + k)
			const res = rollD(n, k)
			console.log('res = ' + res)
            if(!term.sign){
                roll.rolls = roll.rolls.concat(res.map(x => -x))
            }
            else{
			    roll.rolls = roll.rolls.concat(res)
		    }
        } else {
			if(d != parseInt(d)) {
				console.log('ERROR: d = ' + d)
				throw 'bad dice expr'
			}
			console.log('d = ' + d)
            if(!term.sign){
                roll.sum -= parseInt(d)
            }
            else {
			    roll.sum += parseInt(d)
            }
		}
	}
	return roll
}

module.exports = rollDice
