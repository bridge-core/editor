declare function defineComponent<T>(
	component: (opts: ComponentContext<T>) => void
): (opts: ComponentContext<T>) => void

declare interface ComponentContext<T> {
	name: (name: string) => void
	schema: (schema: any) => void
	template: (
		templateFunction: (componentArgs: T, opts: TemplateContext) => void
	) => void
}
