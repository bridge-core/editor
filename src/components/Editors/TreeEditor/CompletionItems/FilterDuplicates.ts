import { ICompletionItem } from '/@/components/JSONSchema/Schema/Schema'

function getItemId(item: ICompletionItem) {
	return `t-${item.type}:v-${item.value}`
}

export function filterDuplicates(items: ICompletionItem[]): ICompletionItem[] {
	const seen = new Set()
	return items.filter((item) => {
		const id = getItemId(item)

		const result = !seen.has(id)
		seen.add(id)

		return result
	})
}
