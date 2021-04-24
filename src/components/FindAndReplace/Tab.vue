<template>
	<div class="px-3">
		<v-row style="flex-wrap: nowrap">
			<v-col cols="3" class="flex-grow-0 flex-shrink-0">
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-magnify"
					outlined
					dense
					hide-details
					autofocus
					label="Search"
					v-model="searchFor"
				/>
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-file-replace-outline"
					outlined
					dense
					hide-details
					label="Replace"
					v-model="replaceWith"
				/>
				<SearchType v-model="queryOptions.searchType" />
			</v-col>
			<v-col
				cols="1"
				style="min-width: 100px; max-width: 100%"
				class="flex-grow-1 flex-shrink-0"
			>
				<v-card
					class="pa-2"
					:style="`white-space: nowrap; height: ${height - 24}px`"
					outlined
					rounded
				>
					<p v-if="queryResults.length === 0">
						{{
							t(
								`findAndReplace.no${
									searchFor === '' ? 'Search' : 'Results'
								}`
							)
						}}
					</p>
					<v-virtual-scroll
						ref="virtualScroller"
						:items="tab.displayQueryResults"
						:height="height - 40"
						:bench="30"
						item-height="22"
						@scroll.native="onScroll"
					>
						<template v-slot:default="{ item }">
							<div
								v-if="typeof item === 'string'"
								class="font-weight-black clickable px-1"
								style="width: fit-content"
								v-ripple
								@click="openFile(item)"
							>
								<v-icon
									style="position: relative; top: -2px"
									small
									:color="getIconColor(item)"
								>
									{{ getFileIcon(item) }}
								</v-icon>
								{{ item }}
							</div>
							<Match
								v-else
								:replaceWith="replaceWith"
								:item="item"
							/>
						</template>
					</v-virtual-scroll>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import SearchType from './Controls/SearchType.vue'
import Match from './Match.vue'

import { debounce } from 'lodash'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { FileType } from '../Data/FileType'
import { PackType } from '../Data/PackType'
import { App } from '/@/App'

export default {
	name: 'FindAndReplaceTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
		height: Number,
	},
	components: {
		SearchType,
		Match,
	},
	mounted() {
		this.$refs.virtualScroller.$el.scrollTop = this.scrollTop
	},
	activated() {
		this.$refs.virtualScroller.$el.scrollTop = this.scrollTop
	},
	data() {
		return this.tab.state
	},

	methods: {
		updateQuery: debounce(async function () {
			await this.tab.updateQuery()
		}, 750),
		getFileIcon(filePath) {
			return (FileType.get(filePath) || {}).icon ?? 'mdi-file-outline'
		},
		getIconColor(filePath) {
			return (PackType.getWithRelativePath(filePath) || {}).color
		},
		async openFile(filePath) {
			const app = await App.getApp()

			const fileHandle = await app.fileSystem.getFileHandle(
				`projects/${app.project.name}/${filePath}`
			)
			app.project.openFile(fileHandle)
		},
		onScroll(event) {
			this.scrollTop = event.target.scrollTop
		},
	},

	watch: {
		searchFor() {
			this.updateQuery()
		},
		queryOptions() {
			this.updateQuery()
		},
		scrollTop() {
			this.$refs.virtualScroller.$el.scrollTop = this.scrollTop
		},
	},
}
</script>
