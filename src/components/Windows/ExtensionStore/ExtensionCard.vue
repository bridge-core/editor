<template>
	<div class="body-1 pa-4 mb-2 rounded-lg card">
		<div class="d-flex align-center">
			<v-icon v-if="extension.icon" color="accent" class="mr-1">
				{{ extension.icon }}
			</v-icon>
			<h3>{{ extension.name }}</h3>

			<v-spacer />
			<v-btn
				v-if="!extension.isInstalled"
				@click="extension.download()"
				:loading="extension.isLoading"
				color="primary"
				class="rounded-lg elevation-0"
				small
			>
				<v-icon small class="mr-1">mdi-download</v-icon>
				Download
			</v-btn>

			<v-btn
				v-else-if="extension.isUpdateAvailable"
				@click="extension.update()"
				:loading="extension.isLoading"
				color="primary"
				class="rounded-lg elevation-0"
				small
			>
				<v-icon small class="mr-1">mdi-sync</v-icon>
				Update
			</v-btn>

			<v-tooltip v-else color="success" right>
				<template v-slot:activator="{ on }">
					<v-icon color="success" v-on="on">mdi-check</v-icon>
				</template>

				<span>Extension Active</span>
			</v-tooltip>

			<v-tooltip v-if="extension.isInstalled" color="tooltip" right>
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" small icon>
						<v-icon>mdi-dots-vertical</v-icon>
					</v-btn>
				</template>

				<span>More...</span>
			</v-tooltip>
		</div>
		<div class="d-flex mb-4">
			<v-chip
				v-for="tag in tags"
				:key="tag.text"
				class="mr-2"
				:color="tag.color"
				text-color="white"
				small
				@click="
					tag.type === 'search'
						? $emit('search', tag.text)
						: $emit('select', tag.text.toLowerCase())
				"
			>
				<v-icon class="mr-1">{{ tag.icon }}</v-icon>
				{{ tag.text }}
			</v-chip>
		</div>

		<span>{{ extension.description }}</span>
	</div>
</template>

<script>
export default {
	name: 'ExtensionCard',
	props: {
		extension: Object,
	},
	computed: {
		tags() {
			return [
				{
					icon: 'mdi-account-outline',
					color: 'primary',
					text: this.extension.author,
					type: 'search',
				},
				{
					icon: 'mdi-code-braces',
					text: this.extension.displayVersion,
					type: 'search',
				},
			].concat(this.extension.tags)
		},
	},
}
</script>

<style scoped>
.card {
	background-color: var(--v-sidebarNavigation-base);
}
</style>
