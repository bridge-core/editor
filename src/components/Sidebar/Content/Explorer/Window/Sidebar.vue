<template>
	<div>
		<h1>Categories</h1>

		<div
			v-for="(category, i) in sortedCategories"
			class="pa-1 rounded-lg category"
			:class="{ selected: i === selected }"
			:key="category.name + i"
			v-ripple="selected !== i"
			@click="selected = i"
		>
			<v-icon
				:color="category.iconColor"
				class="pr-1"
				style="font-size: 22px;"
			>
				{{ category.icon }}
			</v-icon>
			<span>{{ category.displayName || category.name }}</span>
		</div>
	</div>
</template>

<script>
import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'

export default {
	data: () => ({
		selected: 0,
		categories: [],
	}),
	mounted() {
		App.instance.packIndexer.readdir([]).then(dirents => {
			dirents.forEach(({ name, kind }) => {
				const fileType = FileType.get(undefined, name)
				const packType = fileType
					? PackType.get(
							`projects/*/${
								fileType.matcher === 'string'
									? fileType.matcher
									: fileType.matcher[0]
							}`
					  )
					: undefined

				this.categories.push({
					packType: packType ? packType.id : 'unknown',
					icon:
						fileType && fileType.icon
							? fileType.icon
							: 'mdi-folder',
					iconColor: packType ? packType.color : undefined,
					name,
				})
			})
			this.$nextTick(() =>
				this.$emit(
					'sidebarChanged',
					this.categories[this.selected].name
				)
			)
		})
	},

	computed: {
		sortedCategories() {
			return this.categories.sort((a, b) => {
				if (a.packType !== b.packType)
					return a.packType.localeCompare(b.packType)
				return a.name.localeCompare(b.name)
			})
		},
	},
	watch: {
		selected() {
			this.$emit('sidebarChanged', this.categories[this.selected].name)
		},
	},
}
</script>

<style scoped>
.selected {
	background-color: var(--v-sidebarSelection-base);
}
.category:not(.selected) {
	opacity: 0.7;
	cursor: pointer;
}
</style>
