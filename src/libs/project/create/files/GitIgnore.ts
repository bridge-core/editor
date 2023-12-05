import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'

export async function createGitIgnore(
	fileSystem: BaseFileSystem,
	path: string
) {
	await fileSystem.writeFile(
		path,
		`Desktop.ini    
.DS_Store 
!.bridge/
.bridge/*
!.bridge/compiler/
!.bridge/extensions
builds
`
	)
}
