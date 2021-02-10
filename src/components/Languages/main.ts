import './mcfunction'
import './lang'
import { Language } from './addLanguage'
import { MoLangLanguage } from './molang'

export class LanguageManager {
	protected languages = new Set<Language>([new MoLangLanguage()])
}
