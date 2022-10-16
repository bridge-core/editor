<template>
	<div
		class="d-flex align-center justify-center"
		@click="tab.parent.setActive(true)"
	>
		<audio
			ref="audio"
			preload="metadata"
			:src="tab.dataUrl"
			:loop="audioShouldLoop"
		/>

		<BridgeSheet
			v-if="audio"
			class="pa-3 d-flex flex-column"
			style="width: 90%; height: 400px"
		>
			<!-- Extra controls row -->
			<div class="d-flex align-center">
				<BridgeSheet
					dark
					class="pa-4 accent--text"
					style="width: fit-content; height: fit-content"
				>
					{{ extension }}
				</BridgeSheet>

				<v-btn
					icon
					:color="audioShouldLoop ? 'primary' : null"
					@click="audioShouldLoop = !audioShouldLoop"
				>
					<v-icon>mdi-all-inclusive</v-icon>
				</v-btn>
				<v-spacer />

				<!-- Volume slider -->
				<v-slider
					height="50%"
					v-model.lazy="audio.volume"
					:prepend-icon="
						audio.volume === 0
							? 'mdi-volume-off'
							: 'mdi-volume-high'
					"
					:min="0"
					:max="1"
					:step="0.01"
					hide-details
				/>
			</div>

			<div class="flex-grow-1 d-flex align-center justify-center">
				<v-btn
					x-large
					icon
					outlined
					@click="isPlaying ? audio.pause() : audio.play()"
				>
					<v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
				</v-btn>
			</div>

			<!-- Track progress -->
			<div class="d-flex align-center">
				<span v-if="loadedAudioMetadata" class="text--secondary">
					{{ roundedCurrentTime }} / {{ roundedTotalTime }}
				</span>

				<v-slider
					:value="currentTime"
					@input="setCurrentTime"
					:min="0"
					:max="audio.duration"
					step="0.01"
					hide-details
				/>
			</div>
		</BridgeSheet>
	</div>
</template>

<script>
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export default {
	name: 'SoundTab',
	components: {
		BridgeSheet,
	},
	props: {
		tab: Object,
	},
	mounted() {
		this.audio = this.$refs.audio
		this.intervalId = setInterval(this.updateCurrentTime, 100)

		this.audio.addEventListener('play', this.onPlay)
		this.audio.addEventListener('pause', this.onPause)
		this.audio.addEventListener('loadedmetadata', this.onLoadedMetadata)
	},
	destroyed() {
		clearInterval(this.intervalId)
		this.intervalId = null

		this.audio.removeEventListener('play', this.onPlay)
		this.audio.removeEventListener('pause', this.onPause)
		this.audio.removeEventListener('loadedmetadata', this.onLoadedMetadata)
	},
	data: () => ({
		audio: null,
		intervalId: null,
		currentTime: 0,
		timeTriggeredManually: false,
		isPlaying: false,
		loadedAudioMetadata: false,
		audioShouldLoop: false,
	}),
	computed: {
		extension() {
			return this.tab.name.split('.').pop().toUpperCase()
		},
		roundedCurrentTime() {
			return (Math.round(this.currentTime * 100) / 100).toFixed(2)
		},
		roundedTotalTime() {
			return (Math.round(this.audio.duration * 100) / 100).toFixed(2)
		},
	},
	methods: {
		updateCurrentTime() {
			this.timeTriggeredManually = false
			this.currentTime = this.audio.currentTime
		},
		setCurrentTime(time) {
			if (!this.timeTriggeredManually) {
				this.timeTriggeredManually = true
				return
			}
			if (Number.isNaN(time)) return

			this.audio.currentTime = Math.round(time * 100) / 100
		},
		onPlay() {
			this.isPlaying = true
		},
		onPause() {
			this.isPlaying = false
		},
		onLoadedMetadata() {
			this.loadedAudioMetadata = true
		},
	},
}
</script>
