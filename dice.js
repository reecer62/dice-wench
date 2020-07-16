/* I have two words: sorry, and sorry. */

const rollDie = sides => Math.floor(Math.random() * (sides)) + 1
const choose = choices => choices[Math.floor(Math.random() * choices.length)]

const addProps = (o, p) => Object.assign(Object.assign({}, o), p)

/* Promises are just monads, right? */

// eslint-disable-next-line no-unused-vars
const parseTrace = msg => string => {
	console.log(`${msg}: ${string}`)
	return Promise.resolve({ rest: string })
}

const parseTrim = string => Promise.resolve({ rest: string.trimLeft() })

const parseIntRe = /^(\d+)(.*)/
const parseInt = string => new Promise((res, rej) => {
	const matches = parseIntRe.exec(string)
	if (!matches) {
		rej(`No numeric matches: ${string}`)
		return
	}
	const num = Number.parseInt(matches[1])
	if (matches[1] == num) { res({ value: num, rest: matches[2] }) }
	else { rej(`Not a number: ${matches[1]}`) }
})

const parseLiteral = literal => string => new Promise((res, rej) => {
	if (string.startsWith(literal)) { res({ value: literal, rest: string.slice(literal.length) }) }
	else { rej(`Expected ${literal}, found ${string}`) }
})

const parseChain = (parser, init) => string => parser(init)(string)
	.then(parse => parseChain(parser, parse.value)(parse.rest))
	.catch(() => ({ value: init, rest: string }))

const parseSeqRecur = (element, joiner, accum) => string =>
	element(string)
		.then(parse => joiner(parse.rest)
			.then(parse2 => parseSeqRecur(element, joiner, accum.concat({ elem: parse.value, join: parse2.value }))(parse2.rest))
			.catch(() => ({ value: accum.concat({ elem: parse.value }), rest: parse.rest }))
		).catch(() => ({ value: accum, rest: string }))

const parseSeq = (element, joiner) => parseSeqRecur(element, joiner, [])

const parseAltRecur = (...alts) => string => alts.length > 0 ? alts[0](string).catch(() => parseAltRecur(...alts.slice(1))(string)) : Promise.reject(`No alternative succeeded on ${string}.`)

const parseAlt = (...alts) => string => parseAltRecur(...alts)(string)
	.catch(() => Promise.reject(`None of ${alts} succeeded on ${string}.`))

const parseAltChain = (...alts) => obj => string => alts.length > 0 ? alts[0](obj)(string).catch(() => parseAltChain(...alts.slice(1))(obj)(string)) : Promise.reject(`No alternatives suceeded on ${string}.`)

const parseDie = string => parseLiteral('d')(string)
	.then(parse => parseTrim(parse.rest))
	.then(parse => parseInt(parse.rest))
	.then(parse => ({ value: { die: parse.value }, rest: parse.rest }))

const parseIterDie = string => parseInt(string)
	.then(
		parse => parseDie(parse.rest)
			.then(parse2 => ({ value: { iter: parse.value, die: parse2.value.die }, rest: parse2.rest })),
		() => parseDie(string)
			.then(parse => ({ value: { iter: 1, die: parse.value.die }, rest: parse.rest }))
	)

const parseRollProp = (original, name, ...aliases) => string => parseTrim(string)
	.then(parse => parseAlt(parseLiteral(name), ...aliases.map(parseLiteral))(parse.rest))
	.then(parse => parseTrim(parse.rest))
	.then(parse => parseInt(parse.rest))
	.then(parse => ({ value: addProps(original, ({ [name]: parse.value })), rest: parse.rest }))

const parseRollPropChained = (name, ...aliases) => original => parseRollProp(original, name, ...aliases)

const PARSE_TIMES_MAP = { any: 'any', a: 'any', once: 'once', o: 'once' }
const PARSE_KIND_MAP = { upto: 'upto', u: 'upto', downto: 'downto', d: 'downto', exactly: 'exactly', e: 'exactly' }
const parseReroll = original => string => parseTrim(string)
	.then(parse => parseAlt(parseLiteral('reroll'), parseLiteral('r'))(parse.rest))
	.then(parse => parseChain(
		parseAltChain(
			o => s => parseTrim(s)
				.then(parse2 => parseAlt(parseLiteral('any'), parseLiteral('a'), parseLiteral('once'), parseLiteral('o'))(parse2.rest))
				.then(parse2 => ({ value: addProps(o, { times: PARSE_TIMES_MAP[parse2.value] }), rest: parse2.rest })),
			o => s => parseTrim(s)
				.then(parse2 => parseAlt(
					parseLiteral('upto'),
					parseLiteral('u'),
					parseLiteral('downto'),
					parseLiteral('d'),
					parseLiteral('exactly'),
					parseLiteral('e'),
				)(parse2.rest))
				.then(parse2 => parseTrim(parse2.rest)
					.then(parse3 => parseInt(parse3.rest))
					.then(parse3 => ({
						value: addProps(o, {
							reroll: o.reroll.concat({
								times: o.times,
								value: parse3.value,
								kind: PARSE_KIND_MAP[parse2.value],
							}),
						}),
						rest: parse3.rest,
					}))
				),
			o => s => parseTrim(s)
				.then(parse2 => parseInt(parse2.rest))
				.then(parse2 => ({
					value: addProps(o, {
						reroll: o.reroll.concat({
							times: o.times,
							value: parse2.value,
							kind: 'exactly',
						}),
					}),
					rest: parse2.rest,
				})),
		),
		{ times: 'any', reroll: [] })(parse.rest))
	.then(parse => ({
		value: addProps(original, {
			reroll: (original.reroll || []).concat(parse.value.reroll),
		}), rest: parse.rest,
	}))

const SELECTION_MAP = { keep: 'keep', k: 'keep', drop: 'drop', d: 'drop'}
const SELECTION_ENTRIES = ['keep', 'drop', 'k', 'd']
const DIRECTION_MAP = { best: 'best', b: 'best', worst: 'worst', w: 'worst'}
const DIRECTION_ENTRIES = ['best', 'worst', 'b', 'w']
const DEFAULT_FOR_SELECTION = {keep: 'best', drop: 'worst'}
const parseSelection = original => string => parseTrim(string)
	.then(parse => parseAlt(...SELECTION_ENTRIES.map(parseLiteral))(parse.rest))
	.then(parse => parseTrim(parse.rest)
		.then(parse2 => parseAlt(...DIRECTION_ENTRIES.map(parseLiteral))(parse2.rest)
			.then(
				parse3 => ({value: DIRECTION_MAP[parse3.value], rest: parse3.rest}),
				() => ({value: DEFAULT_FOR_SELECTION[SELECTION_MAP[parse.value]], rest: parse2.rest}),
			)
		)
		.then(parse2 => parseTrim(parse2.rest)
			.then(parse3 => parseInt(parse3.rest))
			.then(parse3 => ({value: addProps(original, ({ [SELECTION_MAP[parse.value]]: 
				(original[SELECTION_MAP[parse.value]] || []).concat({
					direction: parse2.value,
					limit: parse3.value,
				})})),
				rest: parse3.rest,
			}))
		)
	)

const parseRollProps = string => parseIterDie(string)
	.then(parse => parseChain(
		parseAltChain(
			parseSelection,
			parseReroll,
		),
		parse.value,
	)(parse.rest))

const parseConst = string => parseInt(string)
	.then(parse => ({ value: { constant: parse.value }, rest: parse.rest }))

const parseParenthesized = string => parseLiteral('(')(string)
	.then(parse => parseExpr(parse.rest))
	.then(parse => parseTrim(parse.rest)
		.then(parse2 => parseLiteral(')')(parse2.rest)
			.catch(() => Promise.reject(`Missing closing parenthesis in ${string}?`))
		)
		.then(parse2 => ({ value: parse.value, rest: parse2.rest }))
	)

const parseExponentiation = parseSeq(
	string => parseTrim(string).then(parse => parseAlt(parseParenthesized, parseRollProps, parseConst)(parse.rest)),
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('**'), parseLiteral('^'), parseLiteral('*^*'))(parse.rest)),
)

const parseFactors = parseSeq(
	parseExponentiation,
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('*'), parseLiteral('/'), parseLiteral('%'))(parse.rest)),
)

const parseTerms = parseSeq(
	parseFactors,
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('+'), parseLiteral('-'))(parse.rest)),
)

const parseBounds = parseSeq(
	parseTerms,
	string => parseTrim(string).then(parse => parseAlt(parseLiteral('min'), parseLiteral('max'))(parse.rest)),
)

const parseExpr = string => parseTrim(string).then(parse => parseBounds(parse.rest))

const parseRelOp = string => parseTrim(string).then(parse => parseAlt(parseLiteral('<'), parseLiteral('<='), parseLiteral('=='), parseLiteral('>='), parseLiteral('>'))(parse.rest))

const parseToplevel = string => parseInt(string)
	.then(
		parse => parseTrim(parse.rest)
			.then(parse2 => parseAlt(parseLiteral('times'), parseLiteral('t'))(parse2.rest))
			.then(parse2 => ({ value: parse.value, rest: parse2.rest }))
	)
	.catch(() => ({ value: 1, rest: string }))
	.then(parse => parseExpr(parse.rest)
		.then(parse2 => parseRelOp(parse2.rest)
			.then(parse3 => parseExpr(parse3.rest)
				.then(parse4 => ({ value: { iterations: parse.value, expr: { rel: parse3.value, left: parse2.value, right: parse4.value } }, rest: parse4.rest }))
			)
			.catch(() => ({ value: { iterations: parse.value, expr: parse2 }, rest: parse2.rest }))
		)
	)

const roll = val => {
	if (val.iterations !== undefined) {
		if (val.iterations == 1) { return addProps(val, { expr: roll(val.expr) }) }
		return addProps(val, { results: Array(val.iterations).fill().map(() => roll(val.expr)) })
	}
	if (val.value) { return roll(val.value) }
	if (Array.isArray(val)) { return val.map(el => addProps(el, { elem: roll(el.elem) })) }
	if (val.die !== undefined) {
		let rolls = undefined, iters = 1
		const lowest = 1
		if (val.iter) iters = val.iter
		if (lowest > val.die) throw `Lowest value ${lowest} invalid for ${val.die} sided dice`
		if (Array.isArray(val.reroll)) {
			let firstDom = Array(val.die).fill().map((_, i) => i + 1)
			let nextDom = firstDom.concat()
			for (const rd of val.reroll) {
				let filt = undefined
				switch (rd.kind) {
				case 'exactly':
					filt = x => x != rd.value
					break
				case 'upto':
					filt = x => x > rd.value
					break
				case 'downto':
					filt = x => x < rd.value
					break
				}
				firstDom = firstDom.filter(filt)
				if (rd.times == 'any') { nextDom = nextDom.filter(filt) }
			}
			if (firstDom.length == 0) throw `Reroll options "${explain(val)}" give no valid roll choices`
			rolls = Array(iters).fill().map(
				() => Math.random() < firstDom.length / val.die ? choose(firstDom) : choose(nextDom)
			)
		} else {
			rolls = Array(iters).fill().map(() => rollDie(val.die))
		}
		rolls.sort((a, b) => a - b)
		let lost = []
		for(const drop of (val.drop || [])) {
			if(drop.direction == 'worst') {
				lost = lost.concat(rolls.slice(0, drop.limit))
				rolls = rolls.slice(drop.limit)
			} else {
				lost = lost.concat(rolls.slice(-drop.limit))
				rolls = rolls.slice(0, -drop.limit)
			}
		}
		for(const keep of (val.keep || [])) {
			if(keep.direction == 'worst') {
				lost = lost.concat(rolls.slice(keep.limit))
				rolls = rolls.slice(0, keep.limit)
			} else {
				lost = lost.concat(rolls.slice(0, -keep.limit))
				rolls = rolls.slice(-keep.limit)
			}
		}
		return addProps(val, { rolls: rolls, lost: lost })
	}
	if (val.rel) { return addProps(val, { left: roll(val.left), right: roll(val.right) }) }
	return val
}

const explain = val => {
	if (val.iterations !== undefined) {
		if (val.iterations == 1) { return explain(val.expr) }
		return `${val.results.map(sub => `${explain(sub)} ${sub.rel ? '' : `_(=${total(sub)})_`}`).join('\n')}`
	}
	if (val.value) { return explain(val.value) }
	if (Array.isArray(val)) {
		if (val.length == 1) { return explain(val[0]) }
		return `(${val.map(explain).join(' ')})`
	}
	if (val.elem) {
		const exp = explain(val.elem)
		if (val.join) { return `${exp} ${val.join}` }
		else { return exp }
	}
	if (val.die !== undefined) {
		let iters = 1
		if (val.iter) iters = val.iter
		let res = iters == 1 ? `d${val.die}` : `${iters}d${val.die}`
		for(const drop of (val.drop || [])) res += ` drop ${drop.direction} ${drop.limit}`
		for(const keep of (val.keep || [])) res += ` keep ${keep.direction} ${keep.limit}`
		if (Array.isArray(val.reroll) && val.reroll.length > 0) {
			res += ' reroll'
			for (const rd of val.reroll) {
				res += ` ${rd.times} ${rd.kind} ${rd.value}`
			}
		}
		if (val.rolls) {
			res += ' ['
			if (val.lost && val.lost.length > 0) { res += `(${val.lost.join(',')},)` }
			res += `${val.rolls.join(',')}=${total(val)}]`
		}
		return res
	}
	if (val.constant !== undefined) { return `${val.constant}` }
	if (val.rel) { return `${explain(val.left)} ${val.rel} ${explain(val.right)} (${total(val) ? '**pass**' : '_fail_'})` }
	return '(not sure how to explain this!)'
}

const BINFUNC_MAP = {
	['+']: (a, b) => a + b,
	['-']: (a, b) => a - b,
	['*']: (a, b) => a * b,
	['/']: (a, b) => a / b,
	['%']: (a, b) => a % b,
	['min']: Math.max,
	['max']: Math.min,
	['**']: Math.pow,
	['^']: Math.pow,
	['*^*']: Math.pow,
}

const RELOP_MAP = {
	['<']: (a, b) => a < b,
	['<=']: (a, b) => a <= b,
	['==']: (a, b) => a == b,
	['>=']: (a, b) => a >= b,
	['>']: (a, b) => a > b,
}

const total = val => {
	if (Array.isArray(val)) {
		const totals = val
			.map(el => ({ total: total(el.elem), op: BINFUNC_MAP[el.join] }))
		if (totals.length == 1) { return totals[0].total }
		return totals.slice(1)
			.reduce((a, b) => ({ total: a.op(a.total, b.total), op: b.op }), totals[0]).total
	}
	if (Array.isArray(val.results)) {
		if (typeof (total(val.results[0])) == 'boolean') {
			const passes = val.results.map(total).filter(x => x).length
			return `(${passes} pass${passes != 1 ? 'es' : ''}, ${val.results.length - passes} fail${passes != val.results.length - 1 ? 's' : ''})`
		}
		return `(${val.results.map(total).reduce((a, b) => a + b, 0)} altogether)`
	}
	if (val.rolls) { return val.rolls.reduce((a, b) => a + b, 0) }
	if (val.expr) { return total(val.expr) }
	if (val.constant !== undefined) { return val.constant }
	if (val.rel) { return RELOP_MAP[val.rel](total(val.left), total(val.right)) }
}

const test = string => parseToplevel(string)
	.then(parse => {
		console.log(parse)
		const result = roll(parse.value)
		console.log(explain(result))
		console.log(total(result))
	})

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
	parseToplevel: parseToplevel,
	roll: roll,
	total: total,
	explain: explain,
	test: test,
}
