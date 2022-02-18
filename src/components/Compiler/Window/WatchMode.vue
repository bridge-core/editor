<template>
	<v-row class="mb-6" dense xs="12" sm="6" md="4" lg="3" xl="2">
		<v-col>
			<ActionViewer
				v-ripple
				style="margin-bottom: 0 !important"
				@click.native="restartWatchModeAction.trigger()"
				:action="restartWatchModeAction"
				:hideTriggerButton="true"
			/>
		</v-col>
		<v-col v-for="{ id, icon } in settings" :key="id">
			<SettingSheet style="height: 100%">
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
import SettingSheet from './WatchMode/SettingSheet.vue'
import { TranslationMixin } from '../../Mixins/TranslationMixin'

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
			{ id: 'autoFetch', icon: 'mdi-radar' },
		],
	}),
	setup() {
		return {
			restartWatchModeAction,
		}
	},
}
</script>
