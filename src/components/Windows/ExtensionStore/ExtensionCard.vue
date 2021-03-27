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

			<v-tooltip
				v-else
				:color="extension.isActive ? 'success' : 'error'"
				right
			>
				<template v-slot:activator="{ on }">
					<v-icon v-if="extension.isActive" color="success" v-on="on">
						mdi-check
					</v-icon>
					<v-icon v-else color="error" v-on="on">mdi-close</v-icon>
				</template>

				<span>
					{{
						extension.isActive
							? 'Extension Active'
							: 'Extension Inactive'
					}}
				</span>
			</v-tooltip>

			<v-menu
				v-if="extension.isInstalled"
				v-model="extension.showMenu"
				offset-y
				offset-x
				rounded="lg"
			>
				<template v-slot:activator="{ on, attrs }">
					<v-btn v-on="on" v-bind="attrs" small icon>
						<v-icon>mdi-dots-vertical</v-icon>
					</v-btn>
				</template>

				<v-list dense>
					<v-list-item
						v-for="(action, index) in extension.actions"
						:key="index"
						@click.stop="action.trigger()"
					>
						<v-list-item-icon>
							<v-icon color="primary"> {{ action.icon }}</v-icon>
						</v-list-item-icon>
						<v-list-item-title>
							{{ t(action.name) }}
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</div>
		<div class="d-flex mb-4">
			<v-chip
				v-for="tag in tags"
				:key="tag.text"
				class="mr-2"
				:color="tag.color"
				:text-color="tag.color ? 'white' : undefined"
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
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'ExtensionCard',
	mixins: [TranslationMixin],
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
