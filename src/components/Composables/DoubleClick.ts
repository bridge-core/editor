import { pointerDevice } from '/@/libs/pointerDevice'

export function useDoubleClick<T>(
	onClick: (isDoubleClick: boolean, ...args: T[]) => void,
	alwaysTriggerSingleClick: boolean = false
) {
	let timer: number | null = null
	let clickedAmount = 0

	return (...args: T[]) => {
		if (pointerDevice.value === 'touch') return onClick(false, ...args)

		if (clickedAmount === 0) {
			clickedAmount++
			if (alwaysTriggerSingleClick) onClick(false, ...args)

			timer = window.setTimeout(() => {
				clickedAmount = 0
				timer = null
				if (!alwaysTriggerSingleClick) onClick(false, ...args)
			}, 500)
		} else {
			if (timer) window.clearTimeout(timer)
			clickedAmount = 0
			onClick(true, ...args)
		}
	}
}
