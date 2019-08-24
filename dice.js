/* I have two words: sorry, and sorry. */

const rollDie = (min, sides) => Math.floor(Math.random() * (sides - min  - 1)) + min

const addProps = (o, p) => Object.assign(Object.assign({}, o), p)

/* Promises are just monads, right? */

const parseTrace = msg => string => {
	console.log(`${msg}: ${string}`);
	return Promise.resolve({rest: string})
}

const parseTrim = string => {
    console.log("String: " + string)
    return Promise.resolve({rest: string.trimLeft()})
}
const parseIntRe = /^(\d+)(.*)/
const parseInt = string => new Promise((res, rej) => {
	const matches = parseIntRe.exec(string)
	if(!matches) {
		rej(`No numeric matches: ${string}`)
		return
	}
	const num = Number.parseInt(matches[1])
	if(matches[1] == num)
		res({value: num, rest: matches[2]})
	else
		rej(`Not a number: ${matches[1]}`)
})

const parseLiteral = literal => string => new Promise((res, rej) => {
	if(string.startsWith(literal))
		res({value: literal, rest: string.slice(literal.length)})
	else
		rej(`Expected ${literal}, found ${string}`)
})

/* TODO: dead code
const parseMaybe = parser => string => parser(string).catch(() => {rest: string})

const parseRepeatRecur = (parser, accum) => string => parser(string)
	.then(parse => parseRepeatRecur(parser, accum.concat(parse.value))(parse.rest))
	.catch(() => ({value: accum, rest: string}))

const parseRepeat = parser => parseRepeatRecur(parser, [])
*/

const parseChain = (parser, init) => string => parser(init)(string)
	.then(parse => parseChain(parser, parse.value)(parse.rest))
	.catch(() => ({value: init, rest: string}))

const parseSeqRecur = (element, joinder, accum) => string =>
	element(string)
	.then(parse => joinder(parse.rest)
		.then(parse2 => parseSeqRecur(element, joinder, accum.concat({elem: parse.value, join: parse2.value}))(parse2.rest))
		.catch(() => ({value: accum.concat({elem: parse.value}), rest: parse.rest}))
	).catch(() => ({value: accum, rest: string}))

const parseSeq = (element, joinder) => parseSeqRecur(element, joinder, [])

const parseAltRecur = (...alts) => string => alts.length > 0 ? alts[0](string).catch(() => parseAltRecur(...alts.slice(1))(string)) : Promise.reject(`No alternative succeeded on ${string}.`)

const parseAlt = (...alts) => string => parseAltRecur(...alts)(string)
	.catch(() => Promise.reject(`None of ${alts} succeeded on ${string}.`))

const parseAltChain = (...alts) => obj => string => alts.length > 0 ? alts[0](obj)(string).catch(() => parseAltChain(...alts.slice(1))(obj)(string)) : Promise.reject(`No alternatives suceeded on ${string}.`)

const parseDie = string => parseLiteral("d")(string)
	.then(parse => parseTrim(parse.rest))
	.then(parse => parseInt(parse.rest))
	.then(parse => ({value: {die: parse.value}, rest: parse.rest}))

const parseIterDie = string => parseInt(string)
	.then(
		parse => parseDie(parse.rest)
			.then(parse2 => ({value: {iter: parse.value, die: parse2.value.die}, rest: parse2.rest})),
		() => parseDie(string)
			.then(parse => ({value: {iter: 1, die: parse.value.die}, rest: parse.rest}))
	)

const parseRollProp = (original, name, ...aliases) => string => parseTrim(string)
	.then(parse => parseAlt(parseLiteral(name), ...aliases.map(parseLiteral))(parse.rest))
	.then(parse => parseTrim(parse.rest))
	.then(parse => parseInt(parse.rest))
	.then(parse => ({value: addProps(original, ({[name]: parse.value})), rest: parse.rest}))

const parseRollPropChained = (name, ...aliases) => original => parseRollProp(original, name, ...aliases)

const parseRollProps = string => parseIterDie(string)
	.then(parse => parseChain(
		parseAltChain(
			parseRollPropChained("keep", "k"),
			parseRollPropChained("drop", "d"),
			parseRollPropChained("reroll", "r"),
		),
		parse.value,
	)(parse.rest))

const parseConst = string => parseInt(string)
	.then(parse => ({value: {constant: parse.value}, rest: parse.rest}))

const parseFactors = parseSeq(
	string => parseTrim(string).then(parse => parseAlt(parseRollProps, parseConst)(parse.rest)),
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('*'), parseLiteral('/'), parseLiteral('%'))(parse.rest)),
)

const parseTerms = parseSeq(
	parseFactors,
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('+'), parseLiteral('-'))(parse.rest)),
)

const parseExpr = parseTerms

const roll = val => {
	if(val.value)
		return roll(val.value)
	if(Array.isArray(val))
		return val.map(el => addProps(el, {elem: roll(el.elem)}))
	if(val.die) {
		let iters = 1, lowest = 1
		if(val.iter) iters = val.iter
		if(val.reroll) lowest = val.reroll
		if(lowest >= val.die) throw `Reroll ${lowest} invalid for ${val.die} sided dice`
		let rolls = Array(iters).fill().map(() => rollDie(lowest, val.die)).sort((a, b) => a - b)
		let lost = []
		if(val.drop) {
			lost = lost.concat(rolls.slice(0, val.drop))
			rolls = rolls.slice(val.drop)
		}
		if(val.keep) {
			lost = lost.concat(rolls.slice(0, -val.keep))
			rolls = rolls.slice(-val.keep)
		}
		return addProps(val, {rolls: rolls, lost: lost})
	}
	return val
}

const explain = val => {
	if(val.value)
		return explain(val.value)
	if(Array.isArray(val))
		return val.map(explain).join(" ")
	if(val.elem) {
		let exp = explain(val.elem)
		if(val.join)
			return `${exp} ${val.join}`
		else
			return exp
	}
	if(val.die) {
		let iters = 1
		if(val.iter) iters = val.iter
		let res = iters == 1 ? `d${val.die}` : `${iters}d${val.die}`
		if(val.drop) res += ` drop ${val.drop}`
		if(val.keep) res += ` keep ${val.keep}`
		if(val.reroll) res += ` reroll ${val.reroll}`
		if(val.rolls) {
			res += " ["
			if(val.lost && val.lost.length > 0)
				res += `(${val.lost.join(",")},)`
			res += `${val.rolls.join(",")}=${total(val)}]`
		}
		return res
	}
	if(val.constant)
		return `${val.constant}`
	return "(not sure how to explain this!)"
}

const BINFUNC_MAP = {
	['+']: (a, b) => a + b,
	['-']: (a, b) => a - b,
	['*']: (a, b) => a * b,
	['/']: (a, b) => a / b,
	['%']: (a, b) => a % b,
}

const total = val => {
	if(Array.isArray(val)) {
		const totals = val
			.map(el => ({total: total(el.elem), op: BINFUNC_MAP[el.join]}))
		if(totals.length == 1)
			return totals[0].total
		return totals.slice(1)
			.reduce((a, b) => ({total: a.op(a.total, b.total), op: b.op}), totals[0]).total
	}
	if(val.rolls)
		return val.rolls.reduce((a, b) => a + b, 0)
	if(val.constant)
		return val.constant
}

module.exports = {
	addProps: addProps,
	parseTrim: parseTrim,
	parseLiteral: parseLiteral,
	parseAltChain: parseAltChain,
	parseChain: parseChain,
	parseDie: parseDie,
	parseIterDie: parseIterDie,
	parseRollProps: parseRollProps,
	parseConst: parseConst,
	parseFactors: parseFactors,
	parseTerms: parseTerms,
	parseExpr: parseExpr,
	roll: roll,
	total: total,
	explain: explain,
}
