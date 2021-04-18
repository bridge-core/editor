declare interface TemplateContext {
	create: (template: any, location: string) => void
	location: string
	identifier: string
}
