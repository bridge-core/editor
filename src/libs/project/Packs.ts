import { BehaviourPack } from './create/packs/BehaviorPack'
import { BridgePack } from './create/packs/Bridge'
import { Pack } from './create/packs/Pack'
import { ResourcePack } from './create/packs/ResourcePack'
import { SkinPack } from './create/packs/SkinPack'

export const packs: {
	[key: string]: Pack | undefined
} = {
	bridge: new BridgePack(),
	behaviorPack: new BehaviourPack(),
	resourcePack: new ResourcePack(),
	skinPack: new SkinPack(),
}
