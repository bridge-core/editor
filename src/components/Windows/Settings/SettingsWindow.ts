import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'

export const selectedCategory: Ref<string | null> = ref(null)

export function openSettings(categoryId?: string) {
	Windows.open('settings')

	if (!categoryId) return

	selectedCategory.value = categoryId
}
