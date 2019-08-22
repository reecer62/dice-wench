const fs = require('fs')

function readMacros() {
	const macros = require('./macros.json')
	console.log('Loaded macros: ' + JSON.stringify(macros))
	return macros
}

function saveMacros(macros) {
	const macrodata = JSON.stringify(macros)
	fs.writeFile('macros.json', macrodata, (err) => {
		if (err) console.log('Macro not added: ' + err)
		else console.log('Macros saved!')
	})
}

function addMacro(m, r, macros) {
	/*
        function trim(s) {
            if(s[0] == '"' && s[s.length - 1] == '"') {
                return s.slice(1, -1)
            }
            else {
                return s
            }
        }
        */
	console.log('Adding macro: ' + m + ' => ' + r)
	macros[m] = r
	saveMacros(macros)
}

function undef(m, macros) {
	delete macros[m]
	saveMacros(macros)
}

function macroSub(text, macros) {
	for (const k in macros) {
		console.log('Key: ' + k)
		console.log('Value: ' + macros[k])
		text = text.replace(k, macros[k])
	}
	return text
}

module.exports.readMacros = readMacros
module.exports.addMacro = addMacro
module.exports.undef = undef
module.exports.macroSub = macroSub