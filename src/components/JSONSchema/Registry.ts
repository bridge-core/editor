import { AdditionalPropertiesSchema } from './Schema/AdditionalProperties'
import { AllOfSchema } from './Schema/AllOf'
import { AnyOfSchema } from './Schema/AnyOf'
import { ConstSchema } from './Schema/Const'
import { DefaultSchema } from './Schema/Default'
import { DoNotSuggestSchema } from './Schema/DoNotSuggest'
import { ElseSchema } from './Schema/ElseSchema'
import { EnumSchema } from './Schema/Enum'
import { IfSchema } from './Schema/IfSchema'
import { ItemsSchema } from './Schema/Items'
import { NotSchema } from './Schema/Not'
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
	['else', ElseSchema],
	['doNotSuggest', DoNotSuggestSchema],
	['not', NotSchema],
])

export const ignoreFields = new Set<string>([
	'$schema',
	'$id',
	'description', // Uses special parsing. Description is used for context menu information
	'title', // Uses special parsing. Title is used for context menu information
	'definitions',

	//TODO: Proper implementation of the following fields instead of ignoring them
	'pattern',
	'min',
	'max',
	'maxItems',
	'minItems',
	'deprecationMessage',
	'examples',
	'minimum',
	'maximum',
	'format',
	'maxLength',
	'multipleOf',
])
