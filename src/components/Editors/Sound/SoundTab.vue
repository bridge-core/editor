<template>
	<div
		class="d-flex align-center justify-center"
		@click="tab.parent.setActive(true)"
	>
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
					:color="tab.audioShouldLoop ? 'primary' : null"
					@click="tab.toggleAudioLoop()"
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
					@click="tab.isPlaying ? audio.pause() : audio.play()"
				>
					<v-icon>
						{{ tab.isPlaying ? 'mdi-pause' : 'mdi-play' }}
					</v-icon>
				</v-btn>
			</div>

			<!-- Track progress -->
			<div class="d-flex align-center">
				<span v-if="tab.loadedAudioMetadata" class="text--secondary">
					{{ roundedCurrentTime }} / {{ roundedTotalTime }}
				</span>

				<v-slider
					:value="tab.currentTime"
					@input="(n) => tab.setCurrentTime(n)"
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

	computed: {
		audio() {
			return this.tab.audio
		},
		extension() {
			return this.tab.name.split('.').pop().toUpperCase()
		},
		roundedCurrentTime() {
			return (Math.round(this.tab.currentTime * 100) / 100).toFixed(2)
		},
		roundedTotalTime() {
			return (Math.round(this.audio.duration * 100) / 100).toFixed(2)
		},
	},
}
</script>
