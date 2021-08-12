import { Signal } from '/@/components/Common/Event/Signal'

export class InitialSetup {
	public static readonly ready = new Signal<void>()
}
