declare interface TemplateContext {
	mode: 'build' | 'dev'
	create: (template: any, location: string) => void
	animation: (animation: any) => void
	animationController: (animationController: any) => void
	location: string
	identifier: string
}
