export interface IControl {
	component: unknown
	title: string
	description: string
	key: string
	onChange?: (value: any) => void
}
