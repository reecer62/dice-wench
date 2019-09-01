/* eslint-env mocha */

const assert = require('assert')
const parseArgs = require('../../util/parseArgs')
const parseComment = require('../../util/parseComment')

describe('Util Tests', function() {

	describe('#parseArgs()', function() {
		it('should return an array of strings representing parsed arguments', function(done) {
			assert.deepEqual(['arg1', 'arg2', 'arg3'], parseArgs('arg1 arg2 arg3'))
			done()
		})
	})

	describe('#parseComment()', function() {
		it('should return the comment from the text', function(done) {
			const text = 'roll 2d20 + 10 !test comment! test'
			assert.strictEqual('test comment! test', parseComment(text))
			done()
		})

		it('should return null when no comment is present', function(done) {
			const text = 'roll 2d20 + 10'
			assert.strictEqual(null, parseComment(text))
			done()
		})
	})
})