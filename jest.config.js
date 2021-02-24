module.exports = {
	roots: ['<rootDir>/src'],
	testMatch: [
		'**/__tests__/**/*.+(ts|tsx|js)',
		'**/?(*.)+(spec|test).+(ts|tsx|js)',
	],
	moduleNameMapper: {
		'^\\/@\\/(.+)$': '<rootDir>/src/$1',
	},
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
}
