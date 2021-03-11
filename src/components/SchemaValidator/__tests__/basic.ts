import { JSONValidator } from '../JSONValidator'

describe('Validator - Basics', () => {
	const validator = new JSONValidator()
	it('should say that invalid JSON is invalid', () => {
		expect(validator.validate('{')).toBe(false)
		expect(validator.validate('"\n"')).toBe(false)
		expect(validator.validate('{}, []')).toBe(false)
		expect(validator.validate('[{}, {}, [{},],]')).toBe(false)
		expect(validator.validate('[{} {}]')).toBe(false)
	})

	it('should say that valid JSON is valid', () => {
		expect(validator.validate('{}')).toBe(true)
		expect(validator.validate('[]')).toBe(true)
		expect(validator.validate('""')).toBe(true)
		expect(validator.validate('[{}, {}, [{}, {}]]')).toBe(true)
	})
})
