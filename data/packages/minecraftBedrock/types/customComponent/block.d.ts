declare interface TemplateContext {
	mode: 'build' | 'dev'
	create: (template: any, location: string) => void
	location: string
	identifier: string
}
