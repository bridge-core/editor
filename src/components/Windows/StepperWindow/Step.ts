export interface IStep<T = any> {
	id: string
	name: string
	icon: string
	color?: string
	state?: T
	component: any
}
