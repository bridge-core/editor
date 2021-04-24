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
					:style="`height: ${height - 24}px`"
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
						:items="tab.displayQueryResults"
						:height="height - 40"
						:bench="30"
						item-height="22"
					>
						<template v-slot:default="{ item }">
							<p
								v-if="typeof item === 'string'"
								class="font-weight-black"
							>
								<v-icon
									style="position: relative; top: -2px"
									small
									:color="getIconColor(item)"
								>
									{{ getFileIcon(item) }}
								</v-icon>
								{{ item }}
							</p>
							<div v-else class="code-font code-match">
								<span
									>{{ item.isStartOfFile ? '' : '...'
									}}{{ item.beforeMatch }}</span
								>
								<span
									:class="{
										'error--text text-decoration-line-through': replaceWith,
										'success--text': !replaceWith,
									}"
									>{{ item.match }}</span
								>
								<span
									v-if="replaceWith"
									class="success--text"
									>{{ replaceWith }}</span
								>
								<span>{{ item.afterMatch }}...</span>
							</div>
						</template>
					</v-virtual-scroll>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import { debounce } from 'lodash'
import SearchType from './Controls/SearchType'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { FileType } from '../Data/FileType'
import { PackType } from '../Data/PackType'

export default {
	name: 'FindAndReplaceTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
		height: Number,
	},
	components: {
		SearchType,
	},
	data() {
		return this.tab.state
	},

	methods: {
		updateQuery: debounce(async function () {
			await this.tab.updateQuery()
		}, 200),
		getFileIcon(filePath) {
			return (FileType.get(filePath) || {}).icon ?? 'mdi-file-outline'
		},
		getIconColor(filePath) {
			return (PackType.getWithRelativePath(filePath) || {}).color
		},
	},

	watch: {
		searchFor() {
			this.updateQuery()
		},
		replaceWith() {
			this.updateQuery()
		},
		queryOptions() {
			this.updateQuery()
		},
	},
}
</script>
