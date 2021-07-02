import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { unzip } from 'fflate'
import { promises as fs } from 'fs'

async function getDocument(text) {
	const dom = new JSDOM(text)

	return dom.window.document
}

const decoder = new TextDecoder('utf-8')

let htmlText = ''

const res = await fetch('https://aka.ms/MinecraftBetaBehaviors')
console.log('Fetched BP')
const data = new Uint8Array(await res.arrayBuffer())

unzip(data, async (err, data) => {
	if (err) throw err

	let entityIds = []
	let blockIds = []
	let itemIds = []

	console.log('Unzipped')
	for (const file in data) {
		if (file === 'documentation/Addons.html') {
			htmlText = decoder.decode(data[file])
		}
	}

	const doc = await getDocument(htmlText)
	const tables = doc.getElementsByTagName('table')

	const version = htmlText.match(/Version: (.*)<\/h1>/gi)
	console.log(version[0].replace('</h1>', ''))

	// Get identifiers
	for (const table of tables) {
		// Get table title
		const type = table.previousElementSibling?.children[0]?.id

		if (type === 'Entities') {
			for (const child of table.children[0].children) {
				if (child.children[0].textContent !== 'Identifier')
					entityIds.push(child.children[0].textContent)
			}
		} else if (type === 'Items') {
			for (const child of table.children[0].children) {
				if (child.children[0].textContent !== 'Name')
					itemIds.push(child.children[0].textContent)
			}
		} else if (type === 'Blocks') {
			for (const child of table.children[0].children) {
				if (child.children[0].textContent !== 'Name')
					blockIds.push(child.children[0].textContent)
			}
		}
	}

	// Add prefixed/unprefixed identifiers

	// Blocks
	let newBlockIds = []
	if (blockIds[0].startsWith('minecraft:')) {
		for (const id of blockIds) {
			newBlockIds.push(id.replace('minecraft:', ''))
		}
	} else {
		for (const id of blockIds) {
			newBlockIds.push('minecraft:' + id)
		}
	}

	// Items
	let newItemIds = []
	if (itemIds[0].startsWith('minecraft:')) {
		for (const id of itemIds) {
			newItemIds.push(id.replace('minecraft:', ''))
		}
	} else {
		for (const id of itemIds) {
			newItemIds.push('minecraft:' + id)
		}
	}

	// Entities
	let newEntityIds = []
	if (entityIds[0].startsWith('minecraft:')) {
		for (const id of entityIds) {
			newEntityIds.push(id.replace('minecraft:', ''))
		}
	} else {
		for (const id of entityIds) {
			newEntityIds.push('minecraft:' + id)
		}
	}

	const buffer = await fs.readFile(
		'data/packages/minecraftBedrock/schema/general/vanilla/identifiers.json'
	)
	const json = JSON.parse(buffer.toString())
	await fs.writeFile(
		'data/packages/minecraftBedrock/schema/general/vanilla/identifiers.json',
		JSON.stringify(
			{
				$schema: 'http://json-schema.org/draft-07/schema',
				definitions: {
					...json.definitions,
					block_identifiers: {
						type: 'string',
						enum: blockIds[0].startsWith('minecraft:')
							? blockIds
							: newBlockIds,
					},
					unprefixed_block_identifiers: {
						type: 'string',
						enum: blockIds[0].startsWith('minecraft:')
							? newBlockIds
							: blockIds,
					},
					item_identifiers: {
						type: 'string',
						enum: itemIds[0].startsWith('minecraft:')
							? itemIds
							: newItemIds,
					},
					unprefixed_item_identifiers: {
						type: 'string',
						enum: itemIds[0].startsWith('minecraft:')
							? newItemIds
							: itemIds,
					},
					entity_identifiers: {
						type: 'string',
						enum: entityIds[0].startsWith('minecraft:')
							? entityIds
							: newEntityIds,
					},
					unprefixed_entity_identifiers: {
						type: 'string',
						enum: entityIds[0].startsWith('minecraft:')
							? newEntityIds
							: entityIds,
					},
				},
			},
			null,
			'\t'
		)
	)
})
