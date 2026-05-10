import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { useCurrentProjectHeadless } from '@/libs/project/ProjectManager'
import { Settings } from '@/libs/settings/Settings'
import { IPackType } from 'mc-project-core'
import { join } from 'pathe'
import { computed, ComputedRef, Ref, ref } from 'vue'

export class FileExplorer {
	public static open = ref(true)

	public static draggedItem: Ref<BaseEntry | null> = ref(null)

	private static currentProject = useCurrentProjectHeadless()

	public static selectedPack: Ref<string> = ref('')

	public static selectedPackDefinition: ComputedRef<IPackType | null> = computed(() => {
		if (!this.currentProject.value) return null
		if (!(this.currentProject.value instanceof BedrockProject)) return null

		return this.currentProject.value.packDefinitions.find((pack: IPackType) => pack.id === this.selectedPack.value) ?? null
	})

	public static selectedPackPath: ComputedRef<string> = computed(() => {
		if (!this.currentProject.value) return ''
		if (!(this.currentProject.value instanceof BedrockProject)) return ''

		return (
			this.currentProject.value.packs[this.selectedPack.value] ??
			join(
				this.currentProject.value.path,
				this.currentProject.value.packDefinitions.find((pack: IPackType) => pack.id === this.selectedPack.value)?.defaultPackPath ??
					''
			)
		)
	})

	public static setup() {
		Settings.addSetting('fileExplorerIndentation', {
			default: 'normal',
		})
	}

	public static toggle() {
		FileExplorer.open.value = !FileExplorer.open.value
	}

	public static isItemDragging(): boolean {
		return this.draggedItem.value !== null
	}
}
