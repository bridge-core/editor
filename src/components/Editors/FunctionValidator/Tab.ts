import { FileTab } from '/@/components/TabSystem/FileTab'
import FunctionValidatorTabComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'
import { TabSystem } from '../../TabSystem/TabSystem'
import Error from './Error.vue'
import Warning from './Warning.vue'
import Vue from 'vue'
import { FunctionValidator } from '/@/components/Languages/Mcfunction/Validation/Validator'
import { App } from '/@/App'
import { translate } from '../../Locales/Manager'

export class FunctionValidatorTab extends Tab {
	protected fileTab: FileTab | undefined
	protected currentLine = 0
	protected content: string = ''

	protected stopped = false

	protected app: App | undefined

	constructor(protected parent: TabSystem, protected tab: FileTab) {
		super(parent)
		this.fileTab = tab
	}

	get name(): string {
		return translate('functionValidator.tabName')
	}

	isFor(fileHandle: FileSystemFileHandle): Promise<boolean> {
		return Promise.resolve(false)
	}

	component = FunctionValidatorTabComponent

	get icon() {
		return 'mdi-cog-box'
	}

	get iconColor() {
		return 'primary'
	}

	save() {}

	//Load function content
	protected async LoadFileContent() {
		if (this.fileTab) {
			let file = await this.fileTab.getFile()
			this.content = await file?.text()
		}
	}

	protected translateError(errorName: string) {
		return translate('functionValidator.errors.' + errorName)
	}

	protected translateWarning(errorName: string) {
		return translate('functionValidator.warnings.' + errorName)
	}

	protected async UpdateLoadedState() {
		let dataLoadingElement = document.getElementById('data-loading')
		let loadedDataElement = document.getElementById('loaded-content')

		if (this.app!.languageManager.mcfunction.validator.blockStateData) {
			if (dataLoadingElement) {
				dataLoadingElement.classList.add('hidden')
			}

			if (loadedDataElement) {
				loadedDataElement.classList.remove('hidden')
			}

			await this.LoadCurrentLine()
		} else {
			setTimeout(() => {
				this.UpdateLoadedState()
			}, 500)
		}
	}

	//Displays data
	protected async LoadCurrentLine<Boolean>() {
		let lines = this.content.split('\n')

		if (this.currentLine < lines.length) {
			let fullCommand = lines[this.currentLine].substring(
				0,
				lines[this.currentLine].length - 1
			)

			if (
				lines[this.currentLine].substring(
					lines[this.currentLine].length - 1
				) != '\r'
			) {
				fullCommand = lines[this.currentLine].substring(
					0,
					lines[this.currentLine].length
				)
			}

			let command = fullCommand.split(' ')[0]

			let lineCounterElement = document.getElementById('line-counter')

			if (lineCounterElement) {
				lineCounterElement.textContent =
					'Line: ' + (this.currentLine + 1).toString()
			}

			let fullCommmandDisplayElement = document.getElementById(
				'full-command-display'
			)

			if (fullCommmandDisplayElement) {
				fullCommmandDisplayElement.innerHTML =
					'Full Command: ' + lines[this.currentLine]
			}

			let alertsElement = document.getElementById('alerts')
			let docsElement = document.getElementById('docs')

			if (alertsElement && docsElement) {
				let alertCount = alertsElement.children.length

				for (let i = 0; i < alertCount; i++) {
					alertsElement.children[0].remove()
				}

				if (
					lines[this.currentLine] == '\r' ||
					lines[this.currentLine].length == 0
				) {
					docsElement.textContent = 'No documentation.'
				} else {
					let data =
						await this.app!.languageManager.mcfunction.validator.ValidateCommand(
							fullCommand
						)

					let currentErrorLines = []

					for (let i = 0; i < data[0].length; i++) {
						const start = data[0][i].start
						const end = data[0][i].end

						currentErrorLines.push([start, end])

						let translated = ''

						if (typeof data[0][i].value === 'string') {
							translated = this.translateError(data[0][i].value)
						} else {
							for (let j = 0; j < data[0][i].value.length; j++) {
								console.log(data[0][i].value[j])
								console.log(data[0][i].value[j].startsWith('$'))

								if (data[0][i].value[j].startsWith('$')) {
									translated +=
										data[0][i].value[j].substring(1)
								} else {
									translated += this.translateError(
										data[0][i].value[j]
									)
								}
							}
						}

						console.log(translated)

						var ComponentClass = Vue.extend(Error)
						var instance = new ComponentClass({
							propsData: {
								alertText: translated,
							},
						})

						instance.$mount()
						alertsElement.appendChild(instance.$el)
					}

					let currentWarningLines = []

					for (let i = 0; i < data[1].length; i++) {
						const start = data[1][i].start
						const end = data[1][i].end

						currentWarningLines.push([start, end])

						let translated = ''

						if (typeof data[1][i].value === 'string') {
							translated = this.translateWarning(data[1][i].value)
						} else {
							for (let j = 0; j < data[1][i].value.length; j++) {
								if (data[1][i].value[j].startsWith('$')) {
									translated +=
										data[1][i].value[j].substring(1)
								} else {
									translated += this.translateWarning(
										data[1][i].value[j]
									)
								}
							}
						}

						var ComponentClass = Vue.extend(Warning)
						var instance = new ComponentClass({
							propsData: {
								alertText: translated,
							},
						})

						instance.$mount()
						alertsElement.appendChild(instance.$el)
					}

					if (fullCommmandDisplayElement) {
						if (fullCommmandDisplayElement.innerHTML) {
							let writeOffset = 0
							let writeIndex = 0

							for (
								let i = 0;
								i < fullCommmandDisplayElement.innerHTML.length;
								i++
							) {
								for (
									let j = 0;
									j < currentErrorLines.length;
									j++
								) {
									if (currentErrorLines[j][0] == writeIndex) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'<span class="error-line">' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 25
									}

									if (currentErrorLines[j][1] == writeIndex) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'</span>' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 7
									}
								}

								for (
									let j = 0;
									j < currentWarningLines.length;
									j++
								) {
									if (
										currentWarningLines[j][0] == writeIndex
									) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'<span class="warning-line">' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 27
									}

									if (
										currentWarningLines[j][1] == writeIndex
									) {
										fullCommmandDisplayElement.innerHTML =
											'Full Command: ' +
											fullCommmandDisplayElement.innerHTML.substring(
												14,
												14 + i
											) +
											'</span>' +
											fullCommmandDisplayElement.innerHTML.substring(
												14 + i,
												fullCommmandDisplayElement
													.innerHTML.length
											)

										i += 7
									}
								}

								writeIndex++
							}
						}
					}

					docsElement.textContent =
						await this.app!.languageManager.mcfunction.validator.GetDocs(
							command
						)

					if (data[0].length > 0) {
						return true
					}
				}
			}
		} else {
			return true
		}

		return false
	}

	protected SlowStepLine() {
		setTimeout(() => {
			if (!this.stopped) {
				this.currentLine += 1
				this.LoadCurrentLine().then((shouldStop) => {
					if (!shouldStop && !this.stopped) {
						this.SlowStepLine()
					}

					this.stopped = false
				})
			}
		}, 0)
	}

	protected async Play() {
		this.stopped = false

		await this.LoadFileContent()

		this.currentLine = 0

		let shouldStop = false

		shouldStop = await this.LoadCurrentLine()

		if (!shouldStop) {
			this.SlowStepLine()
		}
	}

	protected async StepLine() {
		this.stopped = false

		await this.LoadFileContent()

		this.currentLine += 1
		this.LoadCurrentLine()
	}

	protected async Restart() {
		await this.LoadFileContent()

		this.currentLine = 0
		this.LoadCurrentLine()

		this.stopped = true
	}

	async onActivate() {
		await super.onActivate()

		this.app = await App.getApp()

		if (!this.app.languageManager.mcfunction.validator.loadedCommandData) {
			this.app.languageManager.mcfunction.validator.LoadCommandData()
		}

		await this.LoadFileContent()

		await this.app.languageManager.mcfunction.validator.LoadCommandData()

		await this.UpdateLoadedState()
	}

	async onDeactivate() {
		this.stopped = true
	}
}
