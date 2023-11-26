import { Component, markRaw } from 'vue'
import { Tab } from '/@/components/Editor/TabSystem/Tab'
import TextTabComponent from '/@/components/Editor/Tabs/Text/TextTab.vue'

export class TextTab extends Tab {
	public component: Component | null = markRaw(TextTabComponent)
}
