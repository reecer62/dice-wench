const fs = require('fs')

/**
 * Writes the macros object to a file
 *
 * @param {Object} macros - contains the mappings of macro names to dice rolls
 */
function saveMacros(macros) {
	const macroData = JSON.stringify(macros)
	fs.writeFile('macros.json', macroData, (err) => {
		if (err) console.log(`Macro not added: ${err}`)
		else console.log('Macros saved!')
	})
}

function addMacro(m, r, macros) {
    function trim(s) {
        if(s[0] == '"' && s[s.length - 1] == '"') {
            return s.slice(1, -1)
        } else {
            return s
        }
    }
	console.log('Adding macro: ' + trim(m) + ' => ' + trim(r))
	macros[trim(m)] = trim(r)
	saveMacros(macros)
}

/**
 * Removes a macro from the macros object and saves the change
 *
 * @param {String} macro - name of macro to be removed
 * @param {Object} macros - contains the mappings of macro names to dice rolls
 */
function undef(macro, macros) {
	delete macros[macro]
	saveMacros(macros)
}

/**
 * Substitutes macros for their dice expressions
 *
 * @param {String} text - contains the macros to be replaced
 * @param {Object} macros - contains mappings from macros to dice expressions
 */
function macroSub(text, macros) {
	for (const k in macros) {
		console.log('Key: ' + k)
		console.log('Value: ' + macros[k])
		text = text.replace(new RegExp(k,"g"), macros[k])
	}
	return text
}

module.exports.addMacro = addMacro
module.exports.undef = undef
module.exports.macroSub = macroSub
