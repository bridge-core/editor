<!-- Experimental Gameplay Toggles -->
<template>
	<v-row dense>
		<v-col
			v-for="experiment in window.experimentalToggles"
			:key="experiment.id"
			xs="12"
			sm="6"
			md="4"
			lg="3"
			xl="2"
		>
			<ExperimentalGameplay
				:experiment="experiment"
				v-model="
					state.createOptions.experimentalGameplay[experiment.id]
				"
				style="height: 100%"
				:dark="false"
			/>
		</v-col>
	</v-row>
</template>

<script lang="ts" setup>
import ExperimentalGameplay from './ExperimentalGameplay.vue'

const props = defineProps(['window'])
const state = props.window.state
</script>
