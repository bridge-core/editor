export interface IActivatable {
	activate: () => Promise<void> | void
	deactivate: () => Promise<void> | void
}
