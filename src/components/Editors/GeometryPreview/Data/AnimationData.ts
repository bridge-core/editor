import json5 from 'json5'
import { PreviewFileWatcher } from './PreviewFileWatcher'
import { RenderDataContainer } from './RenderContainer'

export class AnimationData extends PreviewFileWatcher {
	protected animationJson: any

	constructor(
		protected parent: RenderDataContainer,
		animationFilePath: string,
		protected includedAnimationIdentifiers?: string[]
	) {
		super(parent.app, animationFilePath)
	}

	async onChange(file: File, isInitial = false) {
		try {
			this.animationJson = json5.parse(await file.text())
			if (!isInitial) this.parent.onChange()
		} catch {
			// If parsing JSON fails, do nothing
		}
	}

	get includedAnimations(): [string, any][] {
		if (this.includedAnimationIdentifiers === undefined)
			return Object.entries<any>(this.animationJson['animations'])

		return Object.entries<any>(this.animationJson['animations']).filter(
			([_, { description }]) =>
				!this.includedAnimationIdentifiers!.includes(
					description.identifier
				)
		)
	}

	get identifiers(): string[] {
		return this.includedAnimations.map(([id]) => id)
	}
}
