<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'
import Icon from '@/components/Common/Icon.vue'
import Switch from '@/components/Common/Switch.vue'
import InformativeToggle from '@/components/Common/InformativeToggle.vue'

import { ComputedRef, Ref, computed, onMounted, ref, watch } from 'vue'
import { IPackType } from 'mc-project-core'
import { ExperimentalToggle, useGetData } from '@/libs/data/Data'
import { useTranslate } from '@/libs/locales/Locales'
import { Windows } from '../Windows'
import { ImportComMojangProject } from './ImportComMojangProject'
import TextButton from '@/components/Common/TextButton.vue'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()
const isMobile = useIsMobile()
const getData = useGetData()

const packTypes: Ref<IPackType[]> = ref([])
const selectedPackTypes: Ref<IPackType[]> = ref([])

const experimentalToggles: Ref<ExperimentalToggle[]> = ref([])
const selectedExperimentalToggles: Ref<ExperimentalToggle[]> = ref([])

async function setup() {
	packTypes.value = (await getData.value('packages/minecraftBedrock/packDefinitions.json')) || []

	experimentalToggles.value = (await getData.value('packages/minecraftBedrock/experimentalGameplay.json')) || []
}

const validationError: ComputedRef<string | null> = computed(() => {
	if (selectedPackTypes.value.length === 0) return 'windows.createProject.errors.noPacks'

	return null
})

function importProject() {}

watch(getData, setup)
onMounted(setup)
</script>

<template>
	<Window :name="t('windows.createProject.title')" @close="Windows.close(ImportComMojangProject)">
		<div class="flex flex-col pb-8 grow" :class="{ 'h-[42.5rem] max-width': !isMobile }">
			<div class="overflow-auto p-4 pt-0 m-4 mt-2 basis-0 grow">
				<div class="flex justify-stretch flex-wrap gap-3 mb-4">
					<InformativeToggle
						v-for="packType in packTypes"
						:icon="packType.icon"
						:color="packType.color"
						:name="t(`packType.${packType.id}.name`)"
						:description="t(`packType.${packType.id}.description`)"
						:selected="selectedPackTypes.includes(packType)"
						@click="selectPackType(packType)"
					>
						<div class="flex items-center my-4" v-if="packType.id === 'behaviorPack'">
							<Switch
								class="mr-2"
								border-color="backgroundTertiary"
								:model-value="linkResourcePack"
								@update:model-value="setLinkResourcePack"
							/>
							<span class="text-xs text-text-secondary select-none font-theme">{{
								t('windows.createProject.rpAsBpDependency')
							}}</span>
						</div>

						<div class="flex items-center my-4" v-if="packType.id === 'resourcePack'">
							<Switch
								class="mr-2"
								border-color="backgroundTertiary"
								:model-value="linkBehaviourPack"
								@update:model-value="setLinkBehaviourPack"
							/>
							<span class="text-xs text-text-secondary select-none font-theme">{{
								t('windows.createProject.bpAsRpDependency')
							}}</span>
						</div>
					</InformativeToggle>
				</div>
			</div>

			<div class="mx-8 flex justify-between items-center">
				<div class="flex items-center gap-2">
					<Icon v-if="validationError !== null" icon="error" class="text-sm text-error" />

					<p class="text-error font-theme text-xs h-min">{{ validationError !== null ? t(validationError) : '' }}</p>
				</div>

				<TextButton
					:text="t('Create')"
					@click="importProject"
					class="transition-[color, opacity]"
					:enabled="validationError === null"
				/>
			</div>
		</div>
	</Window>
</template>

<style scoped>
.max-width {
	max-width: min(90vw, 67rem);
}

.light-scroll::-webkit-scrollbar-thumb {
	background-color: var(--theme-color-backgroundTertiary);
}
</style>
