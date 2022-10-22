import { Language } from './Language'
import { LangLanguage } from './Lang'
import { McfunctionLanguage } from './Mcfunction'
import { MoLangLanguage } from './MoLang'

export class LanguageManager {
	protected otherLanguages = new Set<Language>([
		new MoLangLanguage(),
		new LangLanguage(),
		new McfunctionLanguage(),
	])
}
