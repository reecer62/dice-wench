const Discord = require('discord.js')
const auth = require('./auth')
const dice = require('./dice')
const rollTable = require('./rollTable')
const macro = require('./macros')
const quote = require('./quotes')
const archive = require('./archive')
const parseArgs = require('./util/parseArgs')
const parseComment = require('./util/parseComment')
const api_lookup = require('./api_lookup')

const bot = new Discord.Client()

let macros
let quotes

/**
 * Sends a message to the author of the message that called the bot
 *
 * @param {Message} source - discord's Message object
 * @param {String} message - message to send in a dm
 */
function sendDirect(source, message) {
	source.author.createDM().then((dm) => {
		dm.send(message)
	})
}

subs=[[":interrobang: ","!?"],[":exclamation: ","!"],[":question: ","?"],[":one: ","1"],[":two: ","2"],[":three: ","3"],[":four: ","4"],[":five: ","5"],[":six: ","6"],[":seven: ","7"],[":eight: ","8"],[":nine: ","9"],[":zero: ","0"],[":o2: ","o"],[":o2: ","O"],[":abcd: ","abcd"],[":new: ","new"],[":free: ","free"],[":atm: ","atm"],[":wc: ","wc"],[":ng: ","ng"],[":up: ","up"],[":cool: ","cool"],[":sos: ","sos"],[":ab: ","ab"],[":vs: ","vs"],[":cl: ","cl"],[":b: ","b"],[":a: ","a"],[":x: ","x"],[":regional_indicator_a: ","a"],[":regional_indicator_b: ","b"],[":regional_indicator_c: ","c"],[":regional_indicator_d: ","d"],[":regional_indicator_e: ","e"],[":regional_indicator_f: ","f"],[":regional_indicator_g: ","g"],[":regional_indicator_h: ","h"],[":regional_indicator_i: ","i"],[":regional_indicator_j: ","j"],[":regional_indicator_k: ","k"],[":regional_indicator_l: ","l"],[":regional_indicator_m: ","m"],[":regional_indicator_n: ","n"],[":regional_indicator_o: ","o"],[":regional_indicator_p: ","p"],[":regional_indicator_q: ","q"],[":regional_indicator_r: ","r"],[":regional_indicator_s: ","s"],[":regional_indicator_t: ","t"],[":regional_indicator_u: ","u"],[":regional_indicator_v: ","v"],[":regional_indicator_w: ","w"],[":regional_indicator_x: ","x"],[":regional_indicator_y: ","y"],[":regional_indicator_z: ","z"]]
for(i in subs)
	subs[i][0]=RegExp(subs[i][0],'g')
function demojify(w){
	for(i in subs){
		s=subs[i]
		l=s[0]
		r=s[1]
		w=w.replace(l,r)
	}
	w=w.replace(/   /g,' ')
	w=w.replace(/^ /g,'')
	return w
}


/**
 * Bot listens for event in which a message is sent in the channel and reacts to commands
 * Commands:
 * def - adds a macro
 * macros - lists currently stored macros, a macro is used to define a roll to a string
 * undef - deletes a macro
 * roll - takes dice expression and performs the operation of rolling dice
 * bullshit - gets a random effect from the Net Libram of Random Magical Effects
 * madness - gets a random effect from either short/long term madness table
 * quoteadd - adds a quote
 * quote - retrieves a quote
 * item - gets an item from DnD_Archive
 *
 * @param {Message} msg - Discord's Message object
 */
bot.on('message', msg => {
	// Don't look at messages from the bot
	if (msg.author.id === bot.user.id) {
		return
	}

	// Check if message is a command
	let text = msg.content
	text=demojify(text) // replace emojis with the charachters they represent
	if (text.startsWith('!')) {
		text = text.slice(1)
	} else if (text.toLowerCase().startsWith('wench, ')) {
		text = text.slice(7)
	} else {
		return
	}

	// Get the command, comment, and args from the message
	const command = text.split(/ +/)[0]
	text = text.replace(command, '')
	// console.log('COMMAND: ' + command)
	// console.log('TEXT: `' + text + '`')
	const comment = parseComment(text)
	text = text.replace('!' + comment, '')
	// console.log('COMMENT: ' + comment)
	// console.log('TEXT: `' + text + '`')
	const args = parseArgs(text)
	// console.log('ARGS: ' + args)
	// console.log('TEXT: `' + text + '`')

	switch (command) {
	case 'def':
		if (args.length !== 2) {
			msg.channel.send(`Macro definition requires exactly 2 arguments, found ${args.length}!`)
		} else if (args[0] !== 'undef') {
			macro.addMacro(args[0], args[1], macros)
		} else {
			msg.channel.send('boi')
		}
		break
	case 'macros':
		msg.channel.send(JSON.stringify(macros))
		break
	case 'undef':
		if (args.length !== 1) {
			msg.channel.send(`Undef requires exactly 1 argument, found ${args.length}!'`)
		} else {
			macro.undef(args[0], macros)
		}
		break
	case 'roll':

		const m_args = macro.macroSub(args.join(' '), macros)
		// console.log('m_args: ' + m_args)
		dice.parseToplevel(m_args).then(parse => {
			const rolls = dice.roll(parse.value)
			msg.channel.send(`${dice.explain(rolls)} = ${dice.total(rolls)}`)
		}, err => msg.channel.send(`Error: ${err}`))
		break
	case 'bullshit':
		rollTable('tables/NLRMEv2.txt').then(effect => {
			if (args !== null && args.includes('secret')) {
				sendDirect(msg, `Effect: ${effect}`)
			} else {
				msg.channel.send(`Effect: ${effect}`)
			}
		})
		break
	case 'madness':
		if (args !== null) {
			let prm
			if (args.includes('short')) {
				prm = rollTable('tables/short-madness.txt')
			} else if (args.includes('long')) {
				prm = rollTable('tables/long-madness.txt')
			} else {
				return
			}
			prm.then(effect => {
				if (args.includes('secret')) {
					sendDirect(msg, `Effect: ${effect}`)
				} else {
					msg.channel.send(`Effect: ${effect}`)
				}
			})
		}
		break
	case 'quoteadd':
		if (args !== null && args.length === 2) {
			const ret = quote.addQuote(args.join(' '), quotes)
			if (ret) {
				msg.channel.send('Quote added!')
			} else {
				msg.channel.send('Error: incorrect format!\nFormat: `!quoteadd "<quote text>" -<name>`')
			}
		} else {
			msg.channel.send('Error: incorrect format!\nFormat: `!quoteadd "<quote text>" -<name>`')
		}
		break
	case 'quote':
		let s = ''
		if (args !== null) {
			s = args.join(' ')
		}
		let quoteget
		if (s.startsWith('author:')) {
			quoteget = quote.searchQuote(s.slice(7), true, quotes)
		} else {
			quoteget = quote.searchQuote(s, false, quotes)
		}
		if (quoteget !== null) {
			msg.channel.send(`> ${quoteget.text}\n- ${quoteget.author}`)
		} else {
			msg.channel.send('No quotes found with that pattern\nTo search by author, use format: `!quote author:<name>`')
		}
		break
	case 'item':
		if (args !== null && args.length > 0) {
			archive.specificItem(args.join(' ')).then((item) => {
				const fmt = archive.formatItem(item)
				msg.channel.send('**' + fmt.name + '**')
				for (let i = 0; i < fmt.text.length; ++i) {
					msg.channel.send(fmt.text[i])
				}
			})
		} else {
			archive.randomItem().then((item) => {
				const fmt = archive.formatItem(item)
				msg.channel.send('**' + fmt.name + '**')
				for (let i = 0; i < fmt.text.length; ++i) {
					msg.channel.send(fmt.text[i])
				}
			})
		}
		break
    case 'spell':
            api_lookup.random_spell().then(s => {
                let m = "**"+s.name+"**\n"+s.desc
                if(m.length > 2000) {
                    msg.channel.send("**"+s.name+"**\nDescription too long")
                } else {
                    msg.channel.send(m)
                }
            })
            break
	default:
		msg.channel.send(`Unrecognized command \`${command}\``)
	}

	if (comment !== null) {
		msg.channel.send('Reason: `' + comment + '`')
	}
})

/**
 * Bot connects and is able to react to information received from Discord
 * Loads the macros
 * Loads the quotes
 */
bot.on('ready', () => {
	console.log('Connected')
	macros = macro.loadMacros('./macros.json')
	quotes = quote.loadQuotes('./quotes.json')
})

bot.login(auth.token)
