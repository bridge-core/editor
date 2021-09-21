import { settingsState } from '../Windows/Settings/SettingsState'

export class AudioManager {
	protected currentAudioPlaying: HTMLAudioElement | undefined

	masterVolume = 1
	isMuted = !settingsState?.audio?.playAudio ?? true

	constructor() {}

	loadIsMuted() {
		this.isMuted = !settingsState?.audio?.playAudio
	}

	playAudio(audioName = 'click5.ogg', audioVolume = 1) {
		const audioPath = import.meta.env.BASE_URL + 'audio/'
		if (this.isMuted) return

		if (this.currentAudioPlaying) {
			if (
				this.currentAudioPlaying.currentTime /
					this.currentAudioPlaying.duration ==
				1
			) {
				this.currentAudioPlaying = new Audio(audioPath + audioName)
				this.currentAudioPlaying.volume =
					audioVolume * this.masterVolume
				this.currentAudioPlaying.play()
			}
		} else {
			this.currentAudioPlaying = new Audio(audioPath + audioName)
			this.currentAudioPlaying.volume = audioVolume * this.masterVolume
			this.currentAudioPlaying.play()
		}
	}
}
