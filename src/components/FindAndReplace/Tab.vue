<template>
	<div class="px-3">
		<div class="d-flex" :class="{ 'flex-column': hasLimitedSpace }">
			<v-col
				:cols="hasLimitedSpace ? 12 : 3"
				class="flex-grow-0 flex-shrink-0 align-center"
			>
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-magnify"
					outlined
					dense
					hide-details
					:autofocus="pointerDevice === 'mouse'"
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
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-folder-plus-outline"
					outlined
					dense
					hide-details
					:label="t('findAndReplace.includeFiles')"
					placeholder="e.g. BP/**/*.json, RP/entity"
					v-model="queryOptions.includeFiles"
				/>
				<v-text-field
					class="mb-2"
					prepend-inner-icon="mdi-folder-remove-outline"
					outlined
					dense
					hide-details
					:label="t('findAndReplace.excludeFiles')"
					placeholder="e.g. BP/**/*.json, RP/entity"
					v-model="queryOptions.excludeFiles"
				/>
				<v-btn
					color="primary"
					class="mb-2"
					:disabled="replaceWith === '' || searchFor === ''"
					:loading="tab.isLoading"
					@click="onReplaceAll()"
				>
					<v-icon class="mr-1" small>mdi-file-replace-outline</v-icon>
					{{ t('findAndReplace.replaceAll') }}
				</v-btn>
			</v-col>
			<v-col
				:cols="hasLimitedSpace ? 12 : 9"
				class="flex-grow-1 flex-shrink-0"
			>
				<v-card
					class="pa-2"
					:style="`white-space: nowrap; height: ${
						(hasLimitedSpace ? 400 : height) - 24
					}px`"
					style="background: rgb(var(--v-theme-expandedSidebar))"
					outlined
					rounded
				>
					<p
						v-if="queryResults.length === 0"
						style="white-space: normal"
					>
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
						:height="(hasLimitedSpace ? 400 : height) - 40"
						:bench="30"
						item-height="22"
						@scroll="onScroll"
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
		</div>
	</div>
</template>

<script>
import SearchType from './Controls/SearchType.vue'
import Match from './Match.vue'
import FilePath from './FilePath.vue'

import { debounce } from 'lodash'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { createRegExp, processFileText } from './Utils.ts'
import { pointerDevice } from '/@/utils/pointerDevice'

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

	setup() {
		return {
			pointerDevice,
		}
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
	computed: {
		hasLimitedSpace() {
			return (
				this.$vuetify.display.mobile || this.tab.parent.isSharingScreen
			)
		},
	},

	watch: {
		'tab.uuid'() {
			for (const key in this.tab.state) {
				this[key] = this.tab.state[key]
			}
		},
		searchFor() {
			this.updateQuery()
		},
		'queryOptions.searchType'() {
			this.updateQuery()
		},
		'queryOptions.includeFiles'() {
			this.updateQuery()
		},
		'queryOptions.excludeFiles'() {
			this.updateQuery()
		},
		scrollTop() {
			this.$refs.virtualScroller.$el.scrollTop = this.scrollTop
		},
	},
}
</script>
