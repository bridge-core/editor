<template>
	<div class="mb-6 flex justify-center align-start path-container">
		<v-icon x-large color="primary" class="mr-1">mdi-folder-outline</v-icon>

		<template v-if="mode === 'view'">
			<v-btn text small class="mr-2" @click="mode = 'edit'">
				<v-icon class="mr-1" small>
					{{ path.length === 0 ? 'mdi-plus' : 'mdi-pencil-outline' }}
				</v-icon>
				{{ path.length === 0 ? 'Add subfolder' : 'Edit subfolders' }}
			</v-btn>

			<span @dblclick="mode = 'edit'">
				<span
					v-for="(folder, i) in path.split('/')"
					:key="i"
					class="mr-1"
				>
					{{ folder }}/
				</span>
			</span>
		</template>

		<v-text-field
			v-else
			style="
				display: inline-block;
				width: calc(100% - 44px);
				margin-top: 0;
				padding-top: 0;
			"
			autofocus
			v-model="editedPath"
			:rules="Object.values(rules)"
			dense
			@keydown.enter="tryToViewMode()"
			@blur="tryToViewMode()"
		/>
	</div>
</template>

<script>
import { translate } from '/@/components/Locales/Manager'

const validationRules = {
	alphanumeric: (value) => value.match(/^[a-zA-Z0-9_\/]*$/) !== null,
	noEmptyFolderNames: (value) => value.match(/\/\//g) === null,
}

export default {
	name: 'PresetPath',
	props: {
		value: String,
	},
	data: () => ({
		mode: 'view',
		editedPath: '',
		validationText: '',
		rules: Object.fromEntries(
			Object.entries(validationRules).map(([key, func]) => [
				key,
				(value) =>
					func(value) ||
					translate(`windows.createPreset.validationRule.${key}`),
			])
		),
	}),
	mounted() {
		this.mode = 'view'
		this.editedPath = this.value
		this.sanitizeEditedPath()
	},
	computed: {
		path() {
			return this.editedPath.substring(0, this.editedPath.length - 1)
		},
	},
	methods: {
		sanitizeEditedPath() {
			this.editedPath = this.editedPath
				.replaceAll('\\', '/')
				.replace(/\s+/g, '_')
			if (!this.editedPath.endsWith('/') && this.editedPath !== '')
				this.editedPath = this.editedPath + '/'
		},
		isPathValid() {
			return (
				Object.values(this.rules)
					.map((func) => func(this.editedPath))
					.find((res) => typeof res === 'string') === undefined
			)
		},
		tryToViewMode() {
			if (this.isPathValid()) this.mode = 'view'
		},
	},
	watch: {
		value() {
			this.editedPath = this.value
			this.sanitizeEditedPath()
		},
		mode() {
			if (this.mode !== 'view') return

			this.sanitizeEditedPath()

			this.$emit('input', this.editedPath)
		},
		editedPath() {
			this.validationText = Object.values(this.rules)
				.map((func) => func(this.editedPath))
				.find((res) => typeof res === 'string')
		},
	},
}
</script>

<style scoped>
.path-container {
	position: relative;
	height: 48px;
}
</style>
