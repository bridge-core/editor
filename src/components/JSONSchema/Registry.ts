import { AllOfSchema } from './Schema/AllOf'
import { AnyOfSchema } from './Schema/AnyOf'
import { ConstSchema } from './Schema/Const'
import { EnumSchema } from './Schema/Enum'
import { IfSchema } from './Schema/IfSchema'
import { PatternPropertiesSchema } from './Schema/PatternProperties'
import { PropertiesSchema } from './Schema/Properties'
import { RefSchema } from './Schema/Ref'
import { RequiredSchema } from './Schema/Required'
import { Schema } from './Schema/Schema'
import { ThenSchema } from './Schema/ThenSchema'
import { TypeSchema } from './Schema/Type'

interface ISchemaConstructor {
	new (location: string, key: string, value: unknown): Schema
}

export const schemaRegistry = new Map<string, ISchemaConstructor>([
	['$ref', RefSchema],
	['allOf', AllOfSchema],
	['anyOf', AnyOfSchema],
	['const', ConstSchema],
	['enum', EnumSchema],
	['if', IfSchema],
	['patternProperties', PatternPropertiesSchema],
	['properties', PropertiesSchema],
	['required', RequiredSchema],
	['then', ThenSchema],
	['type', TypeSchema],
])

export const ignoreFields = new Set<string>([
	'$schema',
	'$id',
	'additionalProperties', //TODO: Proper implementation of additionalProperties instead of ignoring the field
	'description',
	'title',
])
