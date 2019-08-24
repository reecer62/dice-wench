const fs = require('fs')

function saveQuotes(quotes) {
    const quoteData = JSON.stringify(quotes)
	fs.writeFile('quotes.json', quoteData, (err) => {
		if (err) console.log(`Quote not added: ${err}`)
		else console.log('Quotes saved!')
	})
}

function addQuote(quote,quotes) {
    let matches = quote.match(/(\".*\") -(.*)/)
    if(matches == null) {
        return false
    }
    quotes.push({
        "text" : matches[1],
        "author" : matches[2]
    }) //mutates quotes
    saveQuotes(quotes)
    return true
}

function choice(list) {
    return list[Math.floor(Math.random()*list.length)]
}

function searchQuote(text,author,quotes) {
    //author is a boolean meaning whether to search the author or not
    if(author) {
        let matches = quotes.filter(q => q.author.includes(text))
        console.log("Matches: " + matches)
        if(matches.length > 0)
            return choice(matches)
        else
            return ""
    } else {
        let matches = quotes.filter(q => q.text.includes(text))
        console.log("Matches: " + matches)
        if(matches.length > 0)
            return choice(matches)
        else
            return ""
    }
}

module.exports.saveQuotes = saveQuotes
module.exports.addQuote = addQuote
module.exports.searchQuote = searchQuote
