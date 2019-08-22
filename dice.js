function rollD(n,k) {
    if(n != parseInt(n) || k != parseInt(k)) {
        console.log("ERROR: n = " + n + ", k = " + k)
        throw "bad dice expr"
    }
    let rolls = []
    for(var i = 0; i < parseInt(n); ++i) {
        rolls.push(Math.floor(Math.random()*(parseInt(k)-1))+1)
        console.log("Rolled " + rolls[i])
    }
    return rolls
}

function roll(dstring) {
    let dice = dstring.split("+")
    console.log("dice is: " + dice)
    let roll = {}
    roll.sum = 0
    roll.rolls = []
    for(var i = 0; i < dice.length; ++i) {
        let d = dice[i]
        console.log("Dice expression segment: " + d)
        if(d.includes("d")) {
            let pieces = d.split("d")
            let n = pieces[0]
            let k = pieces[1]
            console.log("n = " + n + ", k = " + k)
            let res = rollD(n,k)
            console.log("res = " + res)
            roll.rolls = roll.rolls.concat(res)
        }
        else {
            if(d != parseInt(d)) {
                console.log("ERROR: d = " + d)
                throw "bad dice expr"
            }
            console.log("d = " + d)
            roll.sum += parseInt(d)
        }
    }
    return roll
}

module.exports = roll
