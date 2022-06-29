<template>
	<v-menu
		v-model="item.isVisible"
		min-width="260px"
		offset-y
		z-index="11"
		:nudge-top="-8"
		rounded="lg"
	>
		<template v-slot:activator="{ on }">
			<MenuButton
				v-on="on"
				:disabled="disabled || item.isDisabled"
				:displayIcon="item.icon"
				:displayName="item.name"
			/>
		</template>

		<MenuList v-if="item.isVisible" :elements="item.state" />
	</v-menu>
</template>

<script>
import MenuList from './MenuList.vue'
import MenuButton from './Button.vue'

export default {
	name: 'MenuActivator',
	components: {
		MenuList,
		MenuButton,
	},
	props: {
		item: Object,
		disabled: Boolean,
	},
}
</script>
