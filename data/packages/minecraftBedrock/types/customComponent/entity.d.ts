declare interface TemplateContext {
	mode: 'build' | 'dev'
	create: (template: any, location: string) => void
	animation: (animation: any, condition?: string | false) => void
	animationController: (
		animationController: any,
		condition?: string | false
	) => void
	location: string
	identifier: string
}
