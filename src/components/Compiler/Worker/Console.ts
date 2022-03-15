import { Console } from 'dash-compiler'

interface ILogData {
	type?: 'info' | 'error' | 'warning'
}

export class ForeignConsole extends Console {
	protected logs: [string, ILogData][] = []
	protected changeListeners: (() => void)[] = []

	getLogs() {
		return this.logs
	}

	protected basicLog(message: any, { type }: ILogData = {}) {
		switch (type) {
			case 'warning':
				console.warn(message)
				break
			case 'error':
				console.error(message)
				break
			case 'info':
				console.info(message)
				break
			default:
				console.log(message)
				break
		}
		if (message instanceof Error) message = message.message

		this.logs.unshift([
			typeof message === 'string' ? message : JSON.stringify(message),
			{ type },
		])
		this.logsChanged()
	}

	addChangeListener(cb: () => void) {
		this.changeListeners.push(cb)
	}
	removeChangeListeners() {
		this.changeListeners = []
	}
	logsChanged() {
		this.changeListeners.forEach((cb) => cb())
	}

	clear() {
		this.logs = []
		this.logsChanged()
	}
	log(...args: any[]) {
		args.forEach((arg) => this.basicLog(arg))
	}
	info(...args: any[]) {
		args.forEach((arg) => this.basicLog(arg, { type: 'info' }))
	}
	warn(...args: any[]) {
		args.forEach((arg) => this.basicLog(arg, { type: 'warning' }))
	}
	error(...args: any[]) {
		args.forEach((arg) => this.basicLog(arg, { type: 'error' }))
	}
}
