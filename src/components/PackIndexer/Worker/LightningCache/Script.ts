import { run } from '/@/components/Extensions/Scripts/run'

export function runScript(script: string) {
	const module: any = { exports: undefined }

	run({ script, env: { module } })

	return module.exports
}
