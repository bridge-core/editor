import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'

export async function createDenoConfig(
	fileSystem: BaseFileSystem,
	path: string
) {
	await fileSystem.writeFileJson(
		path,
		{
			tasks: {
				install_dash:
					'deno install -A --reload -f -n dash_compiler https://raw.githubusercontent.com/bridge-core/deno-dash-compiler/main/mod.ts',
				watch: 'dash_compiler build --mode development && dash_compiler watch',
				build: 'dash_compiler build',
			},
		},
		true
	)
}
