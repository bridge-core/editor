<template>
	<v-row class="mb-6" dense>
		<v-col>
			<ActionViewer
				v-ripple
				style="margin-bottom: 0 !important; height: 100%"
				@click.native="restartWatchModeAction.trigger()"
				:action="restartWatchModeAction"
				:hideTriggerButton="true"
			/>
		</v-col>
		<v-col>
			<ActionViewer
				v-ripple
				style="margin-bottom: 0 !important; height: 100%"
				@click.native="recompileChangesAction.trigger()"
				:action="recompileChangesAction"
				:hideTriggerButton="true"
			/>
		</v-col>
		<v-col v-for="{ id, icon } in settings" :key="id">
			<SettingSheet
				v-model="settingsState.compiler[id]"
				style="height: 100%"
				@input="data.shouldSaveSettings = true"
			>
				<template #header>
					<div class="d-flex align-center">
						<v-icon color="accent" class="mr-1">
							{{ icon }}
						</v-icon>
						<h3>
							{{
								t(
									`sidebar.compiler.categories.watchMode.settings.${id}.name`
								)
							}}
						</h3>
					</div>
				</template>

				<template>
					{{
						t(
							`sidebar.compiler.categories.watchMode.settings.${id}.description`
						)
					}}
				</template>
			</SettingSheet>
		</v-col>
	</v-row>
</template>

<script>
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { restartWatchModeAction } from '../Actions/RestartWatchMode'
import { recompileChangesAction } from '../Actions/RecompileChanges'
import SettingSheet from './WatchMode/SettingSheet.vue'
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import { settingsState } from '../../Windows/Settings/SettingsState'
import { set } from 'vue'

export default {
	components: {
		ActionViewer,
		SettingSheet,
	},
	mixins: [TranslationMixin],
	props: {
		data: Object,
	},
	data: () => ({
		settings: [
			{ id: 'watchModeActive', icon: 'mdi-eye-outline' },
			{ id: 'autoFetchChangedFiles', icon: 'mdi-radar' },
		],
	}),
	setup() {
		if (!settingsState.compiler) {
			set(settingsState, 'compiler', {
				watchModeActive: true,
				autoFetchChangedFiles: true,
			})
		}

		return {
			recompileChangesAction,
			restartWatchModeAction,
			settingsState,
		}
	},
}
</script>
