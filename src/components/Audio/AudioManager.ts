import { computed } from '@vue/composition-api'
import { settingsState } from '../Windows/Settings/SettingsState'
import { App } from '/@/App'

export class AudioManager {
	protected currentAudioPlaying: HTMLAudioElement | undefined

	masterVolume = 1
	isMuted = !settingsState?.audio?.playAudio ?? true

	constructor() {
		App.getApp().then(() => {
			this.isMuted = !settingsState?.audio?.playAudio
		})
	}

	playAudio(audioName = 'click5.ogg', audioVolume = 1) {
		const audioPath = process.env.BASE_URL + 'audio/'
		if (this.isMuted) return
		console.log('PLAYOING')

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
