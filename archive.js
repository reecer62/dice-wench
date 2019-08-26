const request = require('request')

const root = 'http://dnd.cosi.clarkson.edu/api'

function randomItem() {
	return new Promise((resolve, reject) => {

		request(root + '/Items/random', function(err, resp, body) {

			if (err) {
				reject(err)
			}

			// console.log(resp)

			resolve(JSON.parse(body))

		})

	})
}

function specificItem(name) {
	return new Promise((resolve, reject) => {

		request(root + '/Items/' + name, function(err, resp, body) {

			if (err) {
				reject(err)
			}

			// console.log(resp)

			resolve(JSON.parse(body))

		})

	})
}

function formatItem(item) {
	const name = item['title']
	console.log(item)
	console.log(name)
	const sections = item['body']
	const text = []
	for (const sec in sections) {
		console.log('sec: ' + sec)
		text.push('----------------')
		if (sec !== 'null') {
			text.push('*' + sec + '*')
		}
		text.push(sections[sec])
		if (sections[sec].length > 2000) {
			return {
				'name' : name,
				'text' : ['Item is too large', 'Link: http://' + item['link']],
			}
		}
		console.log('sections: ' + JSON.stringify(sections))
		console.log('sections.sec: ' + sections[sec])
	}
	text.push('----------------')
	text.push('Link: http://' + item['link'])
	return {
		'name' : name,
		'text' : text,
	}
}


module.exports.randomItem = randomItem
module.exports.specificItem = specificItem
module.exports.formatItem = formatItem
