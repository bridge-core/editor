<template>
	<v-card color="expandedSidebar" style="margin-bottom: 4px">
		<v-card-title
			>{{ plugin.name }} <v-spacer />
			<v-tooltip color="info" right>
				<template v-slot:activator="{ on }">
					<v-icon v-on="on" @click.end="managePlugin">mdi-cog</v-icon>
				</template>
				<span>Manage Plugin</span>
			</v-tooltip>
		</v-card-title>
		<v-card-subtitle
			>v{{ plugin.version }} | by {{ plugin.author }}</v-card-subtitle
		>
		<v-card-text>{{ plugin.description }}</v-card-text>
	</v-card>
</template>

<script>
import { createManagePluginWindow } from '@/components/Windows/Extensions/Manage/definition'

export default {
	name: 'PluginCard',
	props: {
		plugin: {
			name: String,
			description: String,
			id: String,
			version: String,
			author: String,
			active: Boolean,
			link: String,
		},
	},
	methods: {
		managePlugin() {
			createManagePluginWindow(this.plugin)
		},
	},
}
</script>
