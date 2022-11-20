import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { getEntries } from '/@/utils/directory/getEntries'
import { basename, extname } from '/@/utils/path'

export async function findSuitableFileName(
	name: string,
	directorHandle: AnyDirectoryHandle
) {
	const children = await getEntries(directorHandle)
	const fileExt = extname(name)
	let newName = basename(name, fileExt)

	while (children.find((child) => child.name === newName + fileExt)) {
		if (!newName.includes(' copy')) {
			// 1. Add "copy" to the end of the name
			newName = `${newName} copy`
		} else {
			// 2. Add a number to the end of the name
			// Get the number from the end of the name
			const number = parseInt(newName.match(/copy (\d+)/)?.[1] ?? '1')
			// Remove the last number and add the new one
			newName = newName.replace(/ \d+$/, '') + ` ${number + 1}`
		}
	}

	return newName + fileExt
}
export async function findSuitableFolderName(
	name: string,
	directoryHandle: AnyDirectoryHandle
) {
	const children = await getEntries(directoryHandle)
	let newName = name

	while (children.find((child) => child.name === newName)) {
		if (!newName.includes(' copy')) {
			// 1. Add "copy" to the end of the name
			newName = `${newName} copy`
		} else {
			// 2. Add a number to the end of the name
			const number = parseInt(newName.match(/copy (\d+)/)?.[1] ?? '1')
			newName = newName.replace(/ \d+$/, '') + ` ${number + 1}`
		}
	}

	return newName
}
