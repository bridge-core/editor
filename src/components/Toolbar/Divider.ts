import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

export class Divider extends EventDispatcher<void> {
	public readonly id = uuid()
	public readonly type = 'divider'
}
