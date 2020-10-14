import { trigger, on } from './EventSystem'
import debounce from 'lodash.debounce'

window.addEventListener(
	'resize',
	debounce(() => trigger('bridge:onResize'), 100)
)
on('bridge:onSidebarVisibilityChange', () =>
	setTimeout(() => trigger('bridge:onResize'), 200)
)
