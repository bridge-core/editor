import { Tab } from '@/components/TabSystem/Tab'
import { Component, ref } from 'vue'
import FindAndReplaceTabComponent from './FindAndReplaceTab.vue'

export class FindAndReplaceTab extends Tab {
	public name = ref('Find and Replace')

	public component: Component | null = FindAndReplaceTabComponent
}
