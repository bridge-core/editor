export class AudioManager {
	protected currentAudioPlaying: HTMLAudioElement | undefined

	masterVolume = 1

	playAudio(audioName = 'click5.ogg', audioVolume = 1) {
		if (this.currentAudioPlaying) {
			if (
				this.currentAudioPlaying.currentTime /
					this.currentAudioPlaying.duration ==
				1
			) {
				this.currentAudioPlaying = new Audio('./audio/' + audioName)
				this.currentAudioPlaying.volume =
					audioVolume * this.masterVolume
				this.currentAudioPlaying.play()
			}
		} else {
			this.currentAudioPlaying = new Audio('./audio/' + audioName)
			this.currentAudioPlaying.volume = audioVolume
			this.currentAudioPlaying.play()
		}
	}
}
