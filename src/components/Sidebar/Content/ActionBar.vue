<template>
	<v-row cols="5" no-gutters>
		<v-col v-for="i in 5" :key="i">
			<Action
				:color="i === 5 ? undefined : 'error'"
				:icon="i === 5 ? 'mdi-dots-vertical' : 'mdi-minecraft'"
			/>
		</v-col>
	</v-row>
</template>

<script>
import Action from './Action.vue'

export default {
	components: {
		Action,
	},
}
</script>

<style></style>
