const Discord = require('discord.js')
const auth = require('./auth')
const dice = require('./dice')
const rollTable = require('./rollTable')
const macro = require('./macros')

const bot = new Discord.Client()

let macros

// Removes the !whatever from the front
// For example, if I call scanCommand(!def reece 'this macro')
// it should return ["reece","this macro"]
function scanCommand(cmd) {
	const args = cmd.split(' ').slice(1).join(' ')
	return args.match(/(?:[^\s"]+|"[^"]*")+/g)
}

/**
 * Gets the command from the text
 *
 * @param {String} text - message content
 */
function parseCommand(text) {
	if (text[0] === '!') {
		return text.slice(1).split(/ +/)[0]
	} else {
		return null
	}
}

bot.on('message', msg => {
	if(msg.author.id == bot.user.id) {
		return
	}

	const text = msg.content
	const command = parseCommand(text)
	const args = scanCommand(text)

	switch(command) {
	case 'def':
		if(args.length != 2) {
			msg.channel.send('Macro definition requires exactly 2 arguments, found ' + args.length + '!')
		} else {
			macro.addMacro(args[0], args[1], macros)
		}
		break
	case 'macros':
		msg.channel.send(JSON.stringify(macros))
		break
	case 'undef':
		if(args.length != 1) {
			msg.channel.send('Undef requires exactly 1 argument, found ' + args.length + '!')
		} else {
			macro.undef(args[0], macros)
		}
		break
	case 'roll':
		try {
			const result = dice(args.join(' '))
			const out = result.sum + result.rolls.reduce((a, n) => a + n, 0)
			msg.channel.send(JSON.stringify(result))
			msg.channel.send('You rolled ' + out)
		} catch(err) {
			msg.channel.send('Error: ' + err)
		}
		break
	case 'bullshit':
		const effect = rollTable('NLRMEv2.txt')
		if(args != null && args.length > 0) {
			if(args[0] == 'secret') {
				msg.author.createDM().then((dm) => {
					dm.send('Effect: ' + effect)
				})
			}
		} else {
			msg.channel.send('Effect: ' + effect)
		}
		break
	default:
		msg.channel.send(`Unrecognized command \`${command}\``)
	}

	// console.log(msg.channel.name)
	// console.log(msg.content)
	msg.channel.send(macro.macroSub(msg.content, macros))
})

bot.on('ready', () => {
	console.log('Connected')
	macros = macro.readMacros()
})

bot.login(auth.token)
