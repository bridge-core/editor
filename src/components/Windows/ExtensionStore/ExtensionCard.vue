<template>
	<div class="text-normal pa-4 mb-2 rounded-lg card">
		<div class="d-flex align-center mb-2">
			<v-icon v-if="extension.icon" color="accent" class="mr-1">
				{{ extension.icon }}
			</v-icon>
			<h3>{{ extension.name }}</h3>

			<v-spacer />
			<!-- Read more about extension -->
			<v-btn
				v-if="extension.readme"
				class="mr-1"
				icon
				@click="openUrl(extension.readme)"
			>
				<v-icon>mdi-information-outline</v-icon>
			</v-btn>

			<!-- Share Extension -->
			<v-btn
				v-if="extension.canShare"
				class="mr-1"
				icon
				@click="extension.share()"
			>
				<v-icon>mdi-share</v-icon>
			</v-btn>

			<v-btn
				v-if="!extension.isInstalled"
				@click="extension.download()"
				:loading="extension.isLoading"
				:disabled="!extension.isCompatibleVersion()"
				color="primary"
				class="rounded-lg elevation-0"
				small
			>
				<v-icon :small="!isMobile" :class="{ 'mr-1': !isMobile }">
					mdi-download
				</v-icon>
				<span v-if="!isMobile">Download</span>
			</v-btn>

			<v-btn
				v-else-if="extension.isUpdateAvailable"
				@click="extension.update()"
				:loading="extension.isLoading"
				color="primary"
				class="rounded-lg elevation-0"
				small
			>
				<v-icon :small="!isMobile" :class="{ 'mr-1': !isMobile }">
					mdi-sync
				</v-icon>
				<span v-if="!isMobile">Update</span>
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

				<v-list color="menu" dense>
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
		<v-row class="mb-4" dense>
			<v-col v-for="tag in tags" :key="tag.text" class="flex-grow-0">
				<v-chip
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
			</v-col>
		</v-row>

		<span>{{ extension.description }}</span>

		<v-divider
			v-if="
				extension.compilerPlugins.length > 0 ||
				!extension.isCompatibleVersion()
			"
			class="my-2"
		/>

		<div
			class="d-flex align-center"
			v-if="extension.compilerPlugins.length > 0"
		>
			<v-icon class="pr-1" color="secondary">mdi-cogs</v-icon>
			<span class="font-weight-bold">
				{{
					t(
						'windows.extensionStore.compilerPluginDownload.compilerPlugins'
					)
				}}:&nbsp;
			</span>

			<span>
				{{ compilerPlugins }}
			</span>
		</div>

		<div
			v-if="!extension.isCompatibleVersion()"
			class="d-flex align-center pt-1"
		>
			<v-icon class="pr-1" color="error">mdi-alert-circle</v-icon>
			<span class="font-weight-bold">
				{{ t('windows.extensionStore.incompatibleVersion') }}</span
			>
		</div>
	</div>
</template>

<script>
import { App } from '/@/App'
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
					text: this.extension.onlineVersion,
					type: 'search',
				},
			].concat(this.extension.tags)
		},
		isMobile() {
			return this.$vuetify.breakpoint.mobile
		},
		compilerPlugins() {
			return this.extension.compilerPlugins
				.map((plugin) => `"${plugin}"`)
				.join(', ')
		},
	},
	methods: {
		openUrl(url) {
			App.openUrl(url)
		},
	},
}
</script>

<style scoped>
.card {
	background-color: var(--v-sidebarNavigation-base);
}
</style>
