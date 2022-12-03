import { createSignal } from 'solid-js'
import { SolidIcon } from '../Solid/Icon/SolidIcon'
import { SolidButton } from '../Solid/Inputs/Button/SolidButton'

export function MySolidComponent() {
	const [icon, setIcon] = createSignal('home')

	return (
		<>
			<SolidButton onClick={() => setIcon('close')}>
				<SolidIcon
					color="primary"
					size="lg"
					icon={icon()}
					opacity={icon() === 'close' ? 1 : 0.2}
				/>
			</SolidButton>

			<h1>My Solid Component</h1>
			<p>Hello World!</p>
		</>
	)
}

console.log(MySolidComponent())
