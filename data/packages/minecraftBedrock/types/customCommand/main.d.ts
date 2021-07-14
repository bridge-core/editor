declare function defineCommand<T>(
	command: (opts: CommandContext<T>) => void
): (opts: CommandContext<T>) => void

declare interface CommandContext<T> {
	name: (name: string) => void
	schema: (schema: any) => void
	template: (
		templateFunction: (commandArgs: T, opts: TemplateContext) => void
	) => void
}

declare interface TemplateContext {}
