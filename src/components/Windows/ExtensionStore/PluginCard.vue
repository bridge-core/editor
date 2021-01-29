<template>
	<div class="body-1 pa-4 mb-2 rounded-lg card">
		<div class="d-flex align-center">
			<v-icon v-if="plugin.icon" color="accent" class="mr-1">
				{{ plugin.icon }}
			</v-icon>
			<h3>{{ plugin.name }}</h3>

			<v-spacer />
			<v-tooltip color="primary" left>
				<template v-slot:activator="{ on }">
					<v-btn
						v-on="on"
						@click="plugin.download()"
						:loading="plugin.isLoading"
						color="primary"
						small
						icon
					>
						<v-icon>mdi-download-circle-outline</v-icon>
					</v-btn>
				</template>

				<span>Download Extension</span>
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

		<span>{{ plugin.description }}</span>
	</div>
</template>

<script>
export default {
	name: 'PluginCard',
	props: {
		plugin: Object,
	},
	computed: {
		tags() {
			return [
				{
					icon: 'mdi-account-outline',
					color: 'primary',
					text: this.plugin.author,
					type: 'search',
				},
				{
					icon: 'mdi-code-braces',
					text: this.plugin.version,
					type: 'search',
				},
			].concat(this.plugin.tags)
		},
	},
}
</script>

<style scoped>
.card {
	background-color: var(--v-sidebarNavigation-base);
}
</style>
