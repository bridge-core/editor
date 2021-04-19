declare interface TemplateContext {
	create: (template: any, location: string) => void
	location: string
	identifier: string
	player: {
		create: (template: any, location: string) => void
		animation: (animation: any) => void
		animationController: (animationController: any) => void
	}
}
