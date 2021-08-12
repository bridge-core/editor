function normalizeArray(parts, allowAboveRoot) {
	var up = 0
	for (var i = parts.length - 1; i >= 0; i--) {
		var last = parts[i]
		if (last === '.') {
			parts.splice(i, 1)
		} else if (last === '..') {
			parts.splice(i, 1)
			up++
		} else if (up) {
			parts.splice(i, 1)
			up--
		}
	}
	if (allowAboveRoot) {
		for (; up--; up) {
			parts.unshift('..')
		}
	}
	return parts
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
var splitPath = function (filename) {
	return splitPathRe.exec(filename).slice(1)
}
function resolve() {
	var resolvedPath = '',
		resolvedAbsolute = false
	for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		var path2 = i >= 0 ? arguments[i] : '/'
		if (typeof path2 !== 'string') {
			throw new TypeError('Arguments to path.resolve must be strings')
		} else if (!path2) {
			continue
		}
		resolvedPath = path2 + '/' + resolvedPath
		resolvedAbsolute = path2.charAt(0) === '/'
	}
	resolvedPath = normalizeArray(
		filter(resolvedPath.split('/'), function (p) {
			return !!p
		}),
		!resolvedAbsolute
	).join('/')
	return (resolvedAbsolute ? '/' : '') + resolvedPath || '.'
}
function normalize(path2) {
	var isPathAbsolute = isAbsolute(path2),
		trailingSlash = substr(path2, -1) === '/'
	path2 = normalizeArray(
		filter(path2.split('/'), function (p) {
			return !!p
		}),
		!isPathAbsolute
	).join('/')
	if (!path2 && !isPathAbsolute) {
		path2 = '.'
	}
	if (path2 && trailingSlash) {
		path2 += '/'
	}
	return (isPathAbsolute ? '/' : '') + path2
}
function isAbsolute(path2) {
	return path2.charAt(0) === '/'
}
function join() {
	var paths = Array.prototype.slice.call(arguments, 0)
	return normalize(
		filter(paths, function (p, index) {
			if (typeof p !== 'string') {
				throw new TypeError('Arguments to path.join must be strings')
			}
			return p
		}).join('/')
	)
}
function relative(from, to) {
	from = resolve(from).substr(1)
	to = resolve(to).substr(1)
	function trim(arr) {
		var start = 0
		for (; start < arr.length; start++) {
			if (arr[start] !== '') break
		}
		var end = arr.length - 1
		for (; end >= 0; end--) {
			if (arr[end] !== '') break
		}
		if (start > end) return []
		return arr.slice(start, end - start + 1)
	}
	var fromParts = trim(from.split('/'))
	var toParts = trim(to.split('/'))
	var length = Math.min(fromParts.length, toParts.length)
	var samePartsLength = length
	for (var i = 0; i < length; i++) {
		if (fromParts[i] !== toParts[i]) {
			samePartsLength = i
			break
		}
	}
	var outputParts = []
	for (var i = samePartsLength; i < fromParts.length; i++) {
		outputParts.push('..')
	}
	outputParts = outputParts.concat(toParts.slice(samePartsLength))
	return outputParts.join('/')
}
var sep = '/'
var delimiter = ':'
function dirname(path2) {
	var result = splitPath(path2),
		root = result[0],
		dir = result[1]
	if (!root && !dir) {
		return '.'
	}
	if (dir) {
		dir = dir.substr(0, dir.length - 1)
	}
	return root + dir
}
function basename(path2, ext) {
	var f = splitPath(path2)[2]
	if (ext && f.substr(-1 * ext.length) === ext) {
		f = f.substr(0, f.length - ext.length)
	}
	return f
}
function extname(path2) {
	return splitPath(path2)[3]
}
var path = {
	extname,
	basename,
	dirname,
	sep,
	delimiter,
	relative,
	join,
	isAbsolute,
	normalize,
	resolve,
}
function filter(xs, f) {
	if (xs.filter) return xs.filter(f)
	var res = []
	for (var i = 0; i < xs.length; i++) {
		if (f(xs[i], i, xs)) res.push(xs[i])
	}
	return res
}
var substr =
	'ab'.substr(-1) === 'b'
		? function (str, start, len) {
				return str.substr(start, len)
		  }
		: function (str, start, len) {
				if (start < 0) start = str.length + start
				return str.substr(start, len)
		  }
var path$1 = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	resolve,
	normalize,
	isAbsolute,
	join,
	relative,
	sep,
	delimiter,
	dirname,
	basename,
	extname,
	default: path,
})
function defaultSetTimout() {
	throw new Error('setTimeout has not been defined')
}
function defaultClearTimeout() {
	throw new Error('clearTimeout has not been defined')
}
var cachedSetTimeout = defaultSetTimout
var cachedClearTimeout = defaultClearTimeout
var globalContext
if (typeof window !== 'undefined') {
	globalContext = window
} else if (typeof self !== 'undefined') {
	globalContext = self
} else {
	globalContext = {}
}
if (typeof globalContext.setTimeout === 'function') {
	cachedSetTimeout = setTimeout
}
if (typeof globalContext.clearTimeout === 'function') {
	cachedClearTimeout = clearTimeout
}
function runTimeout(fun) {
	if (cachedSetTimeout === setTimeout) {
		return setTimeout(fun, 0)
	}
	if (
		(cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
		setTimeout
	) {
		cachedSetTimeout = setTimeout
		return setTimeout(fun, 0)
	}
	try {
		return cachedSetTimeout(fun, 0)
	} catch (e) {
		try {
			return cachedSetTimeout.call(null, fun, 0)
		} catch (e2) {
			return cachedSetTimeout.call(this, fun, 0)
		}
	}
}
function runClearTimeout(marker) {
	if (cachedClearTimeout === clearTimeout) {
		return clearTimeout(marker)
	}
	if (
		(cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) &&
		clearTimeout
	) {
		cachedClearTimeout = clearTimeout
		return clearTimeout(marker)
	}
	try {
		return cachedClearTimeout(marker)
	} catch (e) {
		try {
			return cachedClearTimeout.call(null, marker)
		} catch (e2) {
			return cachedClearTimeout.call(this, marker)
		}
	}
}
var queue = []
var draining = false
var currentQueue
var queueIndex = -1
function cleanUpNextTick() {
	if (!draining || !currentQueue) {
		return
	}
	draining = false
	if (currentQueue.length) {
		queue = currentQueue.concat(queue)
	} else {
		queueIndex = -1
	}
	if (queue.length) {
		drainQueue()
	}
}
function drainQueue() {
	if (draining) {
		return
	}
	var timeout = runTimeout(cleanUpNextTick)
	draining = true
	var len = queue.length
	while (len) {
		currentQueue = queue
		queue = []
		while (++queueIndex < len) {
			if (currentQueue) {
				currentQueue[queueIndex].run()
			}
		}
		queueIndex = -1
		len = queue.length
	}
	currentQueue = null
	draining = false
	runClearTimeout(timeout)
}
function nextTick(fun) {
	var args = new Array(arguments.length - 1)
	if (arguments.length > 1) {
		for (var i = 1; i < arguments.length; i++) {
			args[i - 1] = arguments[i]
		}
	}
	queue.push(new Item(fun, args))
	if (queue.length === 1 && !draining) {
		runTimeout(drainQueue)
	}
}
function Item(fun, array) {
	this.fun = fun
	this.array = array
}
Item.prototype.run = function () {
	this.fun.apply(null, this.array)
}
var title = 'browser'
var platform = 'browser'
var browser = true
var argv = []
var version = ''
var versions = {}
var release = {}
var config = {}
function noop() {}
var on = noop
var addListener = noop
var once = noop
var off = noop
var removeListener = noop
var removeAllListeners = noop
var emit = noop
function binding(name) {
	throw new Error('process.binding is not supported')
}
function cwd() {
	return '/'
}
function chdir(dir) {
	throw new Error('process.chdir is not supported')
}
function umask() {
	return 0
}
var performance = globalContext.performance || {}
var performanceNow =
	performance.now ||
	performance.mozNow ||
	performance.msNow ||
	performance.oNow ||
	performance.webkitNow ||
	function () {
		return new Date().getTime()
	}
function hrtime(previousTimestamp) {
	var clocktime = performanceNow.call(performance) * 1e-3
	var seconds = Math.floor(clocktime)
	var nanoseconds = Math.floor((clocktime % 1) * 1e9)
	if (previousTimestamp) {
		seconds = seconds - previousTimestamp[0]
		nanoseconds = nanoseconds - previousTimestamp[1]
		if (nanoseconds < 0) {
			seconds--
			nanoseconds += 1e9
		}
	}
	return [seconds, nanoseconds]
}
var startTime = new Date()
function uptime() {
	var currentTime = new Date()
	var dif = currentTime - startTime
	return dif / 1e3
}
var process = {
	nextTick,
	title,
	browser,
	env: { NODE_ENV: 'production' },
	argv,
	version,
	versions,
	on,
	addListener,
	once,
	off,
	removeListener,
	removeAllListeners,
	emit,
	binding,
	cwd,
	chdir,
	umask,
	hrtime,
	platform,
	release,
	config,
	uptime,
}
function createCommonjsModule(fn, basedir, module) {
	return (
		(module = {
			path: basedir,
			exports: {},
			require: function (path2, base) {
				return commonjsRequire(
					path2,
					base === void 0 || base === null ? module.path : base
				)
			},
		}),
		fn(module, module.exports),
		module.exports
	)
}
function commonjsRequire() {
	throw new Error(
		'Dynamic requires are not currently supported by @rollup/plugin-commonjs'
	)
}
const WIN_SLASH = '\\\\/'
const WIN_NO_SLASH = `[^${WIN_SLASH}]`
const DOT_LITERAL = '\\.'
const PLUS_LITERAL = '\\+'
const QMARK_LITERAL = '\\?'
const SLASH_LITERAL = '\\/'
const ONE_CHAR = '(?=.)'
const QMARK = '[^/]'
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`
const NO_DOT = `(?!${DOT_LITERAL})`
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`
const STAR = `${QMARK}*?`
const POSIX_CHARS = {
	DOT_LITERAL,
	PLUS_LITERAL,
	QMARK_LITERAL,
	SLASH_LITERAL,
	ONE_CHAR,
	QMARK,
	END_ANCHOR,
	DOTS_SLASH,
	NO_DOT,
	NO_DOTS,
	NO_DOT_SLASH,
	NO_DOTS_SLASH,
	QMARK_NO_DOT,
	STAR,
	START_ANCHOR,
}
const WINDOWS_CHARS = {
	...POSIX_CHARS,
	SLASH_LITERAL: `[${WIN_SLASH}]`,
	QMARK: WIN_NO_SLASH,
	STAR: `${WIN_NO_SLASH}*?`,
	DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
	NO_DOT: `(?!${DOT_LITERAL})`,
	NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
	NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
	NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
	QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
	START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
	END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
}
const POSIX_REGEX_SOURCE = {
	alnum: 'a-zA-Z0-9',
	alpha: 'a-zA-Z',
	ascii: '\\x00-\\x7F',
	blank: ' \\t',
	cntrl: '\\x00-\\x1F\\x7F',
	digit: '0-9',
	graph: '\\x21-\\x7E',
	lower: 'a-z',
	print: '\\x20-\\x7E ',
	punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
	space: ' \\t\\r\\n\\v\\f',
	upper: 'A-Z',
	word: 'A-Za-z0-9_',
	xdigit: 'A-Fa-f0-9',
}
var constants = {
	MAX_LENGTH: 1024 * 64,
	POSIX_REGEX_SOURCE,
	REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
	REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
	REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
	REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
	REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
	REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
	REPLACEMENTS: {
		'***': '*',
		'**/**': '**',
		'**/**/**': '**',
	},
	CHAR_0: 48,
	CHAR_9: 57,
	CHAR_UPPERCASE_A: 65,
	CHAR_LOWERCASE_A: 97,
	CHAR_UPPERCASE_Z: 90,
	CHAR_LOWERCASE_Z: 122,
	CHAR_LEFT_PARENTHESES: 40,
	CHAR_RIGHT_PARENTHESES: 41,
	CHAR_ASTERISK: 42,
	CHAR_AMPERSAND: 38,
	CHAR_AT: 64,
	CHAR_BACKWARD_SLASH: 92,
	CHAR_CARRIAGE_RETURN: 13,
	CHAR_CIRCUMFLEX_ACCENT: 94,
	CHAR_COLON: 58,
	CHAR_COMMA: 44,
	CHAR_DOT: 46,
	CHAR_DOUBLE_QUOTE: 34,
	CHAR_EQUAL: 61,
	CHAR_EXCLAMATION_MARK: 33,
	CHAR_FORM_FEED: 12,
	CHAR_FORWARD_SLASH: 47,
	CHAR_GRAVE_ACCENT: 96,
	CHAR_HASH: 35,
	CHAR_HYPHEN_MINUS: 45,
	CHAR_LEFT_ANGLE_BRACKET: 60,
	CHAR_LEFT_CURLY_BRACE: 123,
	CHAR_LEFT_SQUARE_BRACKET: 91,
	CHAR_LINE_FEED: 10,
	CHAR_NO_BREAK_SPACE: 160,
	CHAR_PERCENT: 37,
	CHAR_PLUS: 43,
	CHAR_QUESTION_MARK: 63,
	CHAR_RIGHT_ANGLE_BRACKET: 62,
	CHAR_RIGHT_CURLY_BRACE: 125,
	CHAR_RIGHT_SQUARE_BRACKET: 93,
	CHAR_SEMICOLON: 59,
	CHAR_SINGLE_QUOTE: 39,
	CHAR_SPACE: 32,
	CHAR_TAB: 9,
	CHAR_UNDERSCORE: 95,
	CHAR_VERTICAL_LINE: 124,
	CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
	SEP: path$1.sep,
	extglobChars(chars) {
		return {
			'!': {
				type: 'negate',
				open: '(?:(?!(?:',
				close: `))${chars.STAR})`,
			},
			'?': { type: 'qmark', open: '(?:', close: ')?' },
			'+': { type: 'plus', open: '(?:', close: ')+' },
			'*': { type: 'star', open: '(?:', close: ')*' },
			'@': { type: 'at', open: '(?:', close: ')' },
		}
	},
	globChars(win32) {
		return win32 === true ? WINDOWS_CHARS : POSIX_CHARS
	},
}
var utils = createCommonjsModule(function (module, exports) {
	const {
		REGEX_BACKSLASH,
		REGEX_REMOVE_BACKSLASH,
		REGEX_SPECIAL_CHARS,
		REGEX_SPECIAL_CHARS_GLOBAL,
	} = constants
	exports.isObject = (val) =>
		val !== null && typeof val === 'object' && !Array.isArray(val)
	exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str)
	exports.isRegexChar = (str) =>
		str.length === 1 && exports.hasRegexChars(str)
	exports.escapeRegex = (str) =>
		str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1')
	exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, '/')
	exports.removeBackslashes = (str) => {
		return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
			return match === '\\' ? '' : match
		})
	}
	exports.supportsLookbehinds = () => {
		const segs = process.version.slice(1).split('.').map(Number)
		if (
			(segs.length === 3 && segs[0] >= 9) ||
			(segs[0] === 8 && segs[1] >= 10)
		) {
			return true
		}
		return false
	}
	exports.isWindows = (options) => {
		if (options && typeof options.windows === 'boolean') {
			return options.windows
		}
		return path$1.sep === '\\'
	}
	exports.escapeLast = (input, char, lastIdx) => {
		const idx = input.lastIndexOf(char, lastIdx)
		if (idx === -1) return input
		if (input[idx - 1] === '\\')
			return exports.escapeLast(input, char, idx - 1)
		return `${input.slice(0, idx)}\\${input.slice(idx)}`
	}
	exports.removePrefix = (input, state = {}) => {
		let output = input
		if (output.startsWith('./')) {
			output = output.slice(2)
			state.prefix = './'
		}
		return output
	}
	exports.wrapOutput = (input, state = {}, options = {}) => {
		const prepend = options.contains ? '' : '^'
		const append = options.contains ? '' : '$'
		let output = `${prepend}(?:${input})${append}`
		if (state.negated === true) {
			output = `(?:^(?!${output}).*$)`
		}
		return output
	}
})
const {
	CHAR_ASTERISK,
	CHAR_AT,
	CHAR_BACKWARD_SLASH,
	CHAR_COMMA,
	CHAR_DOT,
	CHAR_EXCLAMATION_MARK,
	CHAR_FORWARD_SLASH,
	CHAR_LEFT_CURLY_BRACE,
	CHAR_LEFT_PARENTHESES,
	CHAR_LEFT_SQUARE_BRACKET,
	CHAR_PLUS,
	CHAR_QUESTION_MARK,
	CHAR_RIGHT_CURLY_BRACE,
	CHAR_RIGHT_PARENTHESES,
	CHAR_RIGHT_SQUARE_BRACKET,
} = constants
const isPathSeparator = (code) => {
	return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH
}
const depth = (token) => {
	if (token.isPrefix !== true) {
		token.depth = token.isGlobstar ? Infinity : 1
	}
}
const scan = (input, options) => {
	const opts = options || {}
	const length = input.length - 1
	const scanToEnd = opts.parts === true || opts.scanToEnd === true
	const slashes = []
	const tokens = []
	const parts = []
	let str = input
	let index = -1
	let start = 0
	let lastIndex = 0
	let isBrace = false
	let isBracket = false
	let isGlob = false
	let isExtglob = false
	let isGlobstar = false
	let braceEscaped = false
	let backslashes = false
	let negated = false
	let negatedExtglob = false
	let finished = false
	let braces = 0
	let prev
	let code
	let token = { value: '', depth: 0, isGlob: false }
	const eos = () => index >= length
	const peek = () => str.charCodeAt(index + 1)
	const advance = () => {
		prev = code
		return str.charCodeAt(++index)
	}
	while (index < length) {
		code = advance()
		let next
		if (code === CHAR_BACKWARD_SLASH) {
			backslashes = token.backslashes = true
			code = advance()
			if (code === CHAR_LEFT_CURLY_BRACE) {
				braceEscaped = true
			}
			continue
		}
		if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
			braces++
			while (eos() !== true && (code = advance())) {
				if (code === CHAR_BACKWARD_SLASH) {
					backslashes = token.backslashes = true
					advance()
					continue
				}
				if (code === CHAR_LEFT_CURLY_BRACE) {
					braces++
					continue
				}
				if (
					braceEscaped !== true &&
					code === CHAR_DOT &&
					(code = advance()) === CHAR_DOT
				) {
					isBrace = token.isBrace = true
					isGlob = token.isGlob = true
					finished = true
					if (scanToEnd === true) {
						continue
					}
					break
				}
				if (braceEscaped !== true && code === CHAR_COMMA) {
					isBrace = token.isBrace = true
					isGlob = token.isGlob = true
					finished = true
					if (scanToEnd === true) {
						continue
					}
					break
				}
				if (code === CHAR_RIGHT_CURLY_BRACE) {
					braces--
					if (braces === 0) {
						braceEscaped = false
						isBrace = token.isBrace = true
						finished = true
						break
					}
				}
			}
			if (scanToEnd === true) {
				continue
			}
			break
		}
		if (code === CHAR_FORWARD_SLASH) {
			slashes.push(index)
			tokens.push(token)
			token = { value: '', depth: 0, isGlob: false }
			if (finished === true) continue
			if (prev === CHAR_DOT && index === start + 1) {
				start += 2
				continue
			}
			lastIndex = index + 1
			continue
		}
		if (opts.noext !== true) {
			const isExtglobChar =
				code === CHAR_PLUS ||
				code === CHAR_AT ||
				code === CHAR_ASTERISK ||
				code === CHAR_QUESTION_MARK ||
				code === CHAR_EXCLAMATION_MARK
			if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
				isGlob = token.isGlob = true
				isExtglob = token.isExtglob = true
				finished = true
				if (code === CHAR_EXCLAMATION_MARK && index === start) {
					negatedExtglob = true
				}
				if (scanToEnd === true) {
					while (eos() !== true && (code = advance())) {
						if (code === CHAR_BACKWARD_SLASH) {
							backslashes = token.backslashes = true
							code = advance()
							continue
						}
						if (code === CHAR_RIGHT_PARENTHESES) {
							isGlob = token.isGlob = true
							finished = true
							break
						}
					}
					continue
				}
				break
			}
		}
		if (code === CHAR_ASTERISK) {
			if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true
			isGlob = token.isGlob = true
			finished = true
			if (scanToEnd === true) {
				continue
			}
			break
		}
		if (code === CHAR_QUESTION_MARK) {
			isGlob = token.isGlob = true
			finished = true
			if (scanToEnd === true) {
				continue
			}
			break
		}
		if (code === CHAR_LEFT_SQUARE_BRACKET) {
			while (eos() !== true && (next = advance())) {
				if (next === CHAR_BACKWARD_SLASH) {
					backslashes = token.backslashes = true
					advance()
					continue
				}
				if (next === CHAR_RIGHT_SQUARE_BRACKET) {
					isBracket = token.isBracket = true
					isGlob = token.isGlob = true
					finished = true
					break
				}
			}
			if (scanToEnd === true) {
				continue
			}
			break
		}
		if (
			opts.nonegate !== true &&
			code === CHAR_EXCLAMATION_MARK &&
			index === start
		) {
			negated = token.negated = true
			start++
			continue
		}
		if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
			isGlob = token.isGlob = true
			if (scanToEnd === true) {
				while (eos() !== true && (code = advance())) {
					if (code === CHAR_LEFT_PARENTHESES) {
						backslashes = token.backslashes = true
						code = advance()
						continue
					}
					if (code === CHAR_RIGHT_PARENTHESES) {
						finished = true
						break
					}
				}
				continue
			}
			break
		}
		if (isGlob === true) {
			finished = true
			if (scanToEnd === true) {
				continue
			}
			break
		}
	}
	if (opts.noext === true) {
		isExtglob = false
		isGlob = false
	}
	let base = str
	let prefix = ''
	let glob = ''
	if (start > 0) {
		prefix = str.slice(0, start)
		str = str.slice(start)
		lastIndex -= start
	}
	if (base && isGlob === true && lastIndex > 0) {
		base = str.slice(0, lastIndex)
		glob = str.slice(lastIndex)
	} else if (isGlob === true) {
		base = ''
		glob = str
	} else {
		base = str
	}
	if (base && base !== '' && base !== '/' && base !== str) {
		if (isPathSeparator(base.charCodeAt(base.length - 1))) {
			base = base.slice(0, -1)
		}
	}
	if (opts.unescape === true) {
		if (glob) glob = utils.removeBackslashes(glob)
		if (base && backslashes === true) {
			base = utils.removeBackslashes(base)
		}
	}
	const state = {
		prefix,
		input,
		start,
		base,
		glob,
		isBrace,
		isBracket,
		isGlob,
		isExtglob,
		isGlobstar,
		negated,
		negatedExtglob,
	}
	if (opts.tokens === true) {
		state.maxDepth = 0
		if (!isPathSeparator(code)) {
			tokens.push(token)
		}
		state.tokens = tokens
	}
	if (opts.parts === true || opts.tokens === true) {
		let prevIndex
		for (let idx = 0; idx < slashes.length; idx++) {
			const n = prevIndex ? prevIndex + 1 : start
			const i = slashes[idx]
			const value = input.slice(n, i)
			if (opts.tokens) {
				if (idx === 0 && start !== 0) {
					tokens[idx].isPrefix = true
					tokens[idx].value = prefix
				} else {
					tokens[idx].value = value
				}
				depth(tokens[idx])
				state.maxDepth += tokens[idx].depth
			}
			if (idx !== 0 || value !== '') {
				parts.push(value)
			}
			prevIndex = i
		}
		if (prevIndex && prevIndex + 1 < input.length) {
			const value = input.slice(prevIndex + 1)
			parts.push(value)
			if (opts.tokens) {
				tokens[tokens.length - 1].value = value
				depth(tokens[tokens.length - 1])
				state.maxDepth += tokens[tokens.length - 1].depth
			}
		}
		state.slashes = slashes
		state.parts = parts
	}
	return state
}
var scan_1 = scan
const {
	MAX_LENGTH,
	POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
	REGEX_NON_SPECIAL_CHARS,
	REGEX_SPECIAL_CHARS_BACKREF,
	REPLACEMENTS,
} = constants
const expandRange = (args, options) => {
	if (typeof options.expandRange === 'function') {
		return options.expandRange(...args, options)
	}
	args.sort()
	const value = `[${args.join('-')}]`
	try {
		new RegExp(value)
	} catch (ex) {
		return args.map((v) => utils.escapeRegex(v)).join('..')
	}
	return value
}
const syntaxError = (type, char) => {
	return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`
}
const parse = (input, options) => {
	if (typeof input !== 'string') {
		throw new TypeError('Expected a string')
	}
	input = REPLACEMENTS[input] || input
	const opts = { ...options }
	const max =
		typeof opts.maxLength === 'number'
			? Math.min(MAX_LENGTH, opts.maxLength)
			: MAX_LENGTH
	let len = input.length
	if (len > max) {
		throw new SyntaxError(
			`Input length: ${len}, exceeds maximum allowed length: ${max}`
		)
	}
	const bos = { type: 'bos', value: '', output: opts.prepend || '' }
	const tokens = [bos]
	const capture = opts.capture ? '' : '?:'
	const win32 = utils.isWindows(options)
	const PLATFORM_CHARS = constants.globChars(win32)
	const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS)
	const {
		DOT_LITERAL: DOT_LITERAL2,
		PLUS_LITERAL: PLUS_LITERAL2,
		SLASH_LITERAL: SLASH_LITERAL2,
		ONE_CHAR: ONE_CHAR2,
		DOTS_SLASH: DOTS_SLASH2,
		NO_DOT: NO_DOT2,
		NO_DOT_SLASH: NO_DOT_SLASH2,
		NO_DOTS_SLASH: NO_DOTS_SLASH2,
		QMARK: QMARK2,
		QMARK_NO_DOT: QMARK_NO_DOT2,
		STAR: STAR2,
		START_ANCHOR: START_ANCHOR2,
	} = PLATFORM_CHARS
	const globstar = (opts2) => {
		return `(${capture}(?:(?!${START_ANCHOR2}${
			opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2
		}).)*?)`
	}
	const nodot = opts.dot ? '' : NO_DOT2
	const qmarkNoDot = opts.dot ? QMARK2 : QMARK_NO_DOT2
	let star = opts.bash === true ? globstar(opts) : STAR2
	if (opts.capture) {
		star = `(${star})`
	}
	if (typeof opts.noext === 'boolean') {
		opts.noextglob = opts.noext
	}
	const state = {
		input,
		index: -1,
		start: 0,
		dot: opts.dot === true,
		consumed: '',
		output: '',
		prefix: '',
		backtrack: false,
		negated: false,
		brackets: 0,
		braces: 0,
		parens: 0,
		quotes: 0,
		globstar: false,
		tokens,
	}
	input = utils.removePrefix(input, state)
	len = input.length
	const extglobs = []
	const braces = []
	const stack = []
	let prev = bos
	let value
	const eos = () => state.index === len - 1
	const peek = (state.peek = (n = 1) => input[state.index + n])
	const advance = (state.advance = () => input[++state.index] || '')
	const remaining = () => input.slice(state.index + 1)
	const consume = (value2 = '', num = 0) => {
		state.consumed += value2
		state.index += num
	}
	const append = (token) => {
		state.output += token.output != null ? token.output : token.value
		consume(token.value)
	}
	const negate = () => {
		let count = 1
		while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
			advance()
			state.start++
			count++
		}
		if (count % 2 === 0) {
			return false
		}
		state.negated = true
		state.start++
		return true
	}
	const increment = (type) => {
		state[type]++
		stack.push(type)
	}
	const decrement = (type) => {
		state[type]--
		stack.pop()
	}
	const push = (tok) => {
		if (prev.type === 'globstar') {
			const isBrace =
				state.braces > 0 &&
				(tok.type === 'comma' || tok.type === 'brace')
			const isExtglob =
				tok.extglob === true ||
				(extglobs.length &&
					(tok.type === 'pipe' || tok.type === 'paren'))
			if (
				tok.type !== 'slash' &&
				tok.type !== 'paren' &&
				!isBrace &&
				!isExtglob
			) {
				state.output = state.output.slice(0, -prev.output.length)
				prev.type = 'star'
				prev.value = '*'
				prev.output = star
				state.output += prev.output
			}
		}
		if (extglobs.length && tok.type !== 'paren') {
			extglobs[extglobs.length - 1].inner += tok.value
		}
		if (tok.value || tok.output) append(tok)
		if (prev && prev.type === 'text' && tok.type === 'text') {
			prev.value += tok.value
			prev.output = (prev.output || '') + tok.value
			return
		}
		tok.prev = prev
		tokens.push(tok)
		prev = tok
	}
	const extglobOpen = (type, value2) => {
		const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: '' }
		token.prev = prev
		token.parens = state.parens
		token.output = state.output
		const output = (opts.capture ? '(' : '') + token.open
		increment('parens')
		push({ type, value: value2, output: state.output ? '' : ONE_CHAR2 })
		push({ type: 'paren', extglob: true, value: advance(), output })
		extglobs.push(token)
	}
	const extglobClose = (token) => {
		let output = token.close + (opts.capture ? ')' : '')
		let rest
		if (token.type === 'negate') {
			let extglobStar = star
			if (
				token.inner &&
				token.inner.length > 1 &&
				token.inner.includes('/')
			) {
				extglobStar = globstar(opts)
			}
			if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
				output = token.close = `)$))${extglobStar}`
			}
			if (
				token.inner.includes('*') &&
				(rest = remaining()) &&
				/^\.[^\\/.]+$/.test(rest)
			) {
				output = token.close = `)${rest})${extglobStar})`
			}
			if (token.prev.type === 'bos') {
				state.negatedExtglob = true
			}
		}
		push({ type: 'paren', extglob: true, value, output })
		decrement('parens')
	}
	if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
		let backslashes = false
		let output = input.replace(
			REGEX_SPECIAL_CHARS_BACKREF,
			(m, esc, chars, first, rest, index) => {
				if (first === '\\') {
					backslashes = true
					return m
				}
				if (first === '?') {
					if (esc) {
						return (
							esc +
							first +
							(rest ? QMARK2.repeat(rest.length) : '')
						)
					}
					if (index === 0) {
						return (
							qmarkNoDot +
							(rest ? QMARK2.repeat(rest.length) : '')
						)
					}
					return QMARK2.repeat(chars.length)
				}
				if (first === '.') {
					return DOT_LITERAL2.repeat(chars.length)
				}
				if (first === '*') {
					if (esc) {
						return esc + first + (rest ? star : '')
					}
					return star
				}
				return esc ? m : `\\${m}`
			}
		)
		if (backslashes === true) {
			if (opts.unescape === true) {
				output = output.replace(/\\/g, '')
			} else {
				output = output.replace(/\\+/g, (m) => {
					return m.length % 2 === 0 ? '\\\\' : m ? '\\' : ''
				})
			}
		}
		if (output === input && opts.contains === true) {
			state.output = input
			return state
		}
		state.output = utils.wrapOutput(output, state, options)
		return state
	}
	while (!eos()) {
		value = advance()
		if (value === '\0') {
			continue
		}
		if (value === '\\') {
			const next = peek()
			if (next === '/' && opts.bash !== true) {
				continue
			}
			if (next === '.' || next === ';') {
				continue
			}
			if (!next) {
				value += '\\'
				push({ type: 'text', value })
				continue
			}
			const match = /^\\+/.exec(remaining())
			let slashes = 0
			if (match && match[0].length > 2) {
				slashes = match[0].length
				state.index += slashes
				if (slashes % 2 !== 0) {
					value += '\\'
				}
			}
			if (opts.unescape === true) {
				value = advance()
			} else {
				value += advance()
			}
			if (state.brackets === 0) {
				push({ type: 'text', value })
				continue
			}
		}
		if (
			state.brackets > 0 &&
			(value !== ']' || prev.value === '[' || prev.value === '[^')
		) {
			if (opts.posix !== false && value === ':') {
				const inner = prev.value.slice(1)
				if (inner.includes('[')) {
					prev.posix = true
					if (inner.includes(':')) {
						const idx = prev.value.lastIndexOf('[')
						const pre = prev.value.slice(0, idx)
						const rest2 = prev.value.slice(idx + 2)
						const posix = POSIX_REGEX_SOURCE$1[rest2]
						if (posix) {
							prev.value = pre + posix
							state.backtrack = true
							advance()
							if (!bos.output && tokens.indexOf(prev) === 1) {
								bos.output = ONE_CHAR2
							}
							continue
						}
					}
				}
			}
			if (
				(value === '[' && peek() !== ':') ||
				(value === '-' && peek() === ']')
			) {
				value = `\\${value}`
			}
			if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
				value = `\\${value}`
			}
			if (opts.posix === true && value === '!' && prev.value === '[') {
				value = '^'
			}
			prev.value += value
			append({ value })
			continue
		}
		if (state.quotes === 1 && value !== '"') {
			value = utils.escapeRegex(value)
			prev.value += value
			append({ value })
			continue
		}
		if (value === '"') {
			state.quotes = state.quotes === 1 ? 0 : 1
			if (opts.keepQuotes === true) {
				push({ type: 'text', value })
			}
			continue
		}
		if (value === '(') {
			increment('parens')
			push({ type: 'paren', value })
			continue
		}
		if (value === ')') {
			if (state.parens === 0 && opts.strictBrackets === true) {
				throw new SyntaxError(syntaxError('opening', '('))
			}
			const extglob = extglobs[extglobs.length - 1]
			if (extglob && state.parens === extglob.parens + 1) {
				extglobClose(extglobs.pop())
				continue
			}
			push({ type: 'paren', value, output: state.parens ? ')' : '\\)' })
			decrement('parens')
			continue
		}
		if (value === '[') {
			if (opts.nobracket === true || !remaining().includes(']')) {
				if (opts.nobracket !== true && opts.strictBrackets === true) {
					throw new SyntaxError(syntaxError('closing', ']'))
				}
				value = `\\${value}`
			} else {
				increment('brackets')
			}
			push({ type: 'bracket', value })
			continue
		}
		if (value === ']') {
			if (
				opts.nobracket === true ||
				(prev && prev.type === 'bracket' && prev.value.length === 1)
			) {
				push({ type: 'text', value, output: `\\${value}` })
				continue
			}
			if (state.brackets === 0) {
				if (opts.strictBrackets === true) {
					throw new SyntaxError(syntaxError('opening', '['))
				}
				push({ type: 'text', value, output: `\\${value}` })
				continue
			}
			decrement('brackets')
			const prevValue = prev.value.slice(1)
			if (
				prev.posix !== true &&
				prevValue[0] === '^' &&
				!prevValue.includes('/')
			) {
				value = `/${value}`
			}
			prev.value += value
			append({ value })
			if (
				opts.literalBrackets === false ||
				utils.hasRegexChars(prevValue)
			) {
				continue
			}
			const escaped = utils.escapeRegex(prev.value)
			state.output = state.output.slice(0, -prev.value.length)
			if (opts.literalBrackets === true) {
				state.output += escaped
				prev.value = escaped
				continue
			}
			prev.value = `(${capture}${escaped}|${prev.value})`
			state.output += prev.value
			continue
		}
		if (value === '{' && opts.nobrace !== true) {
			increment('braces')
			const open = {
				type: 'brace',
				value,
				output: '(',
				outputIndex: state.output.length,
				tokensIndex: state.tokens.length,
			}
			braces.push(open)
			push(open)
			continue
		}
		if (value === '}') {
			const brace = braces[braces.length - 1]
			if (opts.nobrace === true || !brace) {
				push({ type: 'text', value, output: value })
				continue
			}
			let output = ')'
			if (brace.dots === true) {
				const arr = tokens.slice()
				const range = []
				for (let i = arr.length - 1; i >= 0; i--) {
					tokens.pop()
					if (arr[i].type === 'brace') {
						break
					}
					if (arr[i].type !== 'dots') {
						range.unshift(arr[i].value)
					}
				}
				output = expandRange(range, opts)
				state.backtrack = true
			}
			if (brace.comma !== true && brace.dots !== true) {
				const out = state.output.slice(0, brace.outputIndex)
				const toks = state.tokens.slice(brace.tokensIndex)
				brace.value = brace.output = '\\{'
				value = output = '\\}'
				state.output = out
				for (const t of toks) {
					state.output += t.output || t.value
				}
			}
			push({ type: 'brace', value, output })
			decrement('braces')
			braces.pop()
			continue
		}
		if (value === '|') {
			if (extglobs.length > 0) {
				extglobs[extglobs.length - 1].conditions++
			}
			push({ type: 'text', value })
			continue
		}
		if (value === ',') {
			let output = value
			const brace = braces[braces.length - 1]
			if (brace && stack[stack.length - 1] === 'braces') {
				brace.comma = true
				output = '|'
			}
			push({ type: 'comma', value, output })
			continue
		}
		if (value === '/') {
			if (prev.type === 'dot' && state.index === state.start + 1) {
				state.start = state.index + 1
				state.consumed = ''
				state.output = ''
				tokens.pop()
				prev = bos
				continue
			}
			push({ type: 'slash', value, output: SLASH_LITERAL2 })
			continue
		}
		if (value === '.') {
			if (state.braces > 0 && prev.type === 'dot') {
				if (prev.value === '.') prev.output = DOT_LITERAL2
				const brace = braces[braces.length - 1]
				prev.type = 'dots'
				prev.output += value
				prev.value += value
				brace.dots = true
				continue
			}
			if (
				state.braces + state.parens === 0 &&
				prev.type !== 'bos' &&
				prev.type !== 'slash'
			) {
				push({ type: 'text', value, output: DOT_LITERAL2 })
				continue
			}
			push({ type: 'dot', value, output: DOT_LITERAL2 })
			continue
		}
		if (value === '?') {
			const isGroup = prev && prev.value === '('
			if (
				!isGroup &&
				opts.noextglob !== true &&
				peek() === '(' &&
				peek(2) !== '?'
			) {
				extglobOpen('qmark', value)
				continue
			}
			if (prev && prev.type === 'paren') {
				const next = peek()
				let output = value
				if (next === '<' && !utils.supportsLookbehinds()) {
					throw new Error(
						'Node.js v10 or higher is required for regex lookbehinds'
					)
				}
				if (
					(prev.value === '(' && !/[!=<:]/.test(next)) ||
					(next === '<' && !/<([!=]|\w+>)/.test(remaining()))
				) {
					output = `\\${value}`
				}
				push({ type: 'text', value, output })
				continue
			}
			if (
				opts.dot !== true &&
				(prev.type === 'slash' || prev.type === 'bos')
			) {
				push({ type: 'qmark', value, output: QMARK_NO_DOT2 })
				continue
			}
			push({ type: 'qmark', value, output: QMARK2 })
			continue
		}
		if (value === '!') {
			if (opts.noextglob !== true && peek() === '(') {
				if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
					extglobOpen('negate', value)
					continue
				}
			}
			if (opts.nonegate !== true && state.index === 0) {
				negate()
				continue
			}
		}
		if (value === '+') {
			if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
				extglobOpen('plus', value)
				continue
			}
			if ((prev && prev.value === '(') || opts.regex === false) {
				push({ type: 'plus', value, output: PLUS_LITERAL2 })
				continue
			}
			if (
				(prev &&
					(prev.type === 'bracket' ||
						prev.type === 'paren' ||
						prev.type === 'brace')) ||
				state.parens > 0
			) {
				push({ type: 'plus', value })
				continue
			}
			push({ type: 'plus', value: PLUS_LITERAL2 })
			continue
		}
		if (value === '@') {
			if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
				push({ type: 'at', extglob: true, value, output: '' })
				continue
			}
			push({ type: 'text', value })
			continue
		}
		if (value !== '*') {
			if (value === '$' || value === '^') {
				value = `\\${value}`
			}
			const match = REGEX_NON_SPECIAL_CHARS.exec(remaining())
			if (match) {
				value += match[0]
				state.index += match[0].length
			}
			push({ type: 'text', value })
			continue
		}
		if (prev && (prev.type === 'globstar' || prev.star === true)) {
			prev.type = 'star'
			prev.star = true
			prev.value += value
			prev.output = star
			state.backtrack = true
			state.globstar = true
			consume(value)
			continue
		}
		let rest = remaining()
		if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
			extglobOpen('star', value)
			continue
		}
		if (prev.type === 'star') {
			if (opts.noglobstar === true) {
				consume(value)
				continue
			}
			const prior = prev.prev
			const before = prior.prev
			const isStart = prior.type === 'slash' || prior.type === 'bos'
			const afterStar =
				before && (before.type === 'star' || before.type === 'globstar')
			if (
				opts.bash === true &&
				(!isStart || (rest[0] && rest[0] !== '/'))
			) {
				push({ type: 'star', value, output: '' })
				continue
			}
			const isBrace =
				state.braces > 0 &&
				(prior.type === 'comma' || prior.type === 'brace')
			const isExtglob =
				extglobs.length &&
				(prior.type === 'pipe' || prior.type === 'paren')
			if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
				push({ type: 'star', value, output: '' })
				continue
			}
			while (rest.slice(0, 3) === '/**') {
				const after = input[state.index + 4]
				if (after && after !== '/') {
					break
				}
				rest = rest.slice(3)
				consume('/**', 3)
			}
			if (prior.type === 'bos' && eos()) {
				prev.type = 'globstar'
				prev.value += value
				prev.output = globstar(opts)
				state.output = prev.output
				state.globstar = true
				consume(value)
				continue
			}
			if (
				prior.type === 'slash' &&
				prior.prev.type !== 'bos' &&
				!afterStar &&
				eos()
			) {
				state.output = state.output.slice(
					0,
					-(prior.output + prev.output).length
				)
				prior.output = `(?:${prior.output}`
				prev.type = 'globstar'
				prev.output =
					globstar(opts) + (opts.strictSlashes ? ')' : '|$)')
				prev.value += value
				state.globstar = true
				state.output += prior.output + prev.output
				consume(value)
				continue
			}
			if (
				prior.type === 'slash' &&
				prior.prev.type !== 'bos' &&
				rest[0] === '/'
			) {
				const end = rest[1] !== void 0 ? '|$' : ''
				state.output = state.output.slice(
					0,
					-(prior.output + prev.output).length
				)
				prior.output = `(?:${prior.output}`
				prev.type = 'globstar'
				prev.output = `${globstar(
					opts
				)}${SLASH_LITERAL2}|${SLASH_LITERAL2}${end})`
				prev.value += value
				state.output += prior.output + prev.output
				state.globstar = true
				consume(value + advance())
				push({ type: 'slash', value: '/', output: '' })
				continue
			}
			if (prior.type === 'bos' && rest[0] === '/') {
				prev.type = 'globstar'
				prev.value += value
				prev.output = `(?:^|${SLASH_LITERAL2}|${globstar(
					opts
				)}${SLASH_LITERAL2})`
				state.output = prev.output
				state.globstar = true
				consume(value + advance())
				push({ type: 'slash', value: '/', output: '' })
				continue
			}
			state.output = state.output.slice(0, -prev.output.length)
			prev.type = 'globstar'
			prev.output = globstar(opts)
			prev.value += value
			state.output += prev.output
			state.globstar = true
			consume(value)
			continue
		}
		const token = { type: 'star', value, output: star }
		if (opts.bash === true) {
			token.output = '.*?'
			if (prev.type === 'bos' || prev.type === 'slash') {
				token.output = nodot + token.output
			}
			push(token)
			continue
		}
		if (
			prev &&
			(prev.type === 'bracket' || prev.type === 'paren') &&
			opts.regex === true
		) {
			token.output = value
			push(token)
			continue
		}
		if (
			state.index === state.start ||
			prev.type === 'slash' ||
			prev.type === 'dot'
		) {
			if (prev.type === 'dot') {
				state.output += NO_DOT_SLASH2
				prev.output += NO_DOT_SLASH2
			} else if (opts.dot === true) {
				state.output += NO_DOTS_SLASH2
				prev.output += NO_DOTS_SLASH2
			} else {
				state.output += nodot
				prev.output += nodot
			}
			if (peek() !== '*') {
				state.output += ONE_CHAR2
				prev.output += ONE_CHAR2
			}
		}
		push(token)
	}
	while (state.brackets > 0) {
		if (opts.strictBrackets === true)
			throw new SyntaxError(syntaxError('closing', ']'))
		state.output = utils.escapeLast(state.output, '[')
		decrement('brackets')
	}
	while (state.parens > 0) {
		if (opts.strictBrackets === true)
			throw new SyntaxError(syntaxError('closing', ')'))
		state.output = utils.escapeLast(state.output, '(')
		decrement('parens')
	}
	while (state.braces > 0) {
		if (opts.strictBrackets === true)
			throw new SyntaxError(syntaxError('closing', '}'))
		state.output = utils.escapeLast(state.output, '{')
		decrement('braces')
	}
	if (
		opts.strictSlashes !== true &&
		(prev.type === 'star' || prev.type === 'bracket')
	) {
		push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL2}?` })
	}
	if (state.backtrack === true) {
		state.output = ''
		for (const token of state.tokens) {
			state.output += token.output != null ? token.output : token.value
			if (token.suffix) {
				state.output += token.suffix
			}
		}
	}
	return state
}
parse.fastpaths = (input, options) => {
	const opts = { ...options }
	const max =
		typeof opts.maxLength === 'number'
			? Math.min(MAX_LENGTH, opts.maxLength)
			: MAX_LENGTH
	const len = input.length
	if (len > max) {
		throw new SyntaxError(
			`Input length: ${len}, exceeds maximum allowed length: ${max}`
		)
	}
	input = REPLACEMENTS[input] || input
	const win32 = utils.isWindows(options)
	const {
		DOT_LITERAL: DOT_LITERAL2,
		SLASH_LITERAL: SLASH_LITERAL2,
		ONE_CHAR: ONE_CHAR2,
		DOTS_SLASH: DOTS_SLASH2,
		NO_DOT: NO_DOT2,
		NO_DOTS: NO_DOTS2,
		NO_DOTS_SLASH: NO_DOTS_SLASH2,
		STAR: STAR2,
		START_ANCHOR: START_ANCHOR2,
	} = constants.globChars(win32)
	const nodot = opts.dot ? NO_DOTS2 : NO_DOT2
	const slashDot = opts.dot ? NO_DOTS_SLASH2 : NO_DOT2
	const capture = opts.capture ? '' : '?:'
	const state = { negated: false, prefix: '' }
	let star = opts.bash === true ? '.*?' : STAR2
	if (opts.capture) {
		star = `(${star})`
	}
	const globstar = (opts2) => {
		if (opts2.noglobstar === true) return star
		return `(${capture}(?:(?!${START_ANCHOR2}${
			opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2
		}).)*?)`
	}
	const create = (str) => {
		switch (str) {
			case '*':
				return `${nodot}${ONE_CHAR2}${star}`
			case '.*':
				return `${DOT_LITERAL2}${ONE_CHAR2}${star}`
			case '*.*':
				return `${nodot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`
			case '*/*':
				return `${nodot}${star}${SLASH_LITERAL2}${ONE_CHAR2}${slashDot}${star}`
			case '**':
				return nodot + globstar(opts)
			case '**/*':
				return `(?:${nodot}${globstar(
					opts
				)}${SLASH_LITERAL2})?${slashDot}${ONE_CHAR2}${star}`
			case '**/*.*':
				return `(?:${nodot}${globstar(
					opts
				)}${SLASH_LITERAL2})?${slashDot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`
			case '**/.*':
				return `(?:${nodot}${globstar(
					opts
				)}${SLASH_LITERAL2})?${DOT_LITERAL2}${ONE_CHAR2}${star}`
			default: {
				const match = /^(.*?)\.(\w+)$/.exec(str)
				if (!match) return
				const source2 = create(match[1])
				if (!source2) return
				return source2 + DOT_LITERAL2 + match[2]
			}
		}
	}
	const output = utils.removePrefix(input, state)
	let source = create(output)
	if (source && opts.strictSlashes !== true) {
		source += `${SLASH_LITERAL2}?`
	}
	return source
}
var parse_1 = parse
const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)
const picomatch = (glob, options, returnState = false) => {
	if (Array.isArray(glob)) {
		const fns = glob.map((input) => picomatch(input, options, returnState))
		const arrayMatcher = (str) => {
			for (const isMatch2 of fns) {
				const state2 = isMatch2(str)
				if (state2) return state2
			}
			return false
		}
		return arrayMatcher
	}
	const isState = isObject(glob) && glob.tokens && glob.input
	if (glob === '' || (typeof glob !== 'string' && !isState)) {
		throw new TypeError('Expected pattern to be a non-empty string')
	}
	const opts = options || {}
	const posix = utils.isWindows(options)
	const regex = isState
		? picomatch.compileRe(glob, options)
		: picomatch.makeRe(glob, options, false, true)
	const state = regex.state
	delete regex.state
	let isIgnored = () => false
	if (opts.ignore) {
		const ignoreOpts = {
			...options,
			ignore: null,
			onMatch: null,
			onResult: null,
		}
		isIgnored = picomatch(opts.ignore, ignoreOpts, returnState)
	}
	const matcher = (input, returnObject = false) => {
		const { isMatch: isMatch2, match, output } = picomatch.test(
			input,
			regex,
			options,
			{ glob, posix }
		)
		const result = {
			glob,
			state,
			regex,
			posix,
			input,
			output,
			match,
			isMatch: isMatch2,
		}
		if (typeof opts.onResult === 'function') {
			opts.onResult(result)
		}
		if (isMatch2 === false) {
			result.isMatch = false
			return returnObject ? result : false
		}
		if (isIgnored(input)) {
			if (typeof opts.onIgnore === 'function') {
				opts.onIgnore(result)
			}
			result.isMatch = false
			return returnObject ? result : false
		}
		if (typeof opts.onMatch === 'function') {
			opts.onMatch(result)
		}
		return returnObject ? result : true
	}
	if (returnState) {
		matcher.state = state
	}
	return matcher
}
picomatch.test = (input, regex, options, { glob, posix } = {}) => {
	if (typeof input !== 'string') {
		throw new TypeError('Expected input to be a string')
	}
	if (input === '') {
		return { isMatch: false, output: '' }
	}
	const opts = options || {}
	const format = opts.format || (posix ? utils.toPosixSlashes : null)
	let match = input === glob
	let output = match && format ? format(input) : input
	if (match === false) {
		output = format ? format(input) : input
		match = output === glob
	}
	if (match === false || opts.capture === true) {
		if (opts.matchBase === true || opts.basename === true) {
			match = picomatch.matchBase(input, regex, options, posix)
		} else {
			match = regex.exec(output)
		}
	}
	return { isMatch: Boolean(match), match, output }
}
picomatch.matchBase = (
	input,
	glob,
	options,
	posix = utils.isWindows(options)
) => {
	const regex =
		glob instanceof RegExp ? glob : picomatch.makeRe(glob, options)
	return regex.test(path$1.basename(input))
}
picomatch.isMatch = (str, patterns, options) =>
	picomatch(patterns, options)(str)
picomatch.parse = (pattern, options) => {
	if (Array.isArray(pattern))
		return pattern.map((p) => picomatch.parse(p, options))
	return parse_1(pattern, { ...options, fastpaths: false })
}
picomatch.scan = (input, options) => scan_1(input, options)
picomatch.compileRe = (
	state,
	options,
	returnOutput = false,
	returnState = false
) => {
	if (returnOutput === true) {
		return state.output
	}
	const opts = options || {}
	const prepend = opts.contains ? '' : '^'
	const append = opts.contains ? '' : '$'
	let source = `${prepend}(?:${state.output})${append}`
	if (state && state.negated === true) {
		source = `^(?!${source}).*$`
	}
	const regex = picomatch.toRegex(source, options)
	if (returnState === true) {
		regex.state = state
	}
	return regex
}
picomatch.makeRe = (
	input,
	options = {},
	returnOutput = false,
	returnState = false
) => {
	if (!input || typeof input !== 'string') {
		throw new TypeError('Expected a non-empty string')
	}
	let parsed = { negated: false, fastpaths: true }
	if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
		parsed.output = parse_1.fastpaths(input, options)
	}
	if (!parsed.output) {
		parsed = parse_1(input, options)
	}
	return picomatch.compileRe(parsed, options, returnOutput, returnState)
}
picomatch.toRegex = (source, options) => {
	try {
		const opts = options || {}
		return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''))
	} catch (err) {
		if (options && options.debug === true) throw err
		return /$^/
	}
}
picomatch.constants = constants
var picomatch_1 = picomatch
var picomatch$1 = picomatch_1
var compileRe = picomatch$1.compileRe
var constants$1 = picomatch$1.constants
export default picomatch$1
var isMatch = picomatch$1.isMatch
var makeRe = picomatch$1.makeRe
var matchBase = picomatch$1.matchBase
var parse$1 = picomatch$1.parse
var scan$1 = picomatch$1.scan
var test = picomatch$1.test
var toRegex = picomatch$1.toRegex
export {
	picomatch$1 as __moduleExports,
	compileRe,
	constants$1 as constants,
	isMatch,
	makeRe,
	matchBase,
	parse$1 as parse,
	scan$1 as scan,
	test,
	toRegex,
}
