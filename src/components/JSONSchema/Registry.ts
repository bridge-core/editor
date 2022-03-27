import { AdditionalPropertiesSchema } from './Schema/AdditionalProperties'
import { AllOfSchema } from './Schema/AllOf'
import { AnyOfSchema } from './Schema/AnyOf'
import { ConstSchema } from './Schema/Const'
import { DefaultSchema } from './Schema/Default'
import { EnumSchema } from './Schema/Enum'
import { IfSchema } from './Schema/IfSchema'
import { ItemsSchema } from './Schema/Items'
import { OneOfSchema } from './Schema/OneOf'
import { PatternPropertiesSchema } from './Schema/PatternProperties'
import { PropertiesSchema } from './Schema/Properties'
import { PropertyNamesSchema } from './Schema/PropertyNames'
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
	['additionalProperties', AdditionalPropertiesSchema],
	['allOf', AllOfSchema],
	['anyOf', AnyOfSchema],
	['const', ConstSchema],
	['enum', EnumSchema],
	['if', IfSchema],
	['items', ItemsSchema],
	['oneOf', OneOfSchema],
	['patternProperties', PatternPropertiesSchema],
	['properties', PropertiesSchema],
	['propertyNames', PropertyNamesSchema],
	['required', RequiredSchema],
	['then', ThenSchema],
	['type', TypeSchema],
	['default', DefaultSchema],
])

export const ignoreFields = new Set<string>([
	'$schema',
	'$id',
	'description', // TODO: Use description for hover text
	'title',
	'definitions',

	//TODO: Proper implementation of the following fields instead of ignoring them
	'pattern',
	'min',
	'max',
	'doNotSuggest',
	'maxItems',
	'minItems',
	'deprecationMessage',
	'examples',
	'minimum',
	'maximum',
])
