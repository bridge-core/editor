import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'
import SoundTabComponent from './SoundTab.vue'
import { AnyFileHandle } from '../../FileSystem/Types'
import { addDisposableEventListener } from '/@/utils/disposableListener'
import { IDisposable } from '/@/types/disposable'

export class SoundTab extends FileTab {
	component = SoundTabComponent
	dataUrl?: string = undefined

	audio: HTMLAudioElement | null = null
	intervalId: number | null = null
	currentTime = 0
	timeTriggeredManually = false
	isPlaying = false
	loadedAudioMetadata = false
	audioShouldLoop = false
	disposables: IDisposable[] = []

	get icon() {
		return 'mdi-file-music-outline'
	}
	get iconColor() {
		return 'resourcePack'
	}

	static is(fileHandle: AnyFileHandle) {
		const fileName = fileHandle.name
		return fileName.endsWith('.mp3') || fileName.endsWith('.ogg')
	}

	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
	}

	// Tab events
	async setup() {
		this.dataUrl = await loadHandleAsDataURL(this.fileHandle)
		this.audio = document.createElement('audio')
		if (!this.audio) return

		this.audio.preload = 'metadata'
		this.audio.loop = this.audioShouldLoop
		this.audio.src = this.dataUrl

		this.intervalId = window.setInterval(
			() => this.updateCurrentTime(),
			100
		)

		this.disposables = [
			addDisposableEventListener('play', () => this.onPlay(), this.audio),
			addDisposableEventListener(
				'pause',
				() => this.onPause(),
				this.audio
			),
			addDisposableEventListener(
				'loadedmetadata',
				() => this.onLoadedMetadata(),
				this.audio
			),
		]

		await super.setup()
	}
	onDestroy() {
		if (this.intervalId) window.clearInterval(this.intervalId)
		this.intervalId = null

		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []

		this.audio?.pause()
		this.audio = null
	}

	// Sound element events
	onPlay() {
		this.isPlaying = true
	}
	onPause() {
		this.isPlaying = false
	}
	onLoadedMetadata() {
		this.loadedAudioMetadata = true
	}

	updateCurrentTime() {
		this.timeTriggeredManually = false
		this.currentTime = this.audio?.currentTime ?? 0
	}
	toggleAudioLoop() {
		this.audioShouldLoop = !this.audioShouldLoop
		if (this.audio) this.audio.loop = this.audioShouldLoop
	}
	setCurrentTime(time: number) {
		if (!this.audio) return

		if (!this.timeTriggeredManually) {
			this.timeTriggeredManually = true
			return
		}
		if (Number.isNaN(time)) return

		this.audio.currentTime = Math.round(time * 100) / 100
	}

	_save() {}
}
