<template>
	<div
		:class="`d-flex flex-column justify-center align-center ${containerPadding}`"
		:style="`position: relative; height: 80vh;`"
	>
		<WelcomeAlert />

		<div
			class="d-flex flex-column justify-center align-center"
			style="width: 50vw; max-width: 500px"
		>
			<Logo
				style="height: 160px; width: 160px"
				class="mt-4 mb-8"
				alt="Logo of bridge. v2"
			/>

			<CommandBar />
		</div>

		<div v-if="user">
			<v-avatar size="32">
				<img :src="user.avatarUrl" :alt="user.login" />
			</v-avatar>
			<span>{{ user.login }}</span>
		</div>
	</div>
</template>

<script>
import Logo from '../UIElements/Logo.vue'
import WelcomeAlert from '../WelcomeAlert/Alert.vue'
import CommandBar from '../CommandBar/CommandBar.vue'
import { getFromGithub } from '../SourceControl/Backend/Get'

export default {
	name: 'welcome-screen',
	components: {
		Logo,
		WelcomeAlert,
		CommandBar,
	},
	props: {
		containerPadding: String,
	},
	data: () => ({
		user: null,
	}),
	async created() {
		const user = await getFromGithub('user')

		this.user = {
			login: user.login,
			avatarUrl: user.avatar_url,
		}
	},
}
</script>

<style scoped>
ul {
	padding-left: 0;
}
div,
li {
	list-style-type: none;
}
span {
	margin-left: 4px;
}
p {
	margin-bottom: 0;
}
.clickable {
	cursor: pointer;
}
.pack-icon {
	height: 24px;
	image-rendering: pixelated;
}
.disabled {
	opacity: 0.2;
}
</style>
