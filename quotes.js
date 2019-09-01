const fs = require('fs')

/**
 * Saves quotes to json file
 *
 * @param {Array} quotes - list of quotes
 */
function saveQuotes(quotes) {
	const quoteData = JSON.stringify(quotes)
	fs.writeFile('quotes.json', quoteData, (err) => {
		if (err) console.log(`Quote not added: ${err}`)
		else console.log('Quotes saved!')
	})
}

/**
 * Adds a quote
 *
 * @param {String} quote - string containing the quote and the author
 * @param {Array} quotes - list of quotes
 */
function addQuote(quote, quotes) {
	const matches = quote.match(/(".*") -(.*)/)
	if (matches === null) {
		return false
	}
	quotes.push({
		'text': matches[1],
		'author': matches[2],
	})
	saveQuotes(quotes)
	return true
}

/**
 * Gets a random quote from the quote list
 *
 * @param {Array} list - contains an array of quote objects
 */
function choice(list) {
	return list[Math.floor(Math.random() * list.length)]
}

/**
 * Gets quote that matches querying parameters
 *
 * @param {String} text - string containing quote to filter for
 * @param {Boolean} author - boolean value for whether to query by author or not
 * @param {Array} quotes - list of quotes
 */
function searchQuote(text, author, quotes) {
	if (author) {
		const matches = quotes.filter(q => q.author.includes(text))
		console.log('Matches: ' + matches)
		if (matches.length > 0) {
			return choice(matches)
		} else {
			return null
		}
	} else {
		const matches = quotes.filter(q => q.text.includes(text))
		console.log('Matches: ' + matches)
		if (matches.length > 0) {
			return choice(matches)
		} else {
			return null
		}
	}
}

module.exports.saveQuotes = saveQuotes
module.exports.addQuote = addQuote
module.exports.searchQuote = searchQuote
