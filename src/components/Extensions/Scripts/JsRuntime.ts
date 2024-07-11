import { Runtime } from '@bridge-editor/js-runtime'
import { App } from '/@/App'
import { dirname } from '/@/utils/path'

export class JsRuntime extends Runtime {
	async readFile(filePath: string) {
		const app = await App.getApp()

		// Convince TypeScript that this is a real "File" and not a "VirtualFile"
		// Because our VirtualFile implements all File methods the JS runtime needs
		const file = <File>await app.fileSystem.readFile(filePath)

		return file
	}

	run(filePath: string, env: any = {}, fileContent?: string) {
		return super.run(
			filePath,
			Object.assign(env, {
				require: (x: string) => this.require(x, dirname(filePath), env),
			}),
			fileContent
		)
	}
}
