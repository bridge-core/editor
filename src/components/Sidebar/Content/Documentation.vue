<template>
	<div>
		<h2 class="text-md-body-1 ml-3">Minecraft</h2>

		<template v-for="(doc, i) in docList">
			<v-btn
				:key="`mc.btn.${i}`"
				@click.stop="openDoc(doc)"
				class="font-weight-light btn-hover"
				block
				text
			>
				<span>{{ doc }}</span>
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
				<span>{{ name }}</span>
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
// import {
// 	DOC_LIST,
// 	DOC_URL,
// 	CURRENT,
// 	DOC_URL_BETA,
// 	MC_BETA_VERSION,
// } from '../../../constants'

export default {
	name: 'content-documentation',
	data() {
		return {
			docList: [
				'Entities',
				'Features',
				'Item',
				'Blocks',
				'Biomes',
				'Addons',
				'MoLang',
				'UI',
				'Scripting',
				'Particles',
				'Animations',
				'Entity Events',
				'Recipes',
			].sort(),
			bridgeDocs: [
				[
					'Commands',
					'https://bridge-core.github.io/plugin-docs/custom-commands/',
				],
				[
					'Components',
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
		openDoc(doc) {
			window.open(`${this.docURL}${encodeURI(doc)}`, '_blank')
			// shell.openExternal(`${this.docURL}${encodeURI(doc)}`)
		},
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
