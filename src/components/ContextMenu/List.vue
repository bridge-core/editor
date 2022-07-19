<template>
	<v-list color="menu" dense>
		<template v-for="(action, id) in renderActions">
			<!-- Divider -->
			<v-divider v-if="action.type === 'divider'" :key="id" />

			<!-- Nested menu -->
			<v-menu
				v-else-if="action.type === 'submenu'"
				open-on-hover
				:key="id"
				offset-x
				nudge-right="8px"
				rounded="lg"
				close-delay="200"
				transition="context-menu-transition"
				close-on-click
			>
				<template v-slot:activator="{ on, attrs }">
					<v-list-item
						v-if="Object.keys(action.submenu.state).length > 0"
						v-on="on"
						v-bind="attrs"
						:disabled="action.isDisabled"
					>
						<v-list-item-icon
							:style="{
								opacity: action.isDisabled ? '38%' : null,
							}"
							class="mr-2"
						>
							<v-icon :color="action.color || 'accent'">
								{{ action.icon }}
							</v-icon>
						</v-list-item-icon>
						<v-list-item-action
							:style="{ alignItems: 'flex-start' }"
							class="ma-0"
						>
							<v-list-item-title
								:style="{ alignSelf: 'flex-start' }"
								v-text="t(action.name)"
							/>
							<v-list-item-subtitle
								v-if="action.description"
								v-text="t(action.description)"
							/>
						</v-list-item-action>
						<v-spacer />
						<v-icon color="accent">mdi-chevron-right</v-icon>
					</v-list-item>
				</template>

				<ContextMenuList
					@click="$emit('click')"
					:actions="action.submenu.state"
				/>
			</v-menu>

			<v-list-item v-else-if="action.type === 'header'" :key="id">
				<v-list-item-icon
					:style="{ opacity: action.isDisabled ? '38%' : null }"
					class="mr-2"
				>
					<v-icon :color="action.color || 'accent'">
						{{ action.icon }}
					</v-icon>
				</v-list-item-icon>
				<v-list-item-title v-text="t(action.name)" />
			</v-list-item>

			<!-- Normal menu item -->
			<v-list-item
				v-else
				:key="id"
				:disabled="action.isDisabled"
				:class="{
					'pl-6': action.addPadding,
				}"
				@click="onClick(action)"
			>
				<v-list-item-icon
					:style="{ opacity: action.isDisabled ? '38%' : null }"
					class="mr-2"
				>
					<v-icon :color="action.color || 'accent'">
						{{ action.icon }}
					</v-icon>
				</v-list-item-icon>
				<v-list-item-action
					:style="{ alignItems: 'flex-start' }"
					class="ma-0"
				>
					<v-list-item-title
						:style="{ alignSelf: 'flex-start' }"
						v-text="t(action.name)"
					/>
					<v-list-item-subtitle
						v-if="action.description"
						v-text="t(action.description)"
					/>
				</v-list-item-action>
			</v-list-item>
		</template>
	</v-list>
</template>

<script>
import { TranslationMixin } from '../Mixins/TranslationMixin'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	name: 'ContextMenuList',
	mixins: [TranslationMixin],
	props: {
		actions: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			pointerDevice,
		}
	},
	computed: {
		renderActions() {
			const entries = []

			for (const [key, action] of Object.entries(this.actions)) {
				if (
					action.type !== 'submenu' ||
					this.pointerDevice !== 'touch'
				) {
					entries.push([key, action])
					continue
				}

				entries.push([
					key,
					{ type: 'header', icon: action.icon, name: action.name },
				])
				entries.push(
					...Object.entries(
						action.submenu.state
					).map(([key, action]) => [
						key,
						action.type === 'action'
							? action.withPadding()
							: action,
					])
				)
			}

			return Object.fromEntries(entries)
		},
	},
	methods: {
		onClick(action) {
			this.$emit('click')
			action.trigger()
		},
	},
}
</script>
