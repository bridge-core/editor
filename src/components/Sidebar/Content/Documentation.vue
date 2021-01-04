<template>
	<div>
		<h2 class="text-md-body-1 ml-3">Minecraft</h2>

		<template v-for="([name, link], i) in docList">
			<v-btn
				:key="`mc.btn.${i}`"
				@click.stop="openLink(link)"
				class="font-weight-light btn-hover"
				block
				text
			>
				<span>{{ t(name) }}</span>
				<v-spacer />
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>

			<v-divider v-if="i + 1 < docList.length" :key="`mc.divider.${i}`" />
		</template>

		<h2 class="text-md-body-1 mt-6 ml-3">bridge.</h2>
		<template v-for="([name, link], i) in bridgeDocs">
			<v-btn
				:key="`bridge.btn.${i}`"
				@click.stop="openLink(link)"
				class="font-weight-light btn-hover"
				block
				text
			>
				<span>{{ t(name) }}</span>
				<v-spacer />
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>

			<v-divider
				v-if="i + 1 < bridgeDocs.length"
				:key="`bridge.divider.${i}`"
			/>
		</template>
	</div>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
// import {
// 	DOC_LIST,
// 	DOC_URL,
// 	CURRENT,
// 	DOC_URL_BETA,
// 	MC_BETA_VERSION,
// } from '../../../constants'

export default {
	name: 'content-documentation',
	mixins: [TranslationMixin],
	data() {
		return {
			docList: [
				[
					'sidebar.documentation.addons',
					'https://bedrock.dev/r/Addons/'
				],
				[
					'sidebar.documentation.animations',
					'https://bedrock.dev/r/Animations/'
				],
				[
					'sidebar.documentation.biomes',
					'https://bedrock.dev/r/Biomes/'
				],
				[
					'sidebar.documentation.blocks',
					'https://bedrock.dev/r/Blocks/'
				],
				[
					'sidebar.documentation.entities',
					'https://bedrock.dev/r/Entities/'
				],
				[
					'sidebar.documentation.entityEvents',
					'https://bedrock.dev/r/Entity Events/'
				],
				[
					'sidebar.documentation.features',
					'https://bedrock.dev/r/Features'
				],
				[
					'sidebar.documentation.item',
					'https://bedrock.dev/r/Item'
				],
				[
					'sidebar.documentation.molang',
					'https://bedrock.dev/r/Molang/'
				],
				[
					'sidebar.documentation.particles',
					'https://bedrock.dev/r/Particles/'
				],
				[
					'sidebar.documentation.recipes',
					'https://bedrock.dev/r/Recipes/'
				],
				[
					'sidebar.documentation.scripting',
					'https://bedrock.dev/r/Scripting/'
				],
				[
					'sidebar.documentation.ui',
					'https://bedrock.dev/r/UI/'
				]
			],
			bridgeDocs: [
				[
					'sidebar.documentation.commands',
					'https://bridge-core.github.io/plugin-docs/custom-commands/',
				],
				[
					'sidebar.documentation.components',
					'https://bridge-core.github.io/plugin-docs/custom-components/',
				],
			],
		}
	},
	computed: {
		// docURL() {
		// 	if (CURRENT.PROJECT_TARGET_VERSION == MC_BETA_VERSION) {
		// 		return DOC_URL_BETA
		// 	} else {
		// 		return DOC_URL
		// 	}
		// },
	},
	methods: {
		openLink(l) {
			window.open(l, '_blank')
			// shell.openExternal(l)
		},
	},
}
</script>

<style scoped>
.v-btn {
	margin: 0;
}
.first {
	padding-left: 0.1em;
}
.btn-hover:hover {
	border-left: 3px solid var(--v-primary-base);
}
</style>
