import { languages } from 'monaco-editor'

export function setupTypescript() {
	languages.typescript.javascriptDefaults.setCompilerOptions({
		target: languages.typescript.ScriptTarget.ESNext,
		allowNonTsExtensions: true,
		alwaysStrict: true,
		checkJs: true,
	})

	languages.typescript.typescriptDefaults.setCompilerOptions({
		target: languages.typescript.ScriptTarget.ESNext,
		allowNonTsExtensions: true,
		alwaysStrict: true,
		moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
		module: languages.typescript.ModuleKind.ESNext,
	})
}
