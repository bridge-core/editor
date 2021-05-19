import { App } from '/@/App'

export class AudioManager {
	protected currentAudioPlaying: HTMLAudioElement | undefined

	masterVolume = 1

	playAudio(audioName: string, audioVolume: number) {
		if (this.currentAudioPlaying) {
			console.log('Audio Exists')
			if (
				this.currentAudioPlaying.currentTime /
					this.currentAudioPlaying.duration ==
				1
			) {
				console.log('Audio Done')
				this.currentAudioPlaying = new Audio('/audio/' + audioName)
				this.currentAudioPlaying.volume =
					audioVolume * this.masterVolume
				this.currentAudioPlaying.play()
			} else {
				console.log('Audio Not Done')
			}
		} else {
			console.log("Audio Doesn't Exists")
			this.currentAudioPlaying = new Audio('/audio/' + audioName)
			this.currentAudioPlaying.volume = audioVolume
			this.currentAudioPlaying.play()
		}
	}
}
