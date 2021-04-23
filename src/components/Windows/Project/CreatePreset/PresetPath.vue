<template>
	<div class="mb-6 flex justify-center align-end">
		<v-icon large color="primary" class="mr-1">mdi-folder-outline</v-icon>

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
				width: calc(100% - 42px);
				margin-top: 0;
				padding-top: 0;
			"
			v-model="editedPath"
			autofocus
			hide-details
			@keydown.enter="mode = 'view'"
			@blur="mode = 'view'"
		></v-text-field>
	</div>
</template>

<script>
export default {
	name: 'PresetPath',
	props: {
		value: String,
	},
	data: () => ({
		mode: 'view',
		editedPath: '',
	}),
	mounted() {
		this.mode = 'view'
		this.editedPath = this.value
	},
	computed: {
		path() {
			return this.value.substring(0, this.value.length - 1)
		},
	},
	watch: {
		mode() {
			if (this.mode !== 'view') return

			this.editedPath = this.editedPath
				.replaceAll('\\', '/')
				.replace(/\s+/g, '_')
			if (!this.editedPath.endsWith('/'))
				this.editedPath = this.editedPath + '/'

			this.$emit('input', this.editedPath)
		},
	},
}
</script>

<style></style>
