import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { Manifest } from './Manifest'
import { LogReader } from './LogReader'
import { MemoryCache } from './MemoryCache'
import { ERequestState } from './RequestStatus'

export class LevelDB {
	protected _manifest?: Manifest
	protected _memoryCache?: MemoryCache

	constructor(protected dbDirectory: AnyDirectoryHandle) {}

	get manifest() {
		if (!this._manifest)
			throw new Error(`DB manifest not defined yet; did you open the DB?`)
		return this._manifest
	}
	get memoryCache() {
		if (!this._memoryCache)
			throw new Error(
				`DB memory cache not defined yet; did you open the DB?`
			)
		return this._memoryCache
	}

	async open() {
		this._manifest = new Manifest(this.dbDirectory)
		console.log(this.manifest)
		await this.manifest.load()

		const logReader = new LogReader()
		await logReader.readLogFile(
			await this.dbDirectory.getFileHandle(
				`${this.manifest.version.logNumber
					?.toString()
					.padStart(6, '0')}.log`
			)
		)
		this._memoryCache = new MemoryCache()
		this.memoryCache.load(logReader)
	}

	get(key: Uint8Array) {
		let res = this.memoryCache.get(key)
		if (res.state === ERequestState.Success) return res.value!
		else if (res.state === ERequestState.Deleted) return null

		res = this.manifest.get(key)
		if (res.value === undefined || res.value.length === 0) return null

		return res.value
	}
	keys() {
		return [...this.memoryCache.keys(), ...this.manifest.keys()]
	}
}
