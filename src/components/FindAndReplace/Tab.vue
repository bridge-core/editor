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
					v-model="state.searchFor"
				/>
				<v-text-field
					v-if="!state.queryOptions.isReadOnly"
					class="mb-2"
					prepend-inner-icon="mdi-file-replace-outline"
					outlined
					dense
					hide-details
					:label="t('findAndReplace.replace')"
					v-model="state.replaceWith"
				/>
				<v-btn
					v-if="!state.queryOptions.isReadOnly"
					color="primary"
					class="mb-2"
					block
					:disabled="
						state.replaceWith === '' || state.searchFor === ''
					"
					:loading="tab.isLoading"
					@click="onReplaceAll()"
				>
					<v-icon class="mr-1" small>mdi-file-replace-outline</v-icon>
					{{ t('findAndReplace.replaceAll') }}
				</v-btn>
				<SearchType
					class="mb-2"
					v-model="state.queryOptions.searchType"
				/>
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
					style="background: var(--v-expandedSidebar-base)"
					outlined
					rounded
				>
					<p
						v-if="state.queryResults.length === 0"
						style="white-space: normal"
					>
						{{
							t(
								`findAndReplace.no${
									state.searchFor === ''
										? 'Search'
										: 'Results'
								}`
							)
						}}
					</p>
					<v-virtual-scroll
						ref="virtualScroller"
						:items="displayQueryResults"
						:height="(hasLimitedSpace ? 400 : height) - 40"
						:bench="30"
						item-height="22"
						@scroll.native="onScroll"
					>
						<template v-slot:default="{ item }">
							<div
								v-if="item.filePath"
								style="
									display: inline-flex;
									width: calc(100% - 8px);
								"
							>
								<FilePath
									:filePath="item.filePath"
									:displayFilePath="item.displayFilePath"
									:fileHandle="item.fileHandle"
								/>
								<v-spacer />

								<v-btn
									v-if="!state.queryOptions.isReadOnly"
									style="position: relative; top: 3px"
									icon
									x-small
									:disabled="state.replaceWith === ''"
									@click="
										onReplaceSingleFile(
											item.filePath,
											item.fileHandle
										)
									"
								>
									<v-icon>mdi-file-replace-outline</v-icon>
								</v-btn>
							</div>

							<Match
								v-else
								:showReplaceWith="!!state.replaceWith"
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

<script lang="ts" setup>
import SearchType from './Controls/SearchType.vue'
import Match from './Match.vue'
import FilePath from './FilePath.vue'

import { debounce } from 'lodash-es'
import { createRegExp, processFileText } from './Utils'
import {
	computed,
	onActivated,
	onMounted,
	ref,
	set,
	watch,
	watchEffect,
} from 'vue'
import { pointerDevice } from '/@/utils/pointerDevice'
import { useTranslations } from '../Composables/useTranslations'
import { Component } from 'vue/types/umd'
import { Event } from 'three'
import { AnyFileHandle } from '../FileSystem/Types'
import { App } from '/@/App'

const { t } = useTranslations()
const props = defineProps({
	tab: {
		type: Object,
		required: true,
	},

	height: Number,
})

const state = computed(() => props.tab.state)
const hasLimitedSpace = computed(
	() => App.instance.mobile.is.value || props.tab.parent.isSharingScreen.value
)
const displayQueryResults = computed(() => {
	return state.value.queryResults
		.map(({ matches, ...other }: any) => [other, ...matches])
		.flat()
})

const virtualScroller = ref<any | null>(null)
onMounted(() => {
	if (virtualScroller.value)
		virtualScroller.value.$el.scrollTop = state.value.scrollTop
})
onActivated(() => {
	if (virtualScroller.value)
		virtualScroller.value.$el.scrollTop = state.value.scrollTop
})

const updateQuery = debounce(async function () {
	await props.tab.updateQuery()
}, 250)

function onScroll(event: Event) {
	state.value.scrollTop = event.target.scrollTop
}
function onReplaceAll() {
	props.tab.executeQuery()
}
function processReplaceWith(match: string) {
	return processFileText(
		match,
		createRegExp(
			state.value.searchFor,
			state.value.queryOptions.searchType
		)!,
		state.value.replaceWith
	)
}
function onReplaceSingleFile(filePath: string, fileHandle: AnyFileHandle) {
	props.tab.executeSingleQuery(filePath, fileHandle)
}

let lastSearchQuery = ''
let lastSearchType = 0
watchEffect(() => {
	if (
		state.value.searchFor !== lastSearchQuery ||
		state.value.queryOptions.searchType !== lastSearchType
	) {
		lastSearchQuery = state.value.searchFor
		lastSearchType = state.value.queryOptions.searchType
		updateQuery()
	}
})
</script>
