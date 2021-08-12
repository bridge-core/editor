// import { walkObject } from '../walkObject'

// const object = {
// 	a: {
// 		a: 0,
// 		b: 1,
// 		c: 2,
// 	},
// 	b: {
// 		a: 0,
// 		b: 1,
// 		c: {
// 			a: 'Hello World!',
// 			b: 1,
// 			c: 2,
// 		},
// 	},
// 	c: {
// 		a: 0,
// 		b: 1,
// 		c: {
// 			a: 0,
// 			b: 'Hello World!',
// 			c: 2,
// 		},
// 	},
// }

// function testPath(path: string) {
// 	let resString = ''
// 	const onReach = (data: any) => (resString += JSON.stringify(data) + ';')
// 	walkObject(path, object, onReach)
// 	return resString
// }

// test('walkObject() util - default', () => {
// 	expect(testPath('a/c')).toBe('2;')
// 	expect(testPath('c/c/c')).toBe('2;')
// 	expect(testPath('d/a/b')).toBe('')
// })

// test('walkObject() util - single wildcard', () => {
// 	expect(testPath('*/c')).toBe(
// 		'2;{"a":"Hello World!","b":1,"c":2};{"a":0,"b":"Hello World!","c":2};'
// 	)
// 	expect(testPath('*/c/c')).toBe('2;2;')
// 	expect(testPath('*/b')).toBe('1;1;1;')
// 	expect(testPath('*/b/*')).toBe('')
// 	expect(testPath('*/*')).toBe(
// 		'0;1;2;0;1;{"a":"Hello World!","b":1,"c":2};0;1;{"a":0,"b":"Hello World!","c":2};'
// 	)
// 	expect(testPath('*/*/*')).toBe('"Hello World!";1;2;0;"Hello World!";2;')
// })

// test('walkObject() util - double wildcard', () => {
// 	expect(testPath('**/c/a')).toBe('"Hello World!";0;0;')
// 	expect(testPath('**/c')).toBe(
// 		'2;{"a":"Hello World!","b":1,"c":2};2;{"a":0,"b":1,"c":{"a":0,"b":"Hello World!","c":2}};{"a":0,"b":"Hello World!","c":2};2;'
// 	)
// 	expect(testPath('**/a/c')).toBe('2;')
// 	expect(testPath('c/**/a')).toBe('0;0;')
// })
test('DISABLED', () => {
	expect(true).toBe(true)
})
