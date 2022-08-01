<template>
	<div class="clickable">
		<v-tooltip color="tooltip" right>
			<template v-slot:activator="{ on }">
				<BridgeSheet
					v-on="on"
					dark
					class="d-flex align-center justify-center mb-2"
					:class="{
						'flex-column': miniLayout,
					}"
					:style="{
						overflow: 'hidden',
						height: miniLayout ? undefined : '5rem',
						border: `2px solid ${
							project.isFavorite
								? 'var(--v-primary-base)'
								: 'var(--v-background-base)'
						}`,
					}"
					ref="sheet"
					:isLoading="isLoading"
					@click="onClick"
				>
					<!-- Project icon -->
					<img
						v-if="project.icon"
						:src="project.icon"
						:alt="project.displayName"
						class="rounded-lg"
						:style="{
							margin: miniLayout ? '0.5rem' : '0 0.5rem',
							maxWidth: miniLayout ? '2rem' : '4rem',
							minWidth: availableWidth > 124 ? '4rem' : '2rem',
							'image-rendering': 'pixelated',
						}"
					/>
					<!-- Fallback icon -->
					<div class="d-flex justify-center" v-else>
						<v-icon
							color="primary"
							:style="{ 'font-size': '4rem' }"
							size="xl"
						>
							mdi-alpha-{{
								project.displayName[0].toLowerCase()
							}}-box-outline
						</v-icon>
					</div>

					<!-- Project name -->
					<span
						v-if="
							(miniLayout && availableWidth > 65) ||
							availableWidth > 154
						"
						class="px-2"
						:style="{
							textAlign: 'center',
							width: miniLayout ? '100%' : null,
							overflow: 'hidden',
							'white-space': 'nowrap',
							'text-overflow': 'ellipsis',
						}"
					>
						{{ project.displayName }}
					</span>

					<v-spacer />
					<!-- Project actions -->
					<BridgeSheet
						class="px-1 d-flex align-center justify-center"
						:style="{
							margin: miniLayout ? '0.5rem' : '0 0.5rem 0 0',
							height: '4rem',
							width: miniLayout ? 'calc(100% - 1rem)' : null,
						}"
					>
						<v-icon
							v-if="!project.requiresPermissions"
							color="accent"
						>
							mdi-lock-open-outline
						</v-icon>

						<!-- Pin project button -->
						<v-btn
							icon
							small
							:color="project.isFavorite ? 'primary' : null"
							@click.stop="$emit('pin')"
						>
							<v-icon>
								mdi-pin{{
									project.isFavorite ? '' : '-outline'
								}}
							</v-icon>
						</v-btn>
					</BridgeSheet>
				</BridgeSheet>
			</template>

			<span>
				{{ project.displayName }}
			</span>
		</v-tooltip>
	</div>
</template>

<script>
import { App } from '/@/App'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export default {
	components: {
		BridgeSheet,
	},
	props: {
		project: Object,
		isLoading: Boolean,
	},

	async mounted() {
		const app = await App.getApp()

		// Logic for updating the current available width
		this.disposables.push(
			app.windowResize.on(() => this.calculateAvailableWidth())
		)
		this.calculateAvailableWidth()
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	},

	data: () => ({
		disposables: [],
		availableWidth: 0,
	}),
	computed: {
		miniLayout() {
			return this.availableWidth < 100
		},
	},
	methods: {
		calculateAvailableWidth() {
			if (this.$refs.sheet)
				this.availableWidth =
					this.$refs.sheet.$el.getBoundingClientRect().width
		},
		onClick() {
			this.$emit('click')
		},
	},
}
</script>
