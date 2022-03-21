<template>
	<div
		class="px-3 py-2 cursor-pointer"
		:class="{
			selected: tab.isSelected,
			'default-tab-style': true,
			'd-flex': true,
			'align-center': true,
			inactive: !isActive,
		}"
		style="position: relative"
		ref="tabElement"
		@mousedown.left="hoveringBtn ? null : tab.select()"
		@mousedown.middle.prevent
		@click.middle="tab.close()"
		@click.right.prevent="tab.onContextMenu($event)"
		@dblclick="tab.isTemporary = false"
	>
		<!-- Context menu button for touch -->
		<v-btn
			v-if="tab.isSelected && pointerDevice === 'touch'"
			text
			icon
			small
			@click="tab.onContextMenu($event)"
			@mouseenter="hoveringBtn = true"
			@mouseleave="hoveringBtn = false"
		>
			<v-icon>mdi-dots-vertical</v-icon>
		</v-btn>

		<v-badge
			:value="tab.isReadOnly || tab.isUnsaved"
			:class="{ 'mr-3': tab.isReadOnly, 'mr-1': tab.isUnsaved }"
			:color="tab.iconColor"
			:icon="tab.isReadOnly ? 'mdi-lock-outline' : null"
			bordered
			overlap
			depressed
			:dot="tab.isUnsaved && !tab.isReadOnly"
		>
			<v-icon class="mr-1" :color="tab.iconColor" small>
				{{ tab.icon }}
			</v-icon>
		</v-badge>

		<v-tooltip
			color="tooltip"
			open-delay="1500"
			:disabled="pointerDevice === 'touch' || !tab.projectPath"
			bottom
		>
			<template v-slot:activator="{ on }">
				<span v-on="on">
					<span
						:style="{
							'font-style': tab.isTemporary ? 'italic' : null,
							position: tab.folderName ? 'relative' : null,
							top: tab.folderName ? '-4px' : null,
						}"
					>
						{{ tabName }}
					</span>
					<span
						v-if="tab.folderName"
						style="
							position: absolute;
							top: 22px;
							left: 32px;
							font-size: 12px;
							overflow: hidden;
							text-overflow: ellipsis;
						"
						:style="{
							left:
								tab.isSelected && pointerDevice === 'touch'
									? '60px'
									: '32px',
							width:
								tab.isSelected && pointerDevice === 'touch'
									? 'calc(100% - 76px)'
									: 'calc(100% - 48px)',
						}"
					>
						{{ tab.folderName }}/
					</span>
				</span>
			</template>
			<span>{{ tab.projectPath }}</span>
		</v-tooltip>

		<v-btn
			@click.stop="tab.close()"
			text
			icon
			small
			@mouseenter="hoveringBtn = true"
			@mouseleave="hoveringBtn = false"
		>
			<v-icon small>mdi-close</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { settingsState } from '../Windows/Settings/SettingsState'
import { Tab } from './CommonTab'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	name: 'TabSystemTab',
	props: {
		tab: Tab,
		isActive: Boolean,
	},
	data: () => ({
		hoveringBtn: false,
	}),
	setup() {
		return {
			pointerDevice,
		}
	},
	mounted() {
		if (this.isSelected) {
			this.$refs.tabElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			})
		}
	},
	computed: {
		compactDesign() {
			if (!settingsState.editor) return true
			if (settingsState.editor.compactTabDesign === undefined) return true

			return settingsState.editor.compactTabDesign
		},
		isSelected() {
			return this.tab.isSelected
		},
		tabName() {
			if (!this.compactDesign || this.isSelected) return this.tab.name

			let baseName = this.tab.name.split('.')
			baseName.pop()
			baseName = baseName.join('.')

			return baseName.length > 5
				? baseName.slice(0, 5) + '...'
				: this.tab.name
		},
	},
	watch: {
		isSelected() {
			if (this.isSelected)
				this.$refs.tabElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest',
				})
		},
	},
}
</script>

<style scoped>
.default-tab-style {
	background-color: rgb(var(--v-theme-tabInactive));
	display: inline;
	width: fit-content;
}
.default-tab-style > * {
	opacity: 0.5;
}
.default-tab-style:hover > * {
	opacity: 0.9;
}
.selected > * {
	opacity: 0.9;
}
.selected {
	background-color: rgb(var(--v-theme-tabActive));
}
.inactive {
	opacity: 0.3;
}
</style>
