import { reactive } from '@vue/composition-api'
import { Remote, wrap } from 'comlink'
import { ESearchType } from './Controls/SearchTypeEnum'
import FindAndReplaceComponent from './Tab.vue'
import type {
	FindAndReplace,
	IQueryOptions,
	IQueryResult,
} from './Worker/Worker'
import { Tab } from '/@/components/TabSystem/CommonTab'

const FindAndReplaceClass = wrap<typeof FindAndReplace>(
	new Worker('./Worker/Worker.ts', { type: 'module' })
)

interface ITabState {
	searchFor: string
	replaceWith: string
	queryOptions: IQueryOptions
	queryResults: IQueryResult[]
}

export class FindAndReplaceTab extends Tab {
	component = FindAndReplaceComponent
	findAndReplace!: Remote<FindAndReplace>
	state = reactive<ITabState>({
		searchFor: '',
		replaceWith: '',
		queryOptions: { searchType: ESearchType.matchCase },
		queryResults: [],
	})

	get displayQueryResults() {
		return this.state.queryResults
			.map(({ filePath, matches }) => [filePath, ...matches])
			.flat()
	}

	async setup() {
		this.findAndReplace = await new FindAndReplaceClass(
			this.parent.projectRoot
		)
		await super.setup()
	}

	async updateQuery() {
		this.state.queryResults = await this.findAndReplace.createQuery(
			this.state.searchFor,
			this.state.replaceWith,
			this.state.queryOptions
		)
	}

	static is() {
		return false
	}
	async isFor() {
		return false
	}

	async onActivate() {}

	get icon() {
		return 'mdi-file-search-outline'
	}
	get iconColor() {
		return 'success'
	}
	get name() {
		return this.parent.app.locales.translate('findAndReplace.name')
	}

	save() {}
}
