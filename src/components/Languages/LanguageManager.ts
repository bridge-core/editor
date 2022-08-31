import { Language } from './Language'
import { LangLanguage } from './Lang'
import { McfunctionLanguage } from './Mcfunction'
import { MoLangLanguage } from './MoLang'

export class LanguageManager {
	public readonly mcfunction = new McfunctionLanguage()

	protected otherLanguages = new Set<Language>([
		new MoLangLanguage(),
		new LangLanguage(),
	])
}
