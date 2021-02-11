<template>
	<div
		class="d-flex flex-column justify-center align-center"
		:style="`padding-top: 14vh;`"
	>
		<div
			class="d-flex flex-grow align-center mb-2 pa-4 rounded-lg content-area justify-center"
			style="width: 384px;"
		>
			<img
				style="height: 48px; width: 48px; "
				class="mr-1"
				alt="bridge. Logo"
				src="@/_assets/logo_high_res.png"
			/>
			<h1 class="text-h3">{{ t('welcome.title') }}</h1>
		</div>
		<!-- <h2>{{ t('welcome.subtitle') }}</h2> -->

		<ul class="rounded-lg content-area pa-4 mb-4" style="width: 384px;">
			<li>
				<v-icon color="accent" small>mdi-auto-fix</v-icon>
				<span>{{ t('welcome.syntaxHighlighting') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-format-list-bulleted</v-icon>
				<span>{{ t('welcome.richAutoCompletions') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-folder-multiple</v-icon>
				<span>{{ t('welcome.projectManagement') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-code-json</v-icon>
				<span>{{ t('welcome.customSyntax') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-package-variant</v-icon>
				<span>{{ t('welcome.customComponents') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-console-line</v-icon>
				<span>{{ t('welcome.customCommands') }}</span>
			</li>
			<li>
				<v-icon color="accent" small>mdi-nodejs</v-icon>
				<span>{{ t('welcome.plugins') }}</span>
			</li>
		</ul>

		<div>
			<ActionViewer
				v-ripple
				v-for="action in actions"
				:key="action.id"
				:action="action"
				hideTriggerButton
				dense
				style="width: 384px;"
				@click.native="action.trigger"
			/>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import ActionViewer from '@/components/Actions/ActionViewer'
import { App } from '@/App'

export default {
	name: 'welcome-screen',
	mixins: [TranslationMixin],
	components: {
		ActionViewer,
	},

	async mounted() {
		const app = await App.getApp()
		const toLoad = [
			'bridge.action.newFile',
			'bridge.action.openFile',
			'bridge.action.openSettings',
		]
		this.actions = toLoad.map(l => app.actionManager.state[l])
	},

	data: () => ({
		actions: [],
	}),
}
</script>

<style scoped>
div,
li {
	list-style-type: none;
}
span {
	margin-left: 4px;
}

.content-area {
	background-color: var(--v-welcomeTile-base);
}
</style>
