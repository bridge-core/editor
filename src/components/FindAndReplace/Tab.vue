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
					:style="`overflow: auto; height: ${height - 24}px`"
					outlined
					rounded
				>
					<div
						v-for="({ filePath, matches }, i) in queryResults"
						:key="i"
					>
						<h2>{{ filePath }}</h2>
						<div
							v-for="(
								{ beforeMatch, match, afterMatch }, i
							) in matches"
							:key="i"
							class="code-font"
						>
							<span>...{{ beforeMatch }}</span>
							<span
								:class="{
									'error--text text-decoration-line-through': replaceWith,
									'success--text': !replaceWith,
								}"
								>{{ match }}</span
							>
							<span v-if="replaceWith" class="success--text">{{
								replaceWith
							}}</span>
							<span>{{ afterMatch }}...</span>
						</div>
					</div>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import { debounce } from 'lodash'
import SearchType from './Controls/SearchType'

export default {
	name: 'FindAndReplaceTab',
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
		}, 750),
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
