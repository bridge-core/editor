module.exports = () => {
    const compare = require('compare-versions')
    const uuid = require('uuid')

    function deepMerge(obj1, obj2) {
        let outArray = undefined
        if (Array.isArray(obj1) && Array.isArray(obj2)) outArray = obj1.concat(obj2)
        else if (Array.isArray(obj1)) outArray = obj1.concat([obj2])
        else if (Array.isArray(obj2)) outArray = obj2.concat([obj1])
        else if (typeof obj2 !== 'object') return obj2

        // Remove duplicates
        if (outArray) return [...new Set([...outArray])]

        let res = {}

        for (const key in obj1) {
            if (obj2[key] === undefined) res[key] = obj1[key]
            else res[key] = deepMerge(obj1[key], obj2[key])
        }

        for (const key in obj2) {
            if (obj1[key] === undefined) res[key] = obj2[key]
        }

        return res
    }

    function use(obj, path) {
        if (typeof path == 'string') path = path.split('/')
        const key = path.shift()

        if (path.length === 0) {
            let o = obj[key]
            if (obj[key] !== undefined) delete obj[key]
            return o
        }
        return use(obj[key], path)
    }
    function set(obj, path, data) {
        if (typeof path == 'string') {
            const keys = path.split('/')
            set(obj, keys, data)
        } else {
            let key = path.shift()

            if (path.length === 0) {
                if (obj[key] === undefined) obj[key] = data
                else if (Array.isArray(obj[key]) && !Array.isArray(data))
                    if (!obj[key].includes(data)) obj[key].push(data)
                else if (Array.isArray(obj[key]) && Array.isArray(data))
                    obj[key].push(...data)
                return obj
            } else if (obj[key] === undefined) {
                obj[key] = {}
            }

            return set(obj[key], path, data)
        }
    }

    function processEvent(event, formatVersion) {
        let entity = {
            events: event
        }
        const eventName = Object.keys(event).toString()

        if (event) {
            // Spell effects
            const effectId = uuid.v4()
            let addEffects = undefined
            let removeEffects = undefined

            if (event[eventName]?.add?.spell_effects) addEffects = use(entity.events[eventName], 'add/spell_effects')
            if (event[eventName]?.remove?.spell_effects) removeEffects = use(entity.events[eventName], 'remove/spell_effects')

            if (addEffects) {
                set(entity, `events/${eventName}/add/component_groups`, [effectId])
                set(entity, `component_groups/${effectId}/minecraft:spell_effects/add_effects`, addEffects)
            }
            if (removeEffects) {
                set(entity, `events/${eventName}/add/component_groups`, [effectId])
                set(entity, `component_groups/${effectId}/minecraft:spell_effects/remove_effects`, removeEffects)
            }

            // Group
            if (event[eventName]?.add?.group) {
                const group = use(entity.events[eventName], 'add/group')
                const groupName = (typeof group.name !== 'object' ? group.name : uuid.v4()) || uuid.v4()
                const components = group.components ?? {}

                set(entity, `events/${eventName}/add/component_groups`, [groupName])
                set(entity, `component_groups/${groupName}`, components)
            }

            // Execute commands
            if (event[eventName]?.execute?.commands) {
                let { commands } = use(entity.events[eventName], 'execute') ?? []
                if (typeof commands == 'string') commands = [commands]
                if (compare(formatVersion, '1.16.100', '<') < 0) {
                    // < 1.16.100
                    commandIdCounter++

                    const acShortName = `bridge_execute_command_${uuid.v4()}`
                    let executeCommandsGroup = `execute_command_id_${commandIdCounter}`

                    set(entity, `description/animations/${acShortName}`, acId)
                    set(entity, 'description/scripts/animate', [acShortName])

                    set(entity, `component_groups/bridge:${executeCommandsGroup}`, {
                        'minecraft:skin_id': {
                            value: commandIdCounter,
                        },
                    })
                    set(entity, 'component_groups/bridge:execute_no_command', {
                        'minecraft:skin_id': {
                            value: 0,
                        },
                    })

                    set(entity, `events/${eventName}/add/component_groups`, [`bridge:${executeCommandsGroup}`])
                    set(entity, `events/bridge:remove_command_id_${commandIdCounter}`, {
                        add: {
                            component_groups: ['bridge:execute_no_command'],
                        },
                        remove: {
                            component_groups: [`bridge:${executeCommandsGroup}`],
                        },
                    })

                    // For some reason set() isn't working here so using deepMerge() instead
                    
                    animationController = deepMerge(animationController, {
                        animation_controllers: {
                            [acId]: {
                                states: {
                                    default: {
                                        transitions: [
                                            {
                                                [executeCommandsGroup]: `query.skin_id == ${commandIdCounter}`,
                                            },
                                        ],
                                    },
                                    [executeCommandsGroup]: {
                                        transitions: [
                                            { default: `query.skin_id != ${commandIdCounter}` },
                                        ],
                                        on_entry: [
                                            ...commands,
                                            `@s bridge:remove_command_id_${commandIdCounter}`
                                        ]
                                    },
                                }
                            }
                        }
                    })
                } else {
                    // >= 1.16.100
                    set(entity, `events/${eventName}/run_command/command`, commands)
                }
            }
        }

        return { 'minecraft:entity': entity }
    }

    const acPath = 'BP/animation_controllers/bridge/execute_commands.json'
    let animationController = {
        format_version: '1.10.0',
        animation_controllers: {}
    }
    let commandIdCounter = 0
    let acId = `controller.animation.bridge.${uuid.v4()}_execute_commands`

    return {
        include() {
            return [acPath]
        },

        require(filePath) {
            if (filePath == acPath) return ['BP/entities/**/*.json', 'BP/entities/*.json']
        },

        read(filePath) {
            if (filePath === acPath) return {}
        },

        transform(filePath, fileContent) {
            if (filePath.startsWith('BP/entities')) {
                const events = fileContent['minecraft:entity']?.events
                const formatVersion = fileContent?.format_version ?? '1.17.0'
    
                // Iterate each event and process it
                for (const event in events) {
                    const processedEvent = processEvent({
                        [event]: events[event]
                    }, formatVersion)
    
                    // Merge transformed entity with original
                    fileContent = deepMerge(fileContent, processedEvent)
    
                    // Change old event to new event so custom syntax is removed
                    fileContent['minecraft:entity'].events[event] = processedEvent['minecraft:entity'].events[event]
                }

                commandIdCounter = 0
                acId = `controller.animation.bridge.${uuid.v4()}_execute_commands`
                
                return fileContent
            }
        },
        finalizeBuild(filePath, fileContent) {
            if (filePath === acPath) return JSON.stringify(deepMerge(fileContent, animationController), null, '\t')
        }
    }
}