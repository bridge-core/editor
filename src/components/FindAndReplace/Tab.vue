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
					:label="t('findAndReplace.search')"
					v-model="searchFor"
				/>
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-file-replace-outline"
					outlined
					dense
					hide-details
					:label="t('findAndReplace.replace')"
					v-model="replaceWith"
				/>
				<SearchType class="mb-2" v-model="queryOptions.searchType" />
				<v-btn
					color="primary"
					:disabled="replaceWith === '' || searchFor === ''"
					:loading="tab.isLoading"
					@click="onReplaceAll()"
				>
					<v-icon class="mr-1" small>mdi-file-replace-outline</v-icon>
					{{ t('findAndReplace.replaceAll') }}
				</v-btn>
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
								style="
									display: inline-flex;
									width: calc(100% - 8px);
								"
							>
								<FilePath :filePath="item" />
								<v-spacer />

								<v-btn
									style="position: relative; top: 3px"
									icon
									x-small
									:disabled="replaceWith === ''"
									@click="onReplaceSingleFile(item)"
								>
									<v-icon>mdi-file-replace-outline</v-icon>
								</v-btn>
							</div>

							<Match
								v-else
								:showReplaceWith="!!replaceWith"
								:replaceWith="processReplaceWith(item.match)"
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
import FilePath from './FilePath.vue'

import { debounce } from 'lodash'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { createRegExp, processFileText } from './Utils'

export default {
	name: 'FindAndReplaceTab',
	mixins: [TranslationMixin],
	components: {
		SearchType,
		Match,
		FilePath,
	},

	props: {
		tab: Object,
		height: Number,
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

		onScroll(event) {
			this.scrollTop = event.target.scrollTop
		},
		onReplaceAll() {
			this.tab.executeQuery()
		},
		processReplaceWith(match) {
			return processFileText(
				match,
				createRegExp(this.searchFor, this.queryOptions.searchType),
				this.replaceWith
			)
		},
		onReplaceSingleFile(filePath) {
			this.tab.executeSingleQuery(filePath)
		},
	},

	watch: {
		searchFor() {
			this.updateQuery()
		},
		'queryOptions.searchType'() {
			this.updateQuery()
		},
		scrollTop() {
			this.$refs.virtualScroller.$el.scrollTop = this.scrollTop
		},
	},
}
</script>
