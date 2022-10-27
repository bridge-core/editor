<template>
	<div
		ref="welcomeScreen"
		:class="`d-flex flex-column justify-center align-center ${containerPadding}`"
		:style="`position: relative; height: 80vh;`"
	>
		<WelcomeAlert />

		<div
			class="mb-3 d-flex flex-column justify-center align-center"
			style="width: 50vw; max-width: 500px"
		>
			<Logo
				style="height: 160px; width: 160px"
				class="mt-4 mb-8"
				alt="Logo of bridge. v2"
			/>

			<CommandBar />
		</div>
	</div>
</template>

<script>
import Logo from '../UIElements/Logo.vue'
import WelcomeAlert from '../WelcomeAlert/Alert.vue'
import CommandBar from '../CommandBar/CommandBar.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { startScreenContainer } from '/@/components/Blockbench/PluginCompat/StartScreen/addSection'

export default {
	name: 'welcome-screen',
	components: {
		Logo,
		WelcomeAlert,
		CommandBar,
		BridgeSheet,
	},
	props: {
		containerPadding: String,
	},
	mounted() {
		this.$refs.welcomeScreen.appendChild(startScreenContainer)
	},
}
</script>
