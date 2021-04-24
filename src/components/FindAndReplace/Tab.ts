import { reactive } from '@vue/composition-api'
import { Remote, wrap } from 'comlink'
import { Signal } from '../Common/Event/Signal'
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
	scrollTop: number
	searchFor: string
	replaceWith: string
	queryOptions: IQueryOptions
	queryResults: IQueryResult[]
}

export class FindAndReplaceTab extends Tab {
	component = FindAndReplaceComponent
	findAndReplace!: Remote<FindAndReplace>
	state = reactive<ITabState>({
		scrollTop: 0,
		searchFor: '',
		replaceWith: '',
		queryOptions: { searchType: ESearchType.matchCase },
		queryResults: [],
	})
	searchReady = new Signal<void>()

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
		this.searchReady.dispatch()
	}

	async updateQuery() {
		await this.searchReady.fired
		this.searchReady.resetSignal()

		this.isLoading = true
		this.state.queryResults = await this.findAndReplace.createQuery(
			this.state.searchFor,
			this.state.replaceWith,
			this.state.queryOptions
		)
		this.isLoading = false
		this.state.scrollTop = 0

		this.searchReady.dispatch()
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
