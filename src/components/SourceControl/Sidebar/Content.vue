<template>
	<div v-if="!isLoggedIn" class="pa-2">
		<GitHubLogin block />

		<p class="mt-2">
			{{ t('sourceControl.loginRequired') }}
		</p>
	</div>

	<div v-else class="pa-1 pt-0">
		<v-row
			class="align-center"
			no-gutters
			style="
				width: 100%;
				position: sticky;
				z-index: 1;
				top: 56px;
				background: var(--v-expandedSidebar-base);
			"
		>
			<v-col :cols="10" :lg="10" :md="10" :sm="12" class="px-1 py-1">
				<v-textarea
					color="primary"
					:label="t('sourceControl.commitMessage')"
					rows="1"
					auto-grow
					dense
					outlined
					hide-details
				/>
			</v-col>
			<v-col :cols="2" :lg="2" :md="2" :sm="12" class="px-1 py-1">
				<v-btn
					small
					width="100%"
					min-width="unset"
					height="38px"
					color="primary"
				>
					<v-icon :small="$vuetify.breakpoint.mdOnly">
						mdi-check
					</v-icon>
				</v-btn>
			</v-col>
		</v-row>

		<div class="pa-1" style="width: 100%; overflow-x: hidden">
			<File
				v-for="({ filePath, status }, i) in files"
				:key="filePath + i"
				:filePath="filePath"
			>
				<template #append>
					<span
						:style="{
							color: `var(--v-${modifiedStatusToColor(
								status
							)}-base)`,
						}"
					>
						{{ status[0].toUpperCase() }}
					</span>
				</template>
			</File>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import File from '/@/components/FileSystem/UI/File.vue'
import { OauthToken } from '../OAuth/Token'
import GitHubLogin from '/@/components/UIElements/Button/GitHubLogin.vue'

export default {
	mixins: [TranslationMixin],
	components: { File, GitHubLogin },
	mounted() {
		OauthToken.setup.once(() => {
			this.isLoggedIn = true
		})
	},
	data: () => ({
		isLoggedIn: false,
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
