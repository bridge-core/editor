<template>
	<div>
		<v-row dense>
			<v-col
				v-for="(file, i) in window.packCreateFiles"
				:key="`${i}-${file.id}`"
				xs="12"
				sm="6"
				md="4"
				lg="3"
				xl="3"
			>
				<CreateFile
					:file="file"
					v-model="file.isActive"
					style="height: 100%"
					:dark="false"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup>
import CreateFile from './Toggle.vue'

const props = defineProps(['window'])
const state = props.window.state
</script>
