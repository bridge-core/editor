<template>
	<div>
		<h2 class="mb-2">
			{{ t('windows.createProject.categories.experimentalGameplay') }}
		</h2>

		<v-row dense>
			<v-col
				v-for="experiment in window.experimentalToggles"
				:key="experiment.id"
				xs="12"
				sm="6"
				md="4"
				lg="3"
				xl="2"
			>
				<ExperimentalGameplay
					:experiment="experiment"
					v-model="
						state.createOptions.experimentalGameplay[experiment.id]
					"
					style="height: 100%"
					:dark="false"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup>
import { useTranslations } from '/@/components/Composables/useTranslations'
import ExperimentalGameplay from './Toggle.vue'

const props = defineProps(['window'])
const state = props.window.state

const { t } = useTranslations()
</script>
