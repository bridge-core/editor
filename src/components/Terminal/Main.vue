<template>
	<v-dialog v-if="shouldRender" v-model="isVisible" @input="reset">
		<v-chip-group>
			<v-chip v-for="commandPart in commandParts" :key="commandPart">
				{{ commandPart }}
			</v-chip>
		</v-chip-group>

		<v-autocomplete
			v-model="currentCommandPart"
			:items="autoCompletions"
			@change="pushCommand"
			solo
			autofocus
		/>
	</v-dialog>
</template>

<script>
// import { getAutoCompletions } from './createCommand'
function getAutoCompletions() {
	return []
}
export default {
	name: 'TerminalWindow',
	props: ['currentWindow'],
	mounted() {
		this.reset()
	},
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		pushCommand() {
			this.commandParts.push(this.currentCommandPart)

			this.autoCompletions = getAutoCompletions(this.commandParts)
			if (Array.isArray(this.autoCompletions)) {
				return this.autoCompletions
			} else {
				this.currentWindow.close()
				this.reset()
			}

			this.$nextTick(() => {
				this.currentCommandPart = ''
			})
		},
		reset() {
			this.autoCompletions = getAutoCompletions([])
			this.commandParts = []
			this.currentCommandPart = ''
		},
	},
}
</script>
