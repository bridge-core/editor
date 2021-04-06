import { MoLang as BridgeMoLang } from 'molang'

type TVariableHandler =
	| ((variableName: string, variables: Record<string, unknown>) => unknown)
	| null
export default class MoLang {
	protected moLang = new BridgeMoLang()
	protected _cacheEnabled = true
	protected _globalVariables: any = {}
	protected _variableHandler: TVariableHandler = null

	parse(expr: string, variables?: any) {
		if (variables) this.moLang.updateExecutionEnv(variables)

		return this.moLang.executeAndCatch(expr)
	}

	set cache_enabled(val: boolean) {
		this._cacheEnabled = val
		this.moLang.updateConfig({ useCache: val })
	}
	get cache_enabled() {
		return this._cacheEnabled
	}

	set global_variables(val: any) {
		throw new Error(`Setting global variables this way is not supported`)
	}
	get global_variables() {
		throw new Error(`Accessing global variables this way is not supported`)
	}

	set variableHandler(handler: TVariableHandler) {
		this._variableHandler = handler
		this.moLang.updateConfig({
			variableHandler: handler ?? undefined,
		})
	}
	get variableHandler() {
		return this._variableHandler
	}
}
