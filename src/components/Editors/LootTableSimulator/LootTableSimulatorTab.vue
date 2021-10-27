<template>
	<div @click="tab.parent.setActive(true)">
		<BridgeSheet
			style="height: 65%; margin: 10px; padding: 10px; display: block"
		>
			<h1><v-icon color="success">mdi-sword</v-icon> Output</h1>
			<v-container style="max-height: 85%">
				<v-row>
					<v-col style="max-height: 325px" class="overflow-y-auto">
						<div>
							<span
								v-for="item in tab.result"
								:key="`${item.identifier}-${Math.random()}`"
								@click="
									tab.selectedItemStack === item
										? (tab.selectedItemStack = undefined)
										: (tab.selectedItemStack = item)
								"
							>
								<span class="item-quantity"
									>x{{ item.amount }} </span
								>{{ item.identifier
								}}<span v-if="item.data.value"
									>:{{ item.data.value }}</span
								><br />
							</span>
						</div>
						<span v-if="tab.result.length <= 0">
							{{
								t('preview.lootTableSimulator.emptyLootOutput')
							}}
						</span>
					</v-col>
					<v-divider vertical v-if="tab.selectedItemStack" />
					<v-col v-if="tab.selectedItemStack">
						<div style="position: fixed">
							<span>{{ tab.selectedItemStack.identifier }}</span
							><br />
							<span style="color: var(--v-primary-base)"
								>Quantity:</span
							><span> {{ tab.selectedItemStack.amount }}</span>
							<div
								v-for="data in Object.keys(
									tab.selectedItemStack.data
								)"
								:key="data"
							>
								<!-- Specialised display for books with pagination -->
								<br />
								<span style="color: var(--v-primary-base)">{{
									t(`preview.lootTableSimulator.data.${data}`)
								}}</span
								><span>{{
									tab.selectedItemStack.data[data]
								}}</span>
							</div>
						</div>
					</v-col>
				</v-row>
			</v-container>
		</BridgeSheet>
		<BridgeSheet style="height: 30%; margin: 10px; padding: 10px">
			<h1><v-icon color="warning">mdi-alert</v-icon> Warnings</h1>
			<span
				class="text-truncate"
				v-for="warning in tab.warnings"
				:key="warning"
				style="display: block; max-width: 100%"
				@click="openInformationWindow('Warning', warning)"
				v-ripple
			>
				{{ warning }}
			</span>
		</BridgeSheet>
	</div>
</template>

<script lang="ts">
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export default {
	name: 'LootTableSimulatorTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
	},
	components: {
		BridgeSheet,
	},
	methods: {
		openInformationWindow(title: string, text: string) {
			new InformationWindow({
				name: title,
				description: text,
				isPersistent: false,
			})
		},
	},
}
</script>

<style scoped>
.item-quantity {
	color: var(--v-primary-base);
	position: left;
}
</style>
