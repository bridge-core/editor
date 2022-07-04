<template>
	<v-list color="menu" dense>
		<template v-for="(action, id) in actions">
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
			>
				<template v-slot:activator="{ on, attrs }">
					<v-list-item
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
							<v-icon color="accent">
								{{ action.icon }}
							</v-icon>
						</v-list-item-icon>
						<v-list-item-action class="ma-0">
							{{ t(action.name) }}
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

			<!-- Normal menu item -->
			<v-list-item
				v-else
				:key="id"
				:disabled="action.isDisabled"
				@click="onClick(action)"
			>
				<v-list-item-icon
					:style="{ opacity: action.isDisabled ? '38%' : null }"
					class="mr-2"
				>
					<v-icon color="primary">{{ action.icon }}</v-icon>
				</v-list-item-icon>
				<v-list-item-action class="ma-0">
					{{ t(action.name) }}
				</v-list-item-action>
			</v-list-item>
		</template>
	</v-list>
</template>

<script>
import { TranslationMixin } from '../Mixins/TranslationMixin'

export default {
	name: 'ContextMenuList',
	mixins: [TranslationMixin],
	props: {
		actions: {
			type: Object,
			required: true,
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
