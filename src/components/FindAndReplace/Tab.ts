import { reactive, markRaw } from 'vue'
import { Remote, wrap } from 'comlink'
import { Signal } from '../Common/Event/Signal'
import { searchType } from './Controls/searchType'
import FindAndReplaceComponent from './Tab.vue'
import type {
	FindAndReplace,
	IDirectory,
	IQueryOptions,
	IQueryResult,
} from './Worker/Worker'
import { Tab } from '/@/components/TabSystem/CommonTab'
import Worker from './Worker/Worker?worker'
import { TabSystem } from '../TabSystem/TabSystem'
import { Mutex } from '../Common/Mutex'
import { AnyFileHandle } from '../FileSystem/Types'
import { translate } from '../Locales/Manager'

const FindAndReplaceClass = wrap<typeof FindAndReplace>(new Worker())

interface ITabState {
	scrollTop: number
	searchFor: string
	replaceWith: string
	queryOptions: IQueryOptions
	queryResults: IQueryResult[]
}

export class FindAndReplaceTab extends Tab {
	component = markRaw(FindAndReplaceComponent)
	findAndReplace!: Remote<FindAndReplace>
	directories = <IDirectory[]>markRaw([])
	state = <ITabState>reactive({
		scrollTop: 0,
		searchFor: '',
		replaceWith: '',
		queryOptions: {
			isReadOnly: false,
			searchType: searchType.matchCase,
		},
		queryResults: [],
	})
	shouldLoadPackDirs = false
	isSearchFree = new Mutex()

	constructor(
		protected parent: TabSystem,
		directories?: IDirectory[],
		queryOptions?: IQueryOptions
	) {
		super(parent)
		// Support setting queryOptions on tab creation
		if (queryOptions) this.state.queryOptions = queryOptions

		if (directories) this.directories = markRaw(directories)
		else this.shouldLoadPackDirs = true
	}

	async setup() {
		await this.isSearchFree.lock()

		if (this.shouldLoadPackDirs) {
			this.shouldLoadPackDirs = false
			const app = this.parent.app
			const project = app.project

			const packs = project.getPacks()
			for (const packId of packs) {
				const path = project.config.resolvePackPath(packId)
				const directory = await app.fileSystem
					.getDirectoryHandle(path)
					.catch(() => null)

				if (directory)
					this.directories.push({
						directory,
						path,
					})
			}
		}

		this.findAndReplace = await new FindAndReplaceClass(
			this.parent.projectRoot,
			this.parent.project.projectPath
		)
		await super.setup()

		this.isSearchFree.unlock()
	}

	async updateQuery() {
		this.isTemporary = false
		await this.isSearchFree.lock()

		this.isLoading = true
		this.state.queryResults = await this.findAndReplace.createQuery(
			this.directories,
			this.state.searchFor,
			this.state.queryOptions
		)
		this.isLoading = false
		this.state.scrollTop = 0

		this.isSearchFree.unlock()
	}
	async executeQuery() {
		await this.isSearchFree.lock()
		this.isLoading = true

		await this.findAndReplace.executeQuery(
			this.directories,
			this.state.searchFor,
			this.state.replaceWith,
			this.state.queryOptions
		)

		await Promise.all(
			this.state.queryResults.map(({ fileHandle }) =>
				this.parent.app.project.updateHandle(fileHandle)
			)
		)

		this.state.queryResults = []
		this.state.scrollTop = 0

		this.isLoading = false
		this.isSearchFree.unlock()
	}
	async executeSingleQuery(filePath: string, fileHandle: AnyFileHandle) {
		await this.isSearchFree.lock()
		this.isLoading = true

		const oldMatchedFiles = await this.findAndReplace.setMatchedFiles([
			filePath,
		])

		await this.findAndReplace.executeQuery(
			this.directories,
			this.state.searchFor,
			this.state.replaceWith,
			this.state.queryOptions
		)

		await this.findAndReplace.setMatchedFiles(
			oldMatchedFiles.filter(
				(currentFilePath) => currentFilePath !== filePath
			)
		)

		await this.parent.app.project.updateHandle(fileHandle)

		this.state.queryResults = this.state.queryResults.filter(
			(queryResult) => queryResult.filePath !== filePath
		)

		this.isLoading = false
		this.isSearchFree.unlock()
	}

	static is() {
		return false
	}
	async is() {
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
		const t = (key: string) => translate(key)

		return (
			(this.state.queryOptions.isReadOnly
				? t('findAndReplace.findOnly')
				: t('findAndReplace.name')) +
			(this.directories.length === 1
				? `: "${this.directories[0].directory.name}"`
				: '')
		)
	}

	save() {}
}
