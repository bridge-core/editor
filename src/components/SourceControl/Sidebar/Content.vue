<template>
	<v-container>
		<div class="d-flex align-center mb-3">
			<v-textarea
				class="mr-2"
				color="primary"
				:label="t('sourceControl.commitMessage')"
				rows="1"
				auto-grow
				dense
				outlined
				hide-details
			/>
			<v-btn small height="38px" color="primary">
				<v-icon>mdi-check</v-icon>
			</v-btn>
		</div>

		<File
			v-for="{ filePath, status } in files"
			:key="filePath"
			:filePath="filePath"
		>
			<template #append>
				<span
					:style="{
						color: `var(--v-${modifiedStatusToColor(status)}-base)`,
					}"
				>
					{{ status[0].toUpperCase() }}
				</span>
			</template>
		</File>
	</v-container>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import File from '/@/components/FileSystem/UI/File.vue'

export default {
	mixins: [TranslationMixin],
	components: { File },
	data: () => ({
		files: [
			{
				filePath: 'projects/BridgeTests/BP/entities/blaze.json',
				status: 'modified',
			},
			{
				filePath: 'projects/BridgeTests/BP/entities/player.json',
				status: 'modified',
			},
			{
				filePath: 'projects/BridgeTests/RP/entity/blaze.json',
				status: 'modified',
			},
			{
				filePath: 'projects/BridgeTests/BP/items/eternalFire.json',
				status: 'added',
			},
			{
				filePath: 'projects/BridgeTests/BP/loot_tables/empty.json',
				status: 'deleted',
			},
		],
	}),
	methods: {
		modifiedStatusToColor(status) {
			switch (status) {
				case 'modified':
					return 'warning'
				case 'added':
					return 'success'
				case 'deleted':
					return 'error'
			}
		},
	},
}
</script>
