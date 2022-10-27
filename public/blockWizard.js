!(function (e) {
	var t = {}
	function i(a) {
		if (t[a]) return t[a].exports
		var o = (t[a] = { i: a, l: !1, exports: {} })
		return e[a].call(o.exports, o, o.exports, i), (o.l = !0), o.exports
	}
	;(i.m = e),
		(i.c = t),
		(i.d = function (e, t, a) {
			i.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: a })
		}),
		(i.r = function (e) {
			'undefined' != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty(e, Symbol.toStringTag, {
					value: 'Module',
				}),
				Object.defineProperty(e, '__esModule', { value: !0 })
		}),
		(i.t = function (e, t) {
			if ((1 & t && (e = i(e)), 8 & t)) return e
			if (4 & t && 'object' == typeof e && e && e.__esModule) return e
			var a = Object.create(null)
			if (
				(i.r(a),
				Object.defineProperty(a, 'default', {
					enumerable: !0,
					value: e,
				}),
				2 & t && 'string' != typeof e)
			)
				for (var o in e)
					i.d(
						a,
						o,
						function (t) {
							return e[t]
						}.bind(null, o)
					)
			return a
		}),
		(i.n = function (e) {
			var t =
				e && e.__esModule
					? function () {
							return e.default
					  }
					: function () {
							return e
					  }
			return i.d(t, 'a', t), t
		}),
		(i.o = function (e, t) {
			return Object.prototype.hasOwnProperty.call(e, t)
		}),
		(i.p = ''),
		i((i.s = 8))
})([
	function (e, t, i) {
		'use strict'
		var a,
			o = function () {
				return (
					void 0 === a &&
						(a = Boolean(
							window && document && document.all && !window.atob
						)),
					a
				)
			},
			n = (function () {
				var e = {}
				return function (t) {
					if (void 0 === e[t]) {
						var i = document.querySelector(t)
						if (
							window.HTMLIFrameElement &&
							i instanceof window.HTMLIFrameElement
						)
							try {
								i = i.contentDocument.head
							} catch (e) {
								i = null
							}
						e[t] = i
					}
					return e[t]
				}
			})(),
			r = []
		function c(e) {
			for (var t = -1, i = 0; i < r.length; i++)
				if (r[i].identifier === e) {
					t = i
					break
				}
			return t
		}
		function s(e, t) {
			for (var i = {}, a = [], o = 0; o < e.length; o++) {
				var n = e[o],
					s = t.base ? n[0] + t.base : n[0],
					l = i[s] || 0,
					A = ''.concat(s, ' ').concat(l)
				i[s] = l + 1
				var g = c(A),
					m = { css: n[1], media: n[2], sourceMap: n[3] }
				;-1 !== g
					? (r[g].references++, r[g].updater(m))
					: r.push({
							identifier: A,
							updater: h(m, t),
							references: 1,
					  }),
					a.push(A)
			}
			return a
		}
		function l(e) {
			var t = document.createElement('style'),
				a = e.attributes || {}
			if (void 0 === a.nonce) {
				var o = i.nc
				o && (a.nonce = o)
			}
			if (
				(Object.keys(a).forEach(function (e) {
					t.setAttribute(e, a[e])
				}),
				'function' == typeof e.insert)
			)
				e.insert(t)
			else {
				var r = n(e.insert || 'head')
				if (!r)
					throw new Error(
						"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
					)
				r.appendChild(t)
			}
			return t
		}
		var A,
			g =
				((A = []),
				function (e, t) {
					return (A[e] = t), A.filter(Boolean).join('\n')
				})
		function m(e, t, i, a) {
			var o = i
				? ''
				: a.media
				? '@media '.concat(a.media, ' {').concat(a.css, '}')
				: a.css
			if (e.styleSheet) e.styleSheet.cssText = g(t, o)
			else {
				var n = document.createTextNode(o),
					r = e.childNodes
				r[t] && e.removeChild(r[t]),
					r.length ? e.insertBefore(n, r[t]) : e.appendChild(n)
			}
		}
		function d(e, t, i) {
			var a = i.css,
				o = i.media,
				n = i.sourceMap
			if (
				(o ? e.setAttribute('media', o) : e.removeAttribute('media'),
				n &&
					'undefined' != typeof btoa &&
					(a +=
						'\n/*# sourceMappingURL=data:application/json;base64,'.concat(
							btoa(
								unescape(encodeURIComponent(JSON.stringify(n)))
							),
							' */'
						)),
				e.styleSheet)
			)
				e.styleSheet.cssText = a
			else {
				for (; e.firstChild; ) e.removeChild(e.firstChild)
				e.appendChild(document.createTextNode(a))
			}
		}
		var p = null,
			u = 0
		function h(e, t) {
			var i, a, o
			if (t.singleton) {
				var n = u++
				;(i = p || (p = l(t))),
					(a = m.bind(null, i, n, !1)),
					(o = m.bind(null, i, n, !0))
			} else
				(i = l(t)),
					(a = d.bind(null, i, t)),
					(o = function () {
						!(function (e) {
							if (null === e.parentNode) return !1
							e.parentNode.removeChild(e)
						})(i)
					})
			return (
				a(e),
				function (t) {
					if (t) {
						if (
							t.css === e.css &&
							t.media === e.media &&
							t.sourceMap === e.sourceMap
						)
							return
						a((e = t))
					} else o()
				}
			)
		}
		e.exports = function (e, t) {
			;(t = t || {}).singleton ||
				'boolean' == typeof t.singleton ||
				(t.singleton = o())
			var i = s((e = e || []), t)
			return function (e) {
				if (
					((e = e || []),
					'[object Array]' === Object.prototype.toString.call(e))
				) {
					for (var a = 0; a < i.length; a++) {
						var o = c(i[a])
						r[o].references--
					}
					for (var n = s(e, t), l = 0; l < i.length; l++) {
						var A = c(i[l])
						0 === r[A].references &&
							(r[A].updater(), r.splice(A, 1))
					}
					i = n
				}
			}
		}
	},
	function (e, t, i) {
		'use strict'
		e.exports = function (e) {
			var t = []
			return (
				(t.toString = function () {
					return this.map(function (t) {
						var i = e(t)
						return t[2]
							? '@media '.concat(t[2], ' {').concat(i, '}')
							: i
					}).join('')
				}),
				(t.i = function (e, i, a) {
					'string' == typeof e && (e = [[null, e, '']])
					var o = {}
					if (a)
						for (var n = 0; n < this.length; n++) {
							var r = this[n][0]
							null != r && (o[r] = !0)
						}
					for (var c = 0; c < e.length; c++) {
						var s = [].concat(e[c])
						;(a && o[s[0]]) ||
							(i &&
								(s[2]
									? (s[2] = ''
											.concat(i, ' and ')
											.concat(s[2]))
									: (s[2] = i)),
							t.push(s))
					}
				}),
				t
			)
		}
	},
	function (e, t, i) {
		'use strict'
		var a = i(1),
			o = i.n(a)()(function (e) {
				return e[1]
			})
		o.push([
			e.i,
			'\n.block_wizard_icon_picker {\n\t\tdisplay: flex;\n}\n.block_wizard_icon_picker label {\n\t\tpadding: 3px;\n}\n.block_wizard_icon_picker > .icon_picker_left {\n\t\tbackground-color: var(--color-back);\n\t\tmargin-right: 8px;\n\t\theight: 64px;\n\t\twidth: 64px;\n}\n.block_wizard_icon_picker > .icon_picker_right {\n\t\theight: 24px;\n    \tcursor: pointer;\n}\n.block_wizard_icon_picker > .icon_picker_right label {\n    \tcursor: inherit;\n}\n.block_wizard_icon_picker > .icon_picker_right:hover {\n\t\tcolor: var(--color-light);\n}\n.block_wizard_icon_picker > .icon_picker_right i.icon {\n\t\tvertical-align: text-bottom;\n}\n',
			'',
		]),
			(t.a = o)
	},
	function (e, t, i) {
		'use strict'
		var a = i(1),
			o = i.n(a)()(function (e) {
				return e[1]
			})
		o.push([
			e.i,
			'\n#block_wizard_export_options {\n\tdisplay: grid;\n\tgrid-template-columns: auto auto auto;\n\tgrid-gap: 10px;\n\tmin-height: 125px;\n}\n.block_wizard_export_option {\n\tdisplay: inline-block;\n\tborder: 1px solid;\n\tborder-bottom: 10px solid;\n\tpadding: 12px;\n\tbackground-color: var(--color-back);\n\tcursor: pointer;\n}\n.block_wizard_export_option:hover {\n\tbackground-color: var(--color-button);\n}\n.block_wizard_export_option:not(.selected) {\n\tborder-top-color: transparent !important;\n\tborder-left-color: transparent !important;\n\tborder-right-color: transparent !important;\n}\n.block_wizard_export_option > h3 {\n\tmargin: 0;\n}\n#block_wizard_pack_list li {\n\tdisplay: inline-block;\n\twidth: min(100%, 254px);\n\toverflow: hidden;\n\tpadding: 4px;\n\tcursor: pointer;\n}\n#block_wizard_pack_list li:hover {\n\tcolor: var(--color-light);\n}\n#block_wizard_pack_list li.selected {\n\tbackground-color: var(--color-accent);\n\tcolor: var(--color-accent_text);\n}\n#block_wizard_pack_list li img, #block_wizard_pack_list li div {\n\tdisplay: inline-block;\n\theight: 32px;\n\twidth: 32px;\n\tbackground-color: var(--color-back);\n\tvertical-align: middle;\n\tmargin-right: 2px;\n}\n',
			'',
		]),
			(t.a = o)
	},
	function (e, t, i) {
		'use strict'
		var a = i(1),
			o = i.n(a)()(function (e) {
				return e[1]
			})
		o.push([
			e.i,
			'\n#block_wizard_wrapper {\n\t\tmin-height: 300px;\n\t\t--color-subtle_text: #91949C;\n}\n#block_wizard_wrapper > content {\n\t\tflex-grow: 1;\n}\n#block_wizard_navigation {\n\t\tflex: 40px 0 0;\n\t\tpadding: 8px;\n\t\tdisplay: flex;\n}\n#block_wizard_back_button {\n\t\tpadding: 5px;\n    \theight: 32px;\n\t\tcursor: pointer;\n}\n#block_wizard_back_button:hover {\n\t\tcolor: var(--color-light);\n}\n#block_wizard_navigation .bar_spacer {\n\t\tflex-grow: 1;\n}\n#block_wizard_next_button {\n\t\tbackground-color: var(--color-accent);\n\t\tcolor: var(--color-light);\n\t\twidth: 112px;\n\t\tmargin-right: 4px;\n}\n#minecraft_block_wizard section {\n\t\tpadding-top: 8px;\n\t\tpadding-bottom: 8px;\n}\n#minecraft_block_wizard p.description {\n\t\tcolor: var(--color-subtle_text);\n\t\tline-height: normal;\n\t\tmargin: 0;\n\t\tmargin-bottom: 2px;\n}\n#minecraft_block_wizard input[type=text], #minecraft_block_wizard input[type=number] {\n\t\tdisplay: block;\n\t\twidth: 100%;\n\t\theight: auto;\n\t\tbackground-color: var(--color-back);\n\t\tborder: 1px solid var(--color-border);\n\t\tpadding: 4px;\n\t\tpadding-right: 0;\n}\n#minecraft_block_wizard section.divided_section {\n\t\tdisplay: flex;\n\t\talign-items: center;\n}\n#minecraft_block_wizard section.divided_section > *:first-child {\n\t\twidth: 70px;\n\t\tmargin-right: 10px;\n\t\ttext-align: center;\n}\n#minecraft_block_wizard section.subsection {\n\t\tmargin-left: 40px;\n\t\tpadding: 4px 0;\n}\n#minecraft_block_wizard .wizard_columns {\n\t\tdisplay: flex;\n\t\tgap: 24px;\n\t\tflex-wrap: wrap;\n}\n#minecraft_block_wizard .wizard_columns > div {\n\t\tmin-width: 300px;\n\t\tflex-shrink: 1;\n\t\tflex-grow: 1;\n\t\twidth: 0;\n}\n#block_wizard_id_error {\n\t\tposition: absolute;\n\t\tright: 28px;\n\t\tmargin-top: -28px;\n}\n#block_wizard_id_error:hover .block_wizard_tooltip {\n\t\tdisplay: block;\n    \tvisibility: visible;\n\t\tmargin: 0;\n    \tright: -5px;\n}\n#break_block_animation {\n\t\theight: 48px;\n\t\twidth: 48px;\n\t\tflex-shrink: 0;\n\t\tbackground-color: var(--color-button);\n\t\tbackground-position-y: -128px;\n\t\tbackground-size: 100%;\n\t\tbox-shadow: 1px 1px 2px #00000080;\n\t\ttransform: rotate(5deg);\n\t\tmargin-right: 5px;\n}\n@keyframes break_block_animation {\n0%\t{background-position-y: 0;}\n9%\t{background-position-y: -48px;}\n18%\t{background-position-y: -96px;}\n27%\t{background-position-y: -144px;}\n36%\t{background-position-y: -192px;}\n45%\t{background-position-y: -240px;}\n54%\t{background-position-y: -288px;}\n63%\t{background-position-y: -336px;}\n70%\t{background-position-y: -384px;}\n80%\t{background-position-y: -432px;}\n90%\t{background-position-y: -480px;}\n99%\t{background-position-y: -528px;}\n}\n#block_friction_markers {\n\t\twidth: calc(100% - 50px);\n\t\tposition: relative;\n\t\theight: 20px;\n\t\tmargin-left: 50px;\n}\n#block_friction_markers > li {\n\t\tposition: absolute;\n\t\ttext-align: center;\n\t\tcolor: var(--color-subtle_text);\n\t\tmargin-left: -25px;\n}\n#block_friction_markers > li::before {\n\t\tcontent: "";\n\t\tdisplay: block;\n\t\tpointer-events: none;\n\t\theight: 12px;\n\t\twidth: 3px;\n\t\tposition: absolute;\n\t\ttop: -13px;\n\t\tright: 0;\n\t\tleft: 0;\n\t\tmargin: auto;\n\t\tbackground-color: var(--color-grid);\n}\n#block_friction_markers > li:first-child {\n\t\tleft: 8px;\n\t\tmargin: 0;\n}\n#block_friction_markers > li:first-child::before {\n\t\tmargin-left: 0;\n}\n#block_friction_markers > li:nth-child(2) {\n\t\tleft: calc(44.5% + 1px);\n\t\twidth: 50px;\n}\n#block_friction_markers > li:last-child {\n\t\tright: 8px;\n}\n#block_friction_markers > li:last-child::before {\n   \t\tmargin-right: 0;\n}\n#block_explosion_resistance_markers {\n\t\twidth: calc(100% - 50px);\n\t\tposition: relative;\n\t\theight: 20px;\n\t\tmargin-left: 50px;\n}\n#block_explosion_resistance_markers > li {\n\t\tposition: absolute;\n\t\ttext-align: center;\n\t\tcolor: var(--color-subtle_text);\n\t\tmargin-left: -25px;\n}\n#block_explosion_resistance_markers > li::before {\n\t\tcontent: "";\n\t\tdisplay: block;\n\t\tpointer-events: none;\n\t\theight: 12px;\n\t\twidth: 3px;\n\t\tposition: absolute;\n\t\ttop: -13px;\n\t\tright: 0;\n\t\tleft: 0;\n\t\tmargin: auto;\n\t\tbackground-color: var(--color-grid);\n}\n#block_explosion_resistance_markers > li:first-child {\n\t\tleft: 8px;\n\t\tmargin: 0;\n}\n#block_explosion_resistance_markers > li:first-child::before {\n\t\tmargin-left: 0;\n}\n#block_explosion_resistance_markers > li[block=planks] {\n\t\tleft: calc(26% + 7px);\n\t\twidth: 44px;\n}\n#block_explosion_resistance_markers > li[block=stone] {\n\t\tleft: calc(33% + 16px);\n\t\twidth: 26px;\n}\n#block_explosion_resistance_markers > li:last-child {\n\t\tright: calc(7% + 5px);\n}\n#block_explosion_resistance_markers > li:last-child::before {\n   \t\tmargin-right: 0;\n}\nul.block_wizard_preset_list {\n\t\tmax-height: 360px;\n\t\twidth: 100%;\n\t\toverflow-y: scroll;\n}\nul.block_wizard_preset_list > li {\n\t\tdisplay: flex;\n\t\tflex-direction: column;\n\t\tposition: relative;\n\t\tfloat: left;\n\t\twidth: 134px;\n\t\theight: 154px;\n\t\tmargin: 3px 2px;\n\t\tbackground-color: var(--color-back);\n\t\tcursor: pointer;\n\t\tbox-sizing: content-box;\n\t\tborder: 1px solid transparent;\n\t\tbackground-size: 90px;\n\t\tbackground-repeat: no-repeat;\n\t\tbackground-position-x: center;\n\t\tbackground-position-y: 18px;\n\t\timage-rendering: auto;\n}\nul.block_wizard_preset_list > li:hover {\n\t\tbackground-color: var(--color-selected);\n\t\tcolor: var(--color-light);\n}\nul.block_wizard_preset_list > li.selected {\n\t\t    border-color: var(--color-accent);\n}\nul.block_wizard_preset_list > li.selected::after {\n\t\tposition: absolute;\n\t\tcontent: "\\f00c";\n\t\tfont-family: \'Font Awesome 6 Free\';\n\t\tfont-weight: 600;\n\t\tcolor: var(--color-accent);\n\t\tbackground-color: var(--color-ui);\n\t\theight: 19px;\n\t\ttop: -7px;\n\t\tright: -4px;\n\t\tborder-bottom-left-radius: 8px;\n\t\tpadding-left: 2px;\n}\nul.block_wizard_preset_list > li label {\n\t\ttext-align: center;\n\t\twidth: 100%;\n\t\tmargin-top: auto;\n\t\tpointer-events: none;\n}\n#block_wizard_wrapper input[type="radio"] {\n\t\tvertical-align: middle;\n\t\tmargin-top: -4px;\n\t\tmargin-right: 6px;\n}\n#block_wizard_wrapper input[type="range"] {\n\t\tflex-grow: 1;\n\t\tz-index: 20;\n}\n#block_wizard_wrapper .bar.flex label {\n\t\tpadding: 3px 6px;\n\t\tmin-width: 50px;\n}\n#block_wizard_addon_installation {\n\t\timage-rendering: auto;\n\t\tmax-width: 100%;\n}\n#block_wizard_wrapper code.code {\n\t\tbackground-color: var(--color-back);\n\t\tborder: 1px solid var(--color-border);\n\t\tpadding: 1px;\n}\n#block_wizard_launch_vscode {\n\t\ttext-decoration: underline;\n\t\tdisplay: inline-block;\n}\n#block_wizard_launch_vscode img {\n\t\tvertical-align: top;\n\t\tmargin-right: 2px;\n}\n#block_wizard_launch_vscode:hover {\n\t\tcolor: var(--color-light);\n\t\tcursor: pointer;\n}\n\n',
			'',
		]),
			(t.a = o)
	},
	function (e, t) {
		e.exports = require('fs')
	},
	function (e, t) {
		e.exports = require('os')
	},
	function (e, t) {
		e.exports = require('child_process')
	},
	function (e, t, i) {
		'use strict'
		i.r(t)
		var a = function () {
			var e = this,
				t = e.$createElement,
				i = e._self._c || t
			return i('div', { attrs: { id: 'block_wizard_wrapper' } }, [
				i('h2', [e._v(e._s(e.pages[e.open_page].label))]),
				e._v(' '),
				'metadata' == e.open_page
					? i('content', [
							i('section', [
								i('label', { staticClass: 'required' }, [
									e._v('Display Name'),
								]),
								e._v(' '),
								i('p', { staticClass: 'description' }, [
									e._v(
										'The display name will be visible to players in-game.'
									),
								]),
								e._v(' '),
								i('input', {
									directives: [
										{
											name: 'model',
											rawName: 'v-model',
											value: e.form.display_name,
											expression: 'form.display_name',
										},
									],
									attrs: {
										type: 'text',
										placeholder: 'Test Block',
									},
									domProps: { value: e.form.display_name },
									on: {
										input: function (t) {
											t.target.composing ||
												e.$set(
													e.form,
													'display_name',
													t.target.value
												)
										},
									},
								}),
							]),
							e._v(' '),
							i('section', [
								i('label', { staticClass: 'required' }, [
									e._v('Identifier'),
								]),
								e._v(' '),
								i('p', { staticClass: 'description' }, [
									e._v(
										'The identifier is used internally in the addon to identify this block type.\n\t\t\t\tAn identifier consists of the namespace and the block name, separated by a colon.\n\t\t\t\tThe namespace should be a short and unique version of your name or the name of your addon.\n\t\t\t'
									),
								]),
								e._v(' '),
								i('input', {
									directives: [
										{
											name: 'model',
											rawName: 'v-model',
											value: e.form.identifier,
											expression: 'form.identifier',
										},
									],
									attrs: {
										type: 'text',
										placeholder: 'myname:custom_block',
									},
									domProps: { value: e.form.identifier },
									on: {
										input: function (t) {
											t.target.composing ||
												e.$set(
													e.form,
													'identifier',
													t.target.value
												)
										},
									},
								}),
								e._v(' '),
								e.identifier_error
									? i(
											'div',
											{
												attrs: {
													id: 'block_wizard_id_error',
												},
											},
											[
												i(
													'i',
													{
														staticClass:
															'material-icons',
														staticStyle: {
															color: '#ff415b',
														},
													},
													[e._v('error')]
												),
												e._v(' '),
												i(
													'div',
													{
														staticClass:
															'block_wizard_tooltip tooltip',
													},
													[
														e._v(
															e._s(
																e.identifier_error
															)
														),
													]
												),
											]
									  )
									: e._e(),
							]),
							e._v(' '),
							i('section', [
								i('label', { staticClass: 'required' }, [
									e._v('Creative Category'),
								]),
								e._v(' '),
								i('div', { staticClass: 'wizard_columns' }, [
									i(
										'div',
										[
											i(
												'p',
												{ staticClass: 'description' },
												[
													e._v(
														'Select the category of the block in the creative inventory'
													),
												]
											),
											e._v(' '),
											i('select-input', {
												attrs: {
													options:
														e.inventory_categories,
												},
												on: {
													input: function (t) {
														e.form.item_group =
															'none'
													},
												},
												model: {
													value: e.form.category,
													callback: function (t) {
														e.$set(
															e.form,
															'category',
															t
														)
													},
													expression: 'form.category',
												},
											}),
										],
										1
									),
									e._v(' '),
									i(
										'div',
										[
											i(
												'p',
												{ staticClass: 'description' },
												[
													e._v(
														'Optionally select the item group within the category.'
													),
												]
											),
											e._v(' '),
											i('select-input', {
												attrs: {
													options:
														e.inventory_groups[
															e.form.category
														],
												},
												model: {
													value: e.form.item_group,
													callback: function (t) {
														e.$set(
															e.form,
															'item_group',
															t
														)
													},
													expression:
														'form.item_group',
												},
											}),
										],
										1
									),
								]),
							]),
					  ])
					: e._e(),
				e._v(' '),
				'preset' == e.open_page
					? i('content', [
							e._m(0),
							e._v(' '),
							i('section', [
								i('label', { staticClass: 'required' }, [
									e._v('Preset'),
								]),
								e._v(' '),
								i(
									'ul',
									{ staticClass: 'block_wizard_preset_list' },
									e._l(e.presets, function (t, a) {
										return i(
											'li',
											{
												key: a,
												class: {
													selected:
														a == e.form.preset,
												},
												style: {
													backgroundImage:
														e.getThumbnail(
															t.thumbnail
														),
												},
												on: {
													click: function (t) {
														return e.selectPreset(a)
													},
												},
											},
											[i('label', [e._v(e._s(t.name))])]
										)
									}),
									0
								),
							]),
					  ])
					: e._e(),
				e._v(' '),
				'properties' == e.open_page
					? i('content', [
							i('section', { staticClass: 'divided_section' }, [
								i('input', {
									directives: [
										{
											name: 'model',
											rawName: 'v-model',
											value: e.form.mineable,
											expression: 'form.mineable',
										},
									],
									attrs: { type: 'checkbox' },
									domProps: {
										checked: Array.isArray(e.form.mineable)
											? e._i(e.form.mineable, null) > -1
											: e.form.mineable,
									},
									on: {
										change: function (t) {
											var i = e.form.mineable,
												a = t.target,
												o = !!a.checked
											if (Array.isArray(i)) {
												var n = e._i(i, null)
												a.checked
													? n < 0 &&
													  e.$set(
															e.form,
															'mineable',
															i.concat([null])
													  )
													: n > -1 &&
													  e.$set(
															e.form,
															'mineable',
															i
																.slice(0, n)
																.concat(
																	i.slice(
																		n + 1
																	)
																)
													  )
											} else e.$set(e.form, 'mineable', o)
										},
									},
								}),
								e._v(' '),
								e._m(1),
							]),
							e._v(' '),
							e.form.mineable
								? i(
										'section',
										{ staticClass: 'divided_section' },
										[
											i('input', {
												directives: [
													{
														name: 'model',
														rawName: 'v-model',
														value: e.form
															.destroy_time,
														expression:
															'form.destroy_time',
													},
												],
												attrs: {
													type: 'number',
													min: '0',
												},
												domProps: {
													value: e.form.destroy_time,
												},
												on: {
													input: function (t) {
														t.target.composing ||
															e.$set(
																e.form,
																'destroy_time',
																t.target.value
															)
													},
												},
											}),
											e._v(' '),
											e._m(2),
											e._v(' '),
											i('div', {
												style: {
													backgroundImage:
														e.getThumbnail(
															e.block_break_texture
														),
													animation:
														'break_block_animation ' +
														Math.max(
															e.form.destroy_time,
															0.25
														) +
														's steps(1) infinite',
												},
												attrs: {
													id: 'break_block_animation',
												},
											}),
										]
								  )
								: e._e(),
							e._v(' '),
							i('section', { staticClass: 'divided_section' }, [
								i('input', {
									directives: [
										{
											name: 'model',
											rawName: 'v-model',
											value: e.form.explodable,
											expression: 'form.explodable',
										},
									],
									attrs: { type: 'checkbox' },
									domProps: {
										checked: Array.isArray(
											e.form.explodable
										)
											? e._i(e.form.explodable, null) > -1
											: e.form.explodable,
									},
									on: {
										change: function (t) {
											var i = e.form.explodable,
												a = t.target,
												o = !!a.checked
											if (Array.isArray(i)) {
												var n = e._i(i, null)
												a.checked
													? n < 0 &&
													  e.$set(
															e.form,
															'explodable',
															i.concat([null])
													  )
													: n > -1 &&
													  e.$set(
															e.form,
															'explodable',
															i
																.slice(0, n)
																.concat(
																	i.slice(
																		n + 1
																	)
																)
													  )
											} else
												e.$set(e.form, 'explodable', o)
										},
									},
								}),
								e._v(' '),
								e._m(3),
							]),
							e._v(' '),
							e.form.explodable
								? i('section', [
										e._m(4),
										e._v(' '),
										i('div', { staticClass: 'bar flex' }, [
											i('input', {
												directives: [
													{
														name: 'model',
														rawName: 'v-model',
														value: e.form
															.explosion_resistance,
														expression:
															'form.explosion_resistance',
													},
												],
												staticStyle: {
													'max-width': '50px',
												},
												attrs: {
													type: 'number',
													min: '0',
													max: '10000',
												},
												domProps: {
													value: e.form
														.explosion_resistance,
												},
												on: {
													input: function (t) {
														t.target.composing ||
															e.$set(
																e.form,
																'explosion_resistance',
																t.target.value
															)
													},
												},
											}),
											e._v(' '),
											i('input', {
												attrs: {
													type: 'range',
													min: '1',
													max: '1.468',
													step: '0.001',
												},
												domProps: {
													value: Math.pow(
														e.form
															.explosion_resistance +
															1,
														1 / 24
													),
												},
												on: {
													input: function (t) {
														return e.inputExplosionResistance(
															t
														)
													},
												},
											}),
										]),
										e._v(' '),
										e._m(5),
								  ])
								: e._e(),
							e._v(' '),
							i('section', [
								e._m(6),
								e._v(' '),
								i('div', { staticClass: 'bar flex' }, [
									i('label', [e._v(e._s(e.form.friction))]),
									e._v(' '),
									i('input', {
										directives: [
											{
												name: 'model',
												rawName: 'v-model',
												value: e.form.friction,
												expression: 'form.friction',
											},
										],
										attrs: {
											type: 'range',
											min: '0',
											max: '0.9',
											step: '0.01',
										},
										domProps: { value: e.form.friction },
										on: {
											__r: function (t) {
												return e.$set(
													e.form,
													'friction',
													t.target.value
												)
											},
										},
									}),
								]),
								e._v(' '),
								e._m(7),
							]),
							e._v(' '),
							i('section', { staticClass: 'divided_section' }, [
								i('input', {
									directives: [
										{
											name: 'model',
											rawName: 'v-model',
											value: e.form.flammable,
											expression: 'form.flammable',
										},
									],
									attrs: { type: 'checkbox' },
									domProps: {
										checked: Array.isArray(e.form.flammable)
											? e._i(e.form.flammable, null) > -1
											: e.form.flammable,
									},
									on: {
										change: function (t) {
											var i = e.form.flammable,
												a = t.target,
												o = !!a.checked
											if (Array.isArray(i)) {
												var n = e._i(i, null)
												a.checked
													? n < 0 &&
													  e.$set(
															e.form,
															'flammable',
															i.concat([null])
													  )
													: n > -1 &&
													  e.$set(
															e.form,
															'flammable',
															i
																.slice(0, n)
																.concat(
																	i.slice(
																		n + 1
																	)
																)
													  )
											} else
												e.$set(e.form, 'flammable', o)
										},
									},
								}),
								e._v(' '),
								e._m(8),
							]),
							e._v(' '),
							e.form.flammable
								? i(
										'div',
										{
											staticStyle: {
												'{margin-left': '40px',
											},
										},
										[
											i(
												'section',
												{
													staticClass:
														'divided_section subsection',
												},
												[
													i('input', {
														directives: [
															{
																name: 'model',
																rawName:
																	'v-model',
																value: e.form
																	.fire_catch_chance,
																expression:
																	'form.fire_catch_chance',
															},
														],
														attrs: {
															type: 'number',
															min: '0',
														},
														domProps: {
															value: e.form
																.fire_catch_chance,
														},
														on: {
															input: function (
																t
															) {
																t.target
																	.composing ||
																	e.$set(
																		e.form,
																		'fire_catch_chance',
																		t.target
																			.value
																	)
															},
														},
													}),
													e._v(' '),
													e._m(9),
												]
											),
											e._v(' '),
											i(
												'section',
												{
													staticClass:
														'divided_section subsection',
												},
												[
													i('input', {
														directives: [
															{
																name: 'model',
																rawName:
																	'v-model',
																value: e.form
																	.fire_destroy_chance,
																expression:
																	'form.fire_destroy_chance',
															},
														],
														attrs: {
															type: 'number',
															min: '0',
														},
														domProps: {
															value: e.form
																.fire_destroy_chance,
														},
														on: {
															input: function (
																t
															) {
																t.target
																	.composing ||
																	e.$set(
																		e.form,
																		'fire_destroy_chance',
																		t.target
																			.value
																	)
															},
														},
													}),
													e._v(' '),
													e._m(10),
												]
											),
										]
								  )
								: e._e(),
					  ])
					: e._e(),
				e._v(' '),
				'appearance' == e.open_page
					? i('content', [
							e.current_tab_model
								? i(
										'section',
										{ staticClass: 'divided_section' },
										[
											i('input', {
												directives: [
													{
														name: 'model',
														rawName: 'v-model',
														value: e.form
															.use_current_model,
														expression:
															'form.use_current_model',
													},
												],
												attrs: { type: 'checkbox' },
												domProps: {
													checked: Array.isArray(
														e.form.use_current_model
													)
														? e._i(
																e.form
																	.use_current_model,
																null
														  ) > -1
														: e.form
																.use_current_model,
												},
												on: {
													change: function (t) {
														var i =
																e.form
																	.use_current_model,
															a = t.target,
															o = !!a.checked
														if (Array.isArray(i)) {
															var n = e._i(
																i,
																null
															)
															a.checked
																? n < 0 &&
																  e.$set(
																		e.form,
																		'use_current_model',
																		i.concat(
																			[
																				null,
																			]
																		)
																  )
																: n > -1 &&
																  e.$set(
																		e.form,
																		'use_current_model',
																		i
																			.slice(
																				0,
																				n
																			)
																			.concat(
																				i.slice(
																					n +
																						1
																				)
																			)
																  )
														} else
															e.$set(
																e.form,
																'use_current_model',
																o
															)
													},
												},
											}),
											e._v(' '),
											i('div', [
												i(
													'label',
													{ staticClass: 'required' },
													[
														e._v(
															'Use current model "' +
																e._s(
																	e.current_tab_model
																) +
																'"'
														),
													]
												),
											]),
										]
								  )
								: e._e(),
							e._v(' '),
							i('section', [
								e._m(11),
								e._v(' '),
								i('div', { staticClass: 'bar flex' }, [
									i('label', [
										e._v(e._s(e.form.light_emission)),
									]),
									e._v(' '),
									i('input', {
										directives: [
											{
												name: 'model',
												rawName: 'v-model',
												value: e.form.light_emission,
												expression:
													'form.light_emission',
											},
										],
										style: {
											'--color-thumb':
												'hsl(' +
												(38 +
													1.2 *
														e.form.light_emission) +
												', ' +
												(20 +
													5 * e.form.light_emission) +
												'%, ' +
												(20 +
													5 * e.form.light_emission) +
												'%)',
										},
										attrs: {
											type: 'range',
											min: '0',
											max: '15',
											step: '1',
										},
										domProps: {
											value: e.form.light_emission,
										},
										on: {
											__r: function (t) {
												return e.$set(
													e.form,
													'light_emission',
													t.target.value
												)
											},
										},
									}),
								]),
							]),
							e._v(' '),
							i('section', [
								e._m(12),
								e._v(' '),
								i('div', { staticClass: 'bar flex' }, [
									i('label', [
										e._v(e._s(e.form.light_dampening)),
									]),
									e._v(' '),
									i('input', {
										directives: [
											{
												name: 'model',
												rawName: 'v-model',
												value: e.form.light_dampening,
												expression:
													'form.light_dampening',
											},
										],
										style: {
											'--color-thumb':
												'hsl(' +
												(60 -
													1.2 *
														e.form
															.light_dampening) +
												', ' +
												(95 -
													5 *
														e.form
															.light_dampening) +
												'%, ' +
												(95 -
													5 *
														e.form
															.light_dampening) +
												'%)',
										},
										attrs: {
											type: 'range',
											min: '0',
											max: '15',
											step: '1',
										},
										domProps: {
											value: e.form.light_dampening,
										},
										on: {
											__r: function (t) {
												return e.$set(
													e.form,
													'light_dampening',
													t.target.value
												)
											},
										},
									}),
								]),
							]),
							e._v(' '),
							i(
								'section',
								[
									i('label', { staticClass: 'required' }, [
										e._v('Transparency'),
									]),
									e._v(' '),
									i('p', { staticClass: 'description' }, [
										e._v(
											'Select how transparent pixels will display in game.'
										),
									]),
									e._v(' '),
									i('select-input', {
										attrs: { options: e.block_materials },
										model: {
											value: e.form.material,
											callback: function (t) {
												e.$set(e.form, 'material', t)
											},
											expression: 'form.material',
										},
									}),
								],
								1
							),
							e._v(' '),
							i(
								'section',
								{ staticClass: 'divided_section' },
								[
									i('color-picker', {
										model: {
											value: e.form.map_color,
											callback: function (t) {
												e.$set(e.form, 'map_color', t)
											},
											expression: 'form.map_color',
										},
									}),
									e._v(' '),
									e._m(13),
								],
								1
							),
							e._v(' '),
							i(
								'section',
								[
									i('label', { staticClass: 'required' }, [
										e._v('Sound'),
									]),
									e._v(' '),
									i('p', { staticClass: 'description' }, [
										e._v(
											'Select the sound preset for the block'
										),
									]),
									e._v(' '),
									i('select-input', {
										staticStyle: { 'max-width': '220px' },
										attrs: { options: e.block_sounds },
										model: {
											value: e.form.sound,
											callback: function (t) {
												e.$set(e.form, 'sound', t)
											},
											expression: 'form.sound',
										},
									}),
								],
								1
							),
					  ])
					: e._e(),
				e._v(' '),
				'export' == e.open_page
					? i(
							'content',
							{ attrs: { id: 'block_wizard_export_page' } },
							[
								i('export', {
									attrs: {
										form: e.form,
										bedrock_installed: e.bedrock_installed,
										existing_packs: e.existing_packs,
									},
								}),
							],
							1
					  )
					: e._e(),
				e._v(' '),
				'next_steps' == e.open_page
					? i('content', [
							i('section', [
								i('label', [
									e._v(
										'The packs have now been exported to your selected destination'
									),
								]),
								e._v(' '),
								'mcaddon' == e.form.export_mode
									? i('p', [
											e._v(
												'To import the packs into Minecraft, open the downloaded .mcaddon file.'
											),
									  ])
									: e._e(),
								e._v(' '),
								i('p', { staticClass: 'description' }, [
									e._v(
										'To enable the addon, you need to add it to your Minecraft world.\n\t\t\t\tOpen your world settings and locate the Behavior Packs section.\n\t\t\t\tFind your new pack and activate it.\n\t\t\t\tEnabling the behavior pack will also automatically activate the resource pack.\n\t\t\t'
									),
								]),
								e._v(' '),
								i('img', {
									attrs: {
										src: e.addon_installation_image,
										id: 'block_wizard_addon_installation',
										width: '660px',
									},
								}),
								e._v(' '),
								'none' == e.form.spawn_egg_mode
									? i('p', [
											e._v(
												'Now you can place your block in the world using the command '
											),
											i(
												'code',
												{
													staticClass: 'code',
													on: {
														click: function (t) {
															return e.copySummonCommand()
														},
													},
												},
												[
													e._v(
														'/setblock ~ ~ ~ ' +
															e._s(
																e.form
																	.identifier
															)
													),
												]
											),
									  ])
									: i('p', [
											e._v(
												'Now you can find the block in the creative inventory!'
											),
									  ]),
							]),
							e._v(' '),
							'mcaddon' != e.form.export_mode
								? i('section', [
										i('label', [
											e._v(
												"Now let's edit the block model!"
											),
										]),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'After you close this dialog, you will be able to edit the model and texture and animations in Blockbench'
											),
										]),
										e._v(' '),
										i(
											'div',
											{
												attrs: {
													id: 'block_wizard_launch_vscode',
												},
												on: {
													click: function (t) {
														return e.VSCode.launch(
															e.behavior_pack_path,
															e.resource_pack_path
														)
													},
												},
											},
											[
												i('img', {
													attrs: {
														src: e.VSCode.icon,
														width: '22px',
													},
												}),
												e._v(
													'\n\t\t\t\t' +
														e._s(
															e.VSCode.installed
																? 'Open Add-on in VS Code'
																: 'Download VS Code'
														) +
														'\n\t\t\t'
												),
											]
										),
								  ])
								: i('section', [
										i('label', [
											e._v(
												"Now let's edit the block model!"
											),
										]),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'After you close this dialog, you will be able to edit the model and texture and animations in Blockbench'
											),
										]),
										e._v(' '),
										e._m(14),
								  ]),
							e._v(' '),
							e._m(15),
					  ])
					: e._e(),
			])
		}
		function o(e, t) {
			return e == t ? void 0 : e
		}
		a._withStripped = !0
		var n = {
			stone: {
				name: 'Stone',
				sound: 'stone',
				model_type: 'unit_cube',
				thumbnail:
					'data:image/png;base64,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',
				collision: !0,
				mineable: !0,
				explodable: !0,
				destroy_time: 1,
				explosion_resistance: 30,
				breathable: !1,
				friction: 0.4,
				flammable: !1,
				light_emission: 0,
				light_dampening: 15,
				map_color: '#7d7d7d',
			},
			bedrock: {
				name: 'Bedrock',
				sound: 'stone',
				model_type: 'unit_cube',
				thumbnail:
					'data:image/png;base64,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',
				collision: !0,
				mineable: !1,
				explodable: !1,
				breathable: !1,
				friction: 0.4,
				flammable: !1,
				light_emission: 0,
				light_dampening: 15,
				map_color: '#3a3c3d',
			},
			glass: {
				name: 'Glass',
				sound: 'glass',
				model_type: 'unit_cube',
				thumbnail:
					'data:image/png;base64,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',
				collision: !0,
				mineable: !0,
				explodable: !0,
				destroy_time: 0.4,
				explosion_resistance: 0,
				breathable: !0,
				friction: 0.4,
				flammable: !1,
				light_emission: 0,
				light_dampening: 0,
				map_color: '#edf9ff',
			},
			glowstone: {
				name: 'Glowstone',
				sound: 'glass',
				model_type: 'unit_cube',
				thumbnail:
					'data:image/png;base64,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',
				collision: !0,
				mineable: !0,
				explodable: !0,
				destroy_time: 0.4,
				explosion_resistance: 0,
				breathable: !0,
				friction: 0.4,
				flammable: !1,
				light_emission: 15,
				light_dampening: 15,
				map_color: '#ffcd17',
			},
		}
		const r = {
				stone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnklEQVQ4y4VTQRIAMQTzXA9w7xM8uXti0jS6B8OYEiK1zNxoa60dETsiOnb3I4dmFWABPypz925Wbw1REImRp8Y9Aa5QnvM4bZlhZ0YrzzxhjTGiMl6pfGaeEzAKxuMVsDsjvNbrBqwBReC0Yp9R8aCKlejM3S8h8UossOOMarTX2LyuKYLUn2Apl7fpE03MY+6a4CWmiUj7U5/iBME+eeR3wyunqoUAAAAASUVORK5CYII=',
				bedrock:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADASURBVDjLhZPbDcUgDEMzCyt0GAZgKMbtlZFcnVqp7kcUGsCPkNZa676u6xVzznvvfWvPa2XuO5cWOqjwJWbtK7s2xniBHAAXc+3LvuCwIgEW5VqyQHiQ8tNqmdFMecBrWyLZY4Hy+E1bXe0AENW+/tWsViD1xd6x0ZbBi+j51l/sjOqYqIZs+bznGTlE2W2CkpXTW+xwWkh7JFM8TaS0lEt17SDl7HMSeZj9oYriCHcT2Fl5Keh+pmyWQXIeVPsBQmH+agMUE5UAAAAASUVORK5CYII=',
				glass: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABaSURBVDjLY7jw6uV/cvGKCzf/M4AYDQ0NDORgrAaQYmD1uu2oBpDqGhQDQM4h1QsYLiAVdx88S5kBA++C4WIAOfEPs5QsFyCrJ9sFKJkJRIAwyDQYTQyG6QMAiP/54kqEtt0AAAAASUVORK5CYII=',
				glowstone:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAD6SURBVDjLbZOxDUIxEENvFgokRmAAWkTBEHQUsAKI4ZjgT0FPEfCJF1kWkfJ//sW5s3359V6u43k/jtthM867VU99E9dUTPs9XsvEP07bUQoAFvCyX/cUgJiAWgub+EqgvmFDMsX1VswPNwM9vEpK0kENxUkCvhMAaoo/jeikosdghJTCIAdqrYk8Z8VhWJXTAuw6XQoegWsTtXCT3FRi2ocRSSg428gmSbwi3lBVey35Owpz0Oh9zv57+2BV3rI0LOPpR3vgfQVAdlUF6L4gV+siW15nb5VTd8+awaxml8hZIMeNcz/Kjfp3jVNi7hdasppT5acimRv5Achkgl/nEOAdAAAAAElFTkSuQmCC',
				flower: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADmSURBVDjLY2AYdOD169cMBx2UGWbv3fv/+/fv/6+9ePFffc1vsDhRIPD2XwaQJhAGGQAzhGgXwDR+3aX+/981SzAGiYFcRJQBMFtBGv+/8QcbBBMjygCQTSAbYS74OFeVNG+ELzFiQPc/CAcu1CY+FpzblOGGgFwEMpToWABpDp1vyODYLcMQNEvvv3gNC9gAyzox4gwAKQyYqcFgVMXHELpa9z+IHzjRkDQDQLaCbAcZALOdaAPAiQloI8gQkAFw9mQj4g0A2QYOC6ABIM1ExwDcBUANIENggUiyATAA0py/xRevGgAMdMhHZrrY8wAAAABJRU5ErkJggg==',
			},
			c = {
				unit_cube: {
					description: {
						identifier: 'geometry.unknown',
						texture_width: 16,
						texture_height: 16,
						visible_bounds_width: 2,
						visible_bounds_height: 2.5,
						visible_bounds_offset: [0, 0.75, 0],
					},
					bones: [
						{
							name: 'block',
							pivot: [0, 0, 0],
							cubes: [
								{
									origin: [-8, 0, -8],
									size: [16, 16, 16],
									uv: {
										north: {
											uv: [0, 0],
											uv_size: [16, 16],
										},
										east: { uv: [0, 0], uv_size: [16, 16] },
										south: {
											uv: [0, 0],
											uv_size: [16, 16],
										},
										west: { uv: [0, 0], uv_size: [16, 16] },
										up: {
											uv: [16, 16],
											uv_size: [-16, -16],
										},
										down: {
											uv: [16, 16],
											uv_size: [-16, -16],
										},
									},
								},
							],
						},
					],
				},
				cross: {
					description: {
						identifier: 'geometry.unknown',
						texture_width: 16,
						texture_height: 16,
						visible_bounds_width: 3,
						visible_bounds_height: 2.5,
						visible_bounds_offset: [0, 0.75, 0],
					},
					bones: [
						{
							name: 'block',
							pivot: [0, 0, 0],
							cubes: [
								{
									origin: [-8, 0, 0],
									size: [16, 16, 0],
									pivot: [0, 0, 0],
									rotation: [0, -135, 0],
									uv: {
										north: {
											uv: [0, 0],
											uv_size: [16, 16],
										},
									},
								},
								{
									origin: [-8, 0, 0],
									size: [16, 16, 0],
									pivot: [0, 0, 0],
									rotation: [0, 135, 0],
									uv: {
										north: {
											uv: [0, 0],
											uv_size: [16, 16],
										},
									},
								},
							],
						},
					],
				},
			}
		var s =
				'data:image/png;base64,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',
			l = isApp ? i(5) : 0
		function A(e) {
			const t = i(6)
			let a = null
			switch (t.platform()) {
				case 'win32':
					let e = Settings.get('block_wizard_target_edition')
					a =
						'edu' == e
							? PathModule.join(
									electron.process.env.APPDATA,
									'Minecraft Education Edition'
							  )
							: 'preview' == e
							? PathModule.join(
									electron.process.env.LOCALAPPDATA,
									'Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState'
							  )
							: PathModule.join(
									electron.process.env.LOCALAPPDATA,
									'Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState'
							  )
					break
				case 'linux':
					a = PathModule.join(
						t.homedir(),
						'.local/share/mcpelauncher'
					)
					break
				case 'darwin':
					a = PathModule.join(
						t.homedir(),
						'Library/Application Support/mcpelauncher'
					)
					break
				case 'android':
					a = PathModule.join(t.homedir(), 'storage/shared/')
					break
				default:
					return ''
			}
			return PathModule.join(a, 'games/com.mojang')
		}
		function g(e) {
			return e.split(',')[1]
		}
		function m() {
			if (!isApp) return []
			let e = A(),
				t = [],
				i = []
			try {
				t = l.readdirSync(
					PathModule.join(e, 'development_resource_packs'),
					{ withFileTypes: !0 }
				)
			} catch (e) {
				return !1
			}
			let a = {}
			t.forEach((t) => {
				if (t.isDirectory)
					try {
						let i = PathModule.join(
								e,
								'development_resource_packs',
								t.name
							),
							o = l.readFileSync(
								PathModule.join(i, 'manifest.json'),
								{ encoding: 'utf-8' }
							),
							n = autoParseJSON(o, !1)
						n && n.header && (a[n.header.uuid] = i)
					} catch (e) {
						console.error(e)
					}
			})
			try {
				i = l.readdirSync(
					PathModule.join(e, 'development_behavior_packs'),
					{ withFileTypes: !0 }
				)
			} catch (e) {
				return !1
			}
			let o = []
			return (
				i.forEach((t) => {
					if (t.isDirectory)
						try {
							let i = PathModule.join(
									e,
									'development_behavior_packs',
									t.name
								),
								n = l.readFileSync(
									PathModule.join(i, 'manifest.json'),
									{ encoding: 'utf-8' }
								),
								r = autoParseJSON(n, !1)
							if (r && r.dependencies && r.dependencies[0]) {
								let e = r.dependencies[0].uuid
								o.push({
									name: t.name,
									bp_path: i,
									rp_path: a[e],
									has_icon: !0,
								})
							}
						} catch (e) {
							console.error(e)
						}
				}),
				o
			)
		}
		async function d(e, t) {
			let i = isApp && A(),
				a = e.identifier.replace(/^.+:/, ''),
				m = guid(),
				d = s
			if (e.pack_icon) {
				let t = new CanvasFrame(16, 16)
				await t.loadFromURL(e.pack_icon), (d = t.canvas.toDataURL())
			}
			let p,
				u,
				h = {
					authors: e.pack_authors
						? e.pack_authors.split(/,\s*/)
						: void 0,
					generated_with: { blockbench_block_wizard: ['1.0.1'] },
				},
				I = (function (e, t) {
					let i = [],
						a = {
							'minecraft:destructible_by_mining':
								!!e.mineable && {
									seconds_to_destroy: Math.clamp(
										parseFloat(e.destroy_time),
										0,
										1e3
									),
								},
							'minecraft:destructible_by_explosion':
								!!e.explodable && {
									explosion_resistance: Math.clamp(
										parseFloat(e.explosion_resistance),
										0,
										200
									),
								},
							'minecraft:friction': o(
								Math.clamp(parseFloat(e.friction), 0, 0.9),
								0.4
							),
							'minecraft:flammable': e.flammable
								? {
										destroy_chance_modifier: parseFloat(
											e.fire_destroy_chance
										),
										catch_chance_modifier: parseFloat(
											e.fire_catch_chance
										),
								  }
								: void 0,
							'minecraft:geometry':
								'geometry.' + t.block_filename,
							'minecraft:material_instances': {
								'*': {
									texture: t.block_filename,
									render_method: e.material,
								},
							},
							'minecraft:light_emission': o(
								parseInt(e.light_emission),
								0
							),
							'minecraft:light_dampening': o(
								parseInt(e.light_dampening),
								15
							),
							'minecraft:map_color': e.map_color,
						}
					i.push({
						name: `blocks/${t.block_filename}.block.json`,
						content: compileJSON({
							format_version: '1.19.40',
							'minecraft:block': {
								description: {
									identifier: e.identifier,
									menu_category:
										'hidden' == e.category
											? void 0
											: {
													category: e.category,
													group:
														'none' == e.item_group
															? void 0
															: e.item_group,
											  },
								},
								components: a,
							},
						}),
					})
					let n = guid()
					return (
						i.push({
							name: 'manifest.json',
							setup_file: !0,
							content: compileJSON({
								format_version: 2,
								header: {
									name: e.pack_name,
									description: e.pack_name + ' Behavior Pack',
									uuid: n,
									version: [1, 0, 0],
									min_engine_version: [1, 16, 0],
								},
								metadata: t.pack_metadata,
								modules: [
									{
										description: 'Behavior',
										version: [1, 0, 0],
										uuid: guid(),
										type: 'data',
									},
								],
								dependencies: [
									{ uuid: t.rp_uuid, version: [1, 0, 0] },
								],
							}),
						}),
						i.push({
							name: 'pack_icon.png',
							setup_file: !0,
							type: 'image',
							content: t.pack_icon,
						}),
						i
					)
				})(e, {
					block_filename: a,
					rp_uuid: m,
					pack_icon: d,
					pack_metadata: h,
				}),
				C = await (async function (e, t) {
					let i,
						a = [],
						o = n[e.preset],
						s = c[o.model_type],
						l = r[e.preset]
					e.use_current_model &&
						Project &&
						((s = Codecs.bedrock.compile({ raw: !0 })[
							'minecraft:geometry'
						][0]),
						(Project.model_identifier = t.block_filename),
						Texture.all.length &&
							(l =
								'data:image/png;base64,' +
								Texture.getDefault().getBase64())),
						window.BlockWizardProject.project &&
							(i = ModelProject.all.find(
								(e) =>
									e.uuid == window.BlockWizardProject.project
							)),
						i &&
							((s = Codecs.bedrock.compile({ raw: !0 })[
								'minecraft:geometry'
							][0]),
							Texture.all[0] &&
								(l =
									'data:image/png;base64,' +
									Texture.getDefault().getBase64())),
						(s.description.identifier =
							'geometry.' + t.block_filename)
					let A = {
						format_version: '1.19.0',
						'minecraft:geometry': [s],
					}
					;(window.BlockWizardProject.model = A),
						a.push({
							name: `models/blocks/${t.block_filename}.geo.json`,
							model_file: !0,
							content: compileJSON(A),
						}),
						(window.BlockWizardProject.texture = l),
						a.push({
							name: `textures/blocks/${t.block_filename}.png`,
							type: 'image',
							texture_file: !0,
							content: l,
						}),
						a.push({
							name: 'textures/terrain_texture.json',
							merge: !0,
							content: compileJSON({
								resource_pack_name: 'vanilla',
								texture_name: 'atlas.terrain',
								padding: 8,
								num_mip_levels: 4,
								texture_data: {
									[t.block_filename]: {
										textures: `textures/blocks/${t.block_filename}.png`,
									},
								},
							}),
						}),
						a.push({
							name: 'blocks.json',
							merge: !0,
							content: compileJSON({
								[t.block_filename]: { sound: e.sound },
							}),
						})
					let g = [`tile.${e.identifier}.name=${e.display_name}`]
					return (
						a.push({
							name: 'texts/en_US.lang',
							merge: !0,
							content: g.join('\n'),
						}),
						a.push({
							name: 'manifest.json',
							setup_file: !0,
							content: compileJSON({
								format_version: 2,
								header: {
									name: e.pack_name,
									description: e.pack_name + ' Resource Pack',
									uuid: t.rp_uuid,
									version: [1, 0, 0],
									min_engine_version: [1, 16, 0],
								},
								metadata: t.pack_metadata,
								modules: [
									{
										description: e.pack_name,
										type: 'resources',
										uuid: guid(),
										version: [1, 0, 0],
									},
								],
							}),
						}),
						a.push({
							name: 'pack_icon.png',
							setup_file: !0,
							type: 'image',
							content: t.pack_icon,
						}),
						a
					)
				})(e, {
					block_filename: a,
					rp_uuid: m,
					pack_icon: d,
					pack_metadata: h,
				})
			if ('folder' == e.export_mode) {
				p = PathModule.join(
					i,
					'development_behavior_packs',
					e.pack_name
				)
				try {
					l.readdirSync(p)
				} catch (e) {
					l.mkdirSync(p)
				}
				u = PathModule.join(
					i,
					'development_resource_packs',
					e.pack_name
				)
				try {
					l.readdirSync(u)
				} catch (e) {
					l.mkdirSync(u)
				}
			} else if ('integrate' == e.export_mode) {
				function E(e) {
					try {
						let t = l.readFileSync(e, { encoding: 'utf-8' }),
							i = autoParseJSON(t, !1)
						i &&
							(i.metadata || (i.metadata = {}),
							i.metadata.generated_with ||
								(i.metadata.generated_with = {}),
							i.metadata.generated_with
								.blockbench_block_wizard instanceof
								Array ==
								0 &&
								(i.metadata.generated_with.blockbench_block_wizard =
									[]),
							i.metadata.generated_with.blockbench_block_wizard.safePush(
								'1.0.1'
							),
							l.writeFileSync(e, compileJSON(i), {
								encoding: 'utf-8',
							}))
					} catch (e) {
						console.error(
							'Unable to add generator to existing pack manifests',
							e
						)
					}
				}
				;(p = e.integrate_pack.bp_path),
					(u = e.integrate_pack.rp_path),
					E(PathModule.join(p, 'manifest.json')),
					E(PathModule.join(u, 'manifest.json'))
			}
			if ('folder' == e.export_mode || 'integrate' == e.export_mode) {
				function M(t, i) {
					if (t.setup_file && 'integrate' == e.export_mode) return
					let a = PathModule.join(i, t.name)
					if (
						((function (e, t) {
							let i = e.split(PathModule.sep),
								a = Math.max(
									t.split(PathModule.sep).length - 1,
									1
								)
							for (; a < i.length; a++) {
								let e = PathModule.join(...i.slice(0, a + 1))
								try {
									l.readdirSync(e)
								} catch (t) {
									l.mkdirSync(e)
								}
							}
						})(PathModule.dirname(a), i),
						'integrate' == e.export_mode && l.existsSync(a))
					) {
						let e = l.readFileSync(a, 'utf-8')
						if ('json' == a.substr(-4))
							try {
								e = JSON.parse(e)
								let i = JSON.parse(t.content)
								$.extend(!0, i, e), (t.content = compileJSON(i))
							} catch (e) {}
						else t.content = e + '\n' + t.content
					}
					Blockbench.writeFile(a, {
						savetype: t.type,
						content: t.content,
					}),
						e.use_current_model &&
							t.model_file &&
							Project &&
							(Project.export_path = a)
				}
				I.forEach((e) => {
					M(e, p)
				}),
					C.forEach((e) => {
						M(e, u)
					})
			}
			if ('mcaddon' == e.export_mode) {
				let t = new JSZip()
				I.forEach((i) => {
					'image' == i.type && (i.content = g(i.content)),
						t.file(e.pack_name + ' Behavior/' + i.name, i.content, {
							base64: 'image' == i.type,
							binary: 'buffer' == i.type,
						})
				}),
					C.forEach((i) => {
						'image' == i.type && (i.content = g(i.content)),
							t.file(
								e.pack_name + ' Resources/' + i.name,
								i.content,
								{
									base64: 'image' == i.type,
									binary: 'buffer' == i.type,
								}
							)
					}),
					t
						.generateAsync({ type: 'blob' })
						.then((t) => {
							Blockbench.export({
								type: 'Minecraft Addon',
								extensions: ['mcaddon'],
								name: e.pack_name,
								content: t,
								savetype: 'zip',
							})
						})
						.catch((e) => {})
			}
			return { rp_path: u, bp_path: p }
		}
		var p = {
				metadata: { label: 'Naming', icon: 'description' },
				preset: { label: 'Preset', icon: 'view_list' },
				properties: { label: 'Properties', icon: 'tune' },
				appearance: { label: 'Design', icon: 'visibility' },
				export: { label: 'Export', icon: 'file_download' },
				next_steps: { label: 'Next Steps', icon: 'queue_play_next' },
			},
			u = function () {
				var e = this,
					t = e.$createElement,
					i = e._self._c || t
				return i(
					'div',
					[
						i('p', { staticClass: 'description' }, [
							e._v(
								'Export your block as a behavior and resource pack.'
							),
						]),
						e._v(' '),
						e.isApp && !e.bedrock_installed
							? i('p', { staticStyle: { color: '#ff4265' } }, [
									e._v(
										'No installation of Minecraft: Bedrock Edition was found on your computer. Install Minecraft to export your addon directly into the game.'
									),
							  ])
							: e._e(),
						e._v(' '),
						i(
							'section',
							{ attrs: { id: 'block_wizard_export_options' } },
							[
								e.isApp && e.bedrock_installed
									? i(
											'div',
											{
												staticClass:
													'block_wizard_export_option',
												class: {
													selected:
														'folder' ==
														e.form.export_mode,
												},
												staticStyle: {
													'border-color': '#dccb92',
												},
												on: {
													click: function (t) {
														e.form.export_mode =
															'folder'
													},
												},
											},
											[
												i('h3', [
													e._v('Export to Folder'),
												]),
												e._v(' '),
												i(
													'p',
													{
														staticClass:
															'description',
													},
													[
														e._v(
															'Export the packs directly into the development pack folders of your Minecraft installation, and get started right away.'
														),
													]
												),
											]
									  )
									: e._e(),
								e._v(' '),
								e.isApp &&
								e.bedrock_installed &&
								e.existing_packs.length
									? i(
											'div',
											{
												staticClass:
													'block_wizard_export_option',
												class: {
													selected:
														'integrate' ==
														e.form.export_mode,
												},
												staticStyle: {
													'border-color': '#83c4ea',
												},
												on: {
													click: function (t) {
														e.form.export_mode =
															'integrate'
													},
												},
											},
											[
												i('h3', [
													e._v('Integrate into Pack'),
												]),
												e._v(' '),
												i(
													'p',
													{
														staticClass:
															'description',
													},
													[
														e._v(
															'Integrate the block into an existing behavior and resource pack on your computer.'
														),
													]
												),
											]
									  )
									: e._e(),
								e._v(' '),
								i(
									'div',
									{
										staticClass:
											'block_wizard_export_option',
										class: {
											selected:
												'mcaddon' == e.form.export_mode,
										},
										staticStyle: {
											'border-color': '#89ca51',
										},
										on: {
											click: function (t) {
												e.form.export_mode = 'mcaddon'
											},
										},
									},
									[
										i('h3', [e._v('Export as MCAddon')]),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'Generate an MCAddon file that you can install in one click or send to your friends.'
											),
										]),
									]
								),
							]
						),
						e._v(' '),
						'integrate' == e.form.export_mode
							? [
									i('section', [
										i('label', [e._v('Behavior Pack')]),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'Select the behavior pack that you want to save the new block into'
											),
										]),
										e._v(' '),
										i(
											'ul',
											{
												attrs: {
													id: 'block_wizard_pack_list',
												},
											},
											e._l(
												e.existing_packs,
												function (t) {
													return i(
														'li',
														{
															key: t.name,
															class: {
																selected:
																	t ==
																	e.form
																		.integrate_pack,
															},
															on: {
																click: function (
																	i
																) {
																	e.form.integrate_pack =
																		t
																},
															},
														},
														[
															t.has_icon
																? i('img', {
																		attrs: {
																			src: e.getPackIcon(
																				t
																			),
																			width: '32px',
																		},
																		on: {
																			error: function (
																				e
																			) {
																				t.has_icon =
																					!1
																			},
																		},
																  })
																: i('div'),
															e._v(
																'\n\t\t\t\t\t' +
																	e._s(
																		t.name
																	) +
																	'\n\t\t\t\t'
															),
														]
													)
												}
											),
											0
										),
									]),
							  ]
							: [
									i('section', [
										i(
											'label',
											{ staticClass: 'required' },
											[e._v('Pack Name')]
										),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'The name of the packs you are exporting'
											),
										]),
										e._v(' '),
										i('input', {
											directives: [
												{
													name: 'model',
													rawName: 'v-model',
													value: e.form.pack_name,
													expression:
														'form.pack_name',
												},
											],
											attrs: {
												type: 'text',
												placeholder: 'Block Pack',
											},
											domProps: {
												value: e.form.pack_name,
											},
											on: {
												input: function (t) {
													t.target.composing ||
														e.$set(
															e.form,
															'pack_name',
															t.target.value
														)
												},
											},
										}),
									]),
									e._v(' '),
									i('section', [
										i('label', [e._v('Pack Author(s)')]),
										e._v(' '),
										i('p', { staticClass: 'description' }, [
											e._v(
												'You can enter your name as the author of the pack. To enter multiple names, separate them with a comma.'
											),
										]),
										e._v(' '),
										i('input', {
											directives: [
												{
													name: 'model',
													rawName: 'v-model',
													value: e.form.pack_authors,
													expression:
														'form.pack_authors',
												},
											],
											attrs: {
												type: 'text',
												placeholder:
													'Benchbot, Performance Panda',
											},
											domProps: {
												value: e.form.pack_authors,
											},
											on: {
												input: function (t) {
													t.target.composing ||
														e.$set(
															e.form,
															'pack_authors',
															t.target.value
														)
												},
											},
										}),
									]),
									e._v(' '),
									i(
										'section',
										[
											i('label', [e._v('Pack Icon')]),
											e._v(' '),
											i(
												'p',
												{ staticClass: 'description' },
												[
													e._v(
														'The pack icon will be visible in the resource and behavior pack menu'
													),
												]
											),
											e._v(' '),
											i('icon-picker', {
												model: {
													value: e.form.pack_icon,
													callback: function (t) {
														e.$set(
															e.form,
															'pack_icon',
															t
														)
													},
													expression:
														'form.pack_icon',
												},
											}),
										],
										1
									),
							  ],
					],
					2
				)
			}
		u._withStripped = !0
		var h = function () {
			var e = this,
				t = e.$createElement,
				i = e._self._c || t
			return i('div', { staticClass: 'block_wizard_icon_picker' }, [
				i('div', { staticClass: 'icon_picker_left' }, [
					e.value
						? i('img', {
								attrs: {
									src: e.value,
									width: '64px',
									height: '64px',
								},
						  })
						: e._e(),
				]),
				e._v(' '),
				i(
					'div',
					{
						staticClass: 'icon_picker_right',
						on: { click: e.pickImage },
					},
					[
						i('i', { staticClass: 'material-icons icon' }, [
							e._v('folder'),
						]),
						e._v(' '),
						i('label', [e._v(e._s(e.imageName))]),
					]
				),
			])
		}
		function I(e, t, i, a, o, n, r, c) {
			var s,
				l = 'function' == typeof e ? e.options : e
			if (
				(t &&
					((l.render = t),
					(l.staticRenderFns = i),
					(l._compiled = !0)),
				a && (l.functional = !0),
				n && (l._scopeId = 'data-v-' + n),
				r
					? ((s = function (e) {
							;(e =
								e ||
								(this.$vnode && this.$vnode.ssrContext) ||
								(this.parent &&
									this.parent.$vnode &&
									this.parent.$vnode.ssrContext)) ||
								'undefined' == typeof __VUE_SSR_CONTEXT__ ||
								(e = __VUE_SSR_CONTEXT__),
								o && o.call(this, e),
								e &&
									e._registeredComponents &&
									e._registeredComponents.add(r)
					  }),
					  (l._ssrRegister = s))
					: o &&
					  (s = c
							? function () {
									o.call(
										this,
										(l.functional ? this.parent : this)
											.$root.$options.shadowRoot
									)
							  }
							: o),
				s)
			)
				if (l.functional) {
					l._injectStyles = s
					var A = l.render
					l.render = function (e, t) {
						return s.call(t), A(e, t)
					}
				} else {
					var g = l.beforeCreate
					l.beforeCreate = g ? [].concat(g, s) : [s]
				}
			return { exports: e, options: l }
		}
		h._withStripped = !0
		var C = I(
			{
				name: 'icon-picker',
				props: { value: String },
				methods: {
					pickImage() {
						Blockbench.import(
							{
								readtype: 'image',
								type: 'Image',
								extensions: ['png'],
							},
							(e) => {
								;(this.value = e[0].content || e[0].path),
									this.$emit('input', this.value)
							}
						)
					},
				},
				computed: {
					imageName() {
						if (!this.value) return 'Select Image...'
						let e = this.value.split(osfs)
						return e.length > 2 ? e.last() : ''
					},
				},
			},
			h,
			[],
			!1,
			function (e) {
				var t = i(11)
				t.__inject__ && t.__inject__(e)
			},
			null,
			'6c5a6967'
		)
		C.options.__file = 'src/dialog/IconPicker.vue'
		var E = I(
			{
				components: { IconPicker: C.exports },
				name: 'export',
				props: {
					form: Object,
					existing_packs: Array,
					bedrock_installed: Boolean,
				},
				data: () => ({ isApp: isApp }),
				methods: {
					getPackIcon: (e) => e.bp_path + osfs + 'pack_icon.png',
				},
			},
			u,
			[],
			!1,
			function (e) {
				var t = i(10)
				t.__inject__ && t.__inject__(e)
			},
			null,
			'2947df98'
		)
		E.options.__file = 'src/dialog/Export.vue'
		var M = E.exports,
			k = function () {
				var e = this.$createElement,
					t = this._self._c || e
				return t('div', [t('input', { ref: 'color_picker' })])
			}
		k._withStripped = !0
		var b = I(
			{
				name: 'color-picker',
				props: { value: String },
				mounted() {
					$(this.$refs.color_picker).spectrum({
						preferredFormat: 'hex',
						color: this.value,
						showAlpha: !1,
						showInput: !0,
						move: (e) => {
							this.$emit('input', e.toHexString())
						},
						change: (e) => {
							this.$emit('input', e.toHexString())
						},
					})
				},
			},
			k,
			[],
			!1,
			function (e) {},
			null,
			'26f51d01'
		)
		b.options.__file = 'src/dialog/ColorPicker.vue'
		var w = b.exports
		const B = {
			installed: !1,
			icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBmaWxsPSJub25lIj4NCjxtYXNrIGlkPSJtYXNrMCIgbWFzay10eXBlPSJhbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xODEuNTM0IDI1NC4yNTJDMTg1LjU2NiAyNTUuODIzIDE5MC4xNjQgMjU1LjcyMiAxOTQuMjM0IDI1My43NjRMMjQ2Ljk0IDIyOC40MDNDMjUyLjQ3OCAyMjUuNzM4IDI1NiAyMjAuMTMyIDI1NiAyMTMuOTgzVjQyLjAxODFDMjU2IDM1Ljg2ODkgMjUyLjQ3OCAzMC4yNjM4IDI0Ni45NCAyNy41OTg4TDE5NC4yMzQgMi4yMzY4MUMxODguODkzIC0wLjMzMzEzMiAxODIuNjQyIDAuMjk2MzQ0IDE3Ny45NTUgMy43MDQxOEMxNzcuMjg1IDQuMTkxIDE3Ni42NDcgNC43MzQ1NCAxNzYuMDQ5IDUuMzMzNTRMNzUuMTQ5IDk3LjM4NjJMMzEuMTk5MiA2NC4wMjQ3QzI3LjEwNzkgNjAuOTE5MSAyMS4zODUzIDYxLjE3MzUgMTcuNTg1NSA2NC42M0wzLjQ4OTM2IDc3LjQ1MjVDLTEuMTU4NTMgODEuNjgwNSAtMS4xNjM4NiA4OC45OTI2IDMuNDc3ODUgOTMuMjI3NEw0MS41OTI2IDEyOEwzLjQ3Nzg1IDE2Mi43NzNDLTEuMTYzODYgMTY3LjAwOCAtMS4xNTg1MyAxNzQuMzIgMy40ODkzNiAxNzguNTQ4TDE3LjU4NTUgMTkxLjM3QzIxLjM4NTMgMTk0LjgyNyAyNy4xMDc5IDE5NS4wODEgMzEuMTk5MiAxOTEuOTc2TDc1LjE0OSAxNTguNjE0TDE3Ni4wNDkgMjUwLjY2N0MxNzcuNjQ1IDI1Mi4yNjQgMTc5LjUxOSAyNTMuNDY3IDE4MS41MzQgMjU0LjI1MlpNMTkyLjAzOSA2OS44ODUzTDExNS40NzkgMTI4TDE5Mi4wMzkgMTg2LjExNVY2OS44ODUzWiIgZmlsbD0id2hpdGUiLz4NCjwvbWFzaz4NCjxnIG1hc2s9InVybCgjbWFzazApIj4NCjxwYXRoIGQ9Ik0yNDYuOTQgMjcuNjM4M0wxOTQuMTkzIDIuMjQxMzhDMTg4LjA4OCAtMC42OTgzMDIgMTgwLjc5MSAwLjU0MTcyMSAxNzUuOTk5IDUuMzMzMzJMMy4zMjM3MSAxNjIuNzczQy0xLjMyMDgyIDE2Ny4wMDggLTEuMzE1NDggMTc0LjMyIDMuMzM1MjMgMTc4LjU0OEwxNy40Mzk5IDE5MS4zN0MyMS4yNDIxIDE5NC44MjcgMjYuOTY4MiAxOTUuMDgxIDMxLjA2MTkgMTkxLjk3NkwyMzkuMDAzIDM0LjIyNjlDMjQ1Ljk3OSAyOC45MzQ3IDI1NS45OTkgMzMuOTEwMyAyNTUuOTk5IDQyLjY2NjdWNDIuMDU0M0MyNTUuOTk5IDM1LjkwNzggMjUyLjQ3OCAzMC4zMDQ3IDI0Ni45NCAyNy42MzgzWiIgZmlsbD0iIzAwNjVBOSIvPg0KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZCkiPg0KPHBhdGggZD0iTTI0Ni45NCAyMjguMzYyTDE5NC4xOTMgMjUzLjc1OUMxODguMDg4IDI1Ni42OTggMTgwLjc5MSAyNTUuNDU4IDE3NS45OTkgMjUwLjY2N0wzLjMyMzcxIDkzLjIyNzJDLTEuMzIwODIgODguOTkyNSAtMS4zMTU0OCA4MS42ODAyIDMuMzM1MjMgNzcuNDUyM0wxNy40Mzk5IDY0LjYyOThDMjEuMjQyMSA2MS4xNzMzIDI2Ljk2ODIgNjAuOTE4OCAzMS4wNjE5IDY0LjAyNDVMMjM5LjAwMyAyMjEuNzczQzI0NS45NzkgMjI3LjA2NSAyNTUuOTk5IDIyMi4wOSAyNTUuOTk5IDIxMy4zMzNWMjEzLjk0NkMyNTUuOTk5IDIyMC4wOTIgMjUyLjQ3OCAyMjUuNjk1IDI0Ni45NCAyMjguMzYyWiIgZmlsbD0iIzAwN0FDQyIvPg0KPC9nPg0KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjFfZCkiPg0KPHBhdGggZD0iTTE5NC4xOTYgMjUzLjc2M0MxODguMDg5IDI1Ni43IDE4MC43OTIgMjU1LjQ1OSAxNzYgMjUwLjY2N0MxODEuOTA0IDI1Ni41NzEgMTkyIDI1Mi4zODkgMTkyIDI0NC4wMzlWMTEuOTYwNkMxOTIgMy42MTA1NyAxODEuOTA0IC0wLjU3MTE3NSAxNzYgNS4zMzMyMUMxODAuNzkyIDAuNTQxMTY2IDE4OC4wODkgLTAuNzAwNjA3IDE5NC4xOTYgMi4yMzY0OEwyNDYuOTM0IDI3LjU5ODVDMjUyLjQ3NiAzMC4yNjM1IDI1NiAzNS44Njg2IDI1NiA0Mi4wMTc4VjIxMy45ODNDMjU2IDIyMC4xMzIgMjUyLjQ3NiAyMjUuNzM3IDI0Ni45MzQgMjI4LjQwMkwxOTQuMTk2IDI1My43NjNaIiBmaWxsPSIjMUY5Q0YwIi8+DQo8L2c+DQo8ZyBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6b3ZlcmxheSIgb3BhY2l0eT0iMC4yNSI+DQo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE4MS4zNzggMjU0LjI1MkMxODUuNDEgMjU1LjgyMiAxOTAuMDA4IDI1NS43MjIgMTk0LjA3NyAyNTMuNzY0TDI0Ni43ODMgMjI4LjQwMkMyNTIuMzIyIDIyNS43MzcgMjU1Ljg0NCAyMjAuMTMyIDI1NS44NDQgMjEzLjk4M1Y0Mi4wMTc5QzI1NS44NDQgMzUuODY4NyAyNTIuMzIyIDMwLjI2MzYgMjQ2Ljc4NCAyNy41OTg2TDE5NC4wNzcgMi4yMzY2NUMxODguNzM3IC0wLjMzMzI5OSAxODIuNDg2IDAuMjk2MTc3IDE3Ny43OTggMy43MDQwMUMxNzcuMTI5IDQuMTkwODMgMTc2LjQ5MSA0LjczNDM3IDE3NS44OTIgNS4zMzMzN0w3NC45OTI3IDk3LjM4NkwzMS4wNDI5IDY0LjAyNDVDMjYuOTUxNyA2MC45MTg5IDIxLjIyOSA2MS4xNzM0IDE3LjQyOTIgNjQuNjI5OEwzLjMzMzExIDc3LjQ1MjNDLTEuMzE0NzggODEuNjgwMyAtMS4zMjAxMSA4OC45OTI1IDMuMzIxNiA5My4yMjczTDQxLjQzNjQgMTI4TDMuMzIxNiAxNjIuNzczQy0xLjMyMDExIDE2Ny4wMDggLTEuMzE0NzggMTc0LjMyIDMuMzMzMTEgMTc4LjU0OEwxNy40MjkyIDE5MS4zN0MyMS4yMjkgMTk0LjgyNyAyNi45NTE3IDE5NS4wODEgMzEuMDQyOSAxOTEuOTc2TDc0Ljk5MjcgMTU4LjYxNEwxNzUuODkyIDI1MC42NjdDMTc3LjQ4OCAyNTIuMjY0IDE3OS4zNjMgMjUzLjQ2NyAxODEuMzc4IDI1NC4yNTJaTTE5MS44ODMgNjkuODg1MUwxMTUuMzIzIDEyOEwxOTEuODgzIDE4Ni4xMTVWNjkuODg1MVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4NCjwvZz4NCjwvZz4NCjxkZWZzPg0KPGZpbHRlciBpZD0iZmlsdGVyMF9kIiB4PSItMjEuNDg5NiIgeT0iNDAuNTIyNSIgd2lkdGg9IjI5OC44MjIiIGhlaWdodD0iMjM2LjE0OSIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPg0KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4NCjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+DQo8ZmVPZmZzZXQvPg0KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMTAuNjY2NyIvPg0KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMjUgMCIvPg0KPGZlQmxlbmQgbW9kZT0ib3ZlcmxheSIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Ii8+DQo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvdyIgcmVzdWx0PSJzaGFwZSIvPg0KPC9maWx0ZXI+DQo8ZmlsdGVyIGlkPSJmaWx0ZXIxX2QiIHg9IjE1NC42NjciIHk9Ii0yMC42NzM1IiB3aWR0aD0iMTIyLjY2NyIgaGVpZ2h0PSIyOTcuMzQ3IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+DQo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPg0KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiLz4NCjxmZU9mZnNldC8+DQo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxMC42NjY3Ii8+DQo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4yNSAwIi8+DQo8ZmVCbGVuZCBtb2RlPSJvdmVybGF5IiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3ciLz4NCjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93IiByZXN1bHQ9InNoYXBlIi8+DQo8L2ZpbHRlcj4NCjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjEyNy44NDQiIHkxPSIwLjY1OTk4OCIgeDI9IjEyNy44NDQiIHkyPSIyNTUuMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4NCjxzdG9wIHN0b3AtY29sb3I9IndoaXRlIi8+DQo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIiBzdG9wLW9wYWNpdHk9IjAiLz4NCjwvbGluZWFyR3JhZGllbnQ+DQo8L2RlZnM+DQo8L3N2Zz4=',
			launch() {
				Blockbench.openLink('https://code.visualstudio.com')
			},
		}
		if (isApp) {
			let e = i(7)
			;(B.testIfInstalled = async function () {
				e.exec('code --version').on('close', (t) => {
					t ||
						((B.installed = !0),
						(B.launch = (t, i) => {
							let a = `code -n "${t}" "${i}"`
							e.exec(a)
						}))
				})
			}),
				B.testIfInstalled(),
				window.addEventListener('focus', (e) => {
					open_interface &&
						'minecraft_block_wizard' == open_interface.id &&
						B.testIfInstalled()
				})
		}
		var f = I(
			{
				name: 'block-wizard-dialog',
				components: {
					Export: M,
					ColorPicker: w,
					'select-input': Vue.options.components['select-input'],
				},
				data: () => ({
					open_page: 'metadata',
					addon_installation_image:
						'data:image/png;base64,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',
					block_break_texture:
						'data:image/png;base64,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',
					VSCode: B,
					pages: p,
					presets: n,
					inventory_categories: {
						hidden: 'Hidden',
						construction: 'Construction',
						equipment: 'Equipment',
						items: 'Items',
						nature: 'Nature',
					},
					inventory_groups: {
						construction: {
							none: 'None',
							'itemGroup.name.planks': 'Planks',
							'itemGroup.name.walls': 'Walls',
							'itemGroup.name.fence': 'Fences',
							'itemGroup.name.fenceGate': 'Fence Gates',
							'itemGroup.name.stairs': 'Stairs',
							'itemGroup.name.door': 'Doors',
							'itemGroup.name.glass': 'Glass',
							'itemGroup.name.glassPane': 'Glass Panes',
							'itemGroup.name.slab': 'Slabs',
							'itemGroup.name.stoneBrick': 'Decorative Stone',
							'itemGroup.name.sandstone': 'Sandstone',
							'itemGroup.name.wool': 'Wool',
							'itemGroup.name.woolCarpet': 'Wool Carpet',
							'itemGroup.name.concretePowder': 'Concrete Powder',
							'itemGroup.name.concrete': 'Concrete',
							'itemGroup.name.stainedClay': 'Terracotta',
							'itemGroup.name.glazedTerracotta':
								'Glazed Terracottas',
							'itemGroup.name.permission': 'Permission Blocks',
						},
						equipment: {
							none: 'None',
							'itemGroup.name.helmet': 'Helmets',
							'itemGroup.name.chestplate': 'Chestplates',
							'itemGroup.name.leggings': 'Leggings',
							'itemGroup.name.boots': 'Boots',
							'itemGroup.name.sword': 'Swords',
							'itemGroup.name.axe': 'Axes',
							'itemGroup.name.pickaxe': 'Pickaxes',
							'itemGroup.name.shovel': 'Shovels',
							'itemGroup.name.hoe': 'Hoes',
							'itemGroup.name.arrow': 'Arrows',
							'itemGroup.name.cookedFood': 'Cooked Food',
							'itemGroup.name.miscFood': 'Miscellaneous Foods',
							'itemGroup.name.goatHorn': 'Goat Horns',
							'itemGroup.name.horseArmor': 'Horse Armor',
							'itemGroup.name.potion': 'Potions',
							'itemGroup.name.splashPotion': 'Splash Potions',
							'itemGroup.name.lingeringPotion':
								'Lingering Potions',
						},
						items: {
							none: 'None',
							'itemGroup.name.bed': 'Beds',
							'itemGroup.name.candles': 'Candles',
							'itemGroup.name.anvil': 'Anvils',
							'itemGroup.name.chest': 'Chests',
							'itemGroup.name.shulkerBox': 'Shulker Boxes',
							'itemGroup.name.record': 'Records',
							'itemGroup.name.sign': 'Signs',
							'itemGroup.name.skull': 'Mob Skulls',
							'itemGroup.name.buttons': 'Buttons',
							'itemGroup.name.boat': 'Boats',
							'itemGroup.name.rail': 'Rails',
							'itemGroup.name.minecart': 'Minecarts',
							'itemGroup.name.pressurePlate': 'Pressure Plates',
							'itemGroup.name.trapdoor': 'Trapdoors',
							'itemGroup.name.enchantedBook': 'Enchanted Books',
							'itemGroup.name.banner_pattern': 'Banner Patterns',
							'itemGroup.name.banner': 'Banners',
							'itemGroup.name.firework': 'Fireworks',
							'itemGroup.name.fireworkStars': 'Firework Charges',
							'itemGroup.name.chalkboard': 'Chalkboards',
						},
						nature: {
							none: 'None',
							'itemGroup.name.dye': 'Dyes',
							'itemGroup.name.ore': 'Ores',
							'itemGroup.name.stone': 'Stone',
							'itemGroup.name.log': 'Logs',
							'itemGroup.name.wood': 'Woods',
							'itemGroup.name.leaves': 'Leaves',
							'itemGroup.name.sapling': 'Saplings',
							'itemGroup.name.seed': 'Seeds',
							'itemGroup.name.crop': 'Crops',
							'itemGroup.name.grass': 'Ground Cover',
							'itemGroup.name.flower': 'Flowers',
							'itemGroup.name.rawFood': 'Raw Food',
							'itemGroup.name.mushroom': 'Mushrooms',
							'itemGroup.name.monsterStoneEgg': 'Infested Stone',
							'itemGroup.name.mobEgg': 'Mob Eggs',
							'itemGroup.name.coral': 'Coral Blocks',
							'itemGroup.name.coral_decorations':
								'Coral Decorations',
							'itemGroup.name.sculk': 'Sculk',
							'itemGroup.name.netherWartBlock': 'Nether Warts',
						},
					},
					block_materials: {
						alpha_test: 'Allow Transparency (Alpha Test)',
						blend: 'Allow Translucency (Blend)',
						opaque: 'No Transparency (Opaque)',
					},
					block_sounds: {
						stone: 'Stone',
						metal: 'Metal',
						cloth: 'Cloth',
						grass: 'Grass',
						glass: 'Glass',
						wood: 'Wood',
						gravel: 'Gravel',
						sand: 'Sand',
						snow: 'Snow',
						azalea_leaves: 'Leaves',
						amethyst_block: 'Amethyst Block',
						amethyst_cluster: 'Amethyst Cluster',
						ancient_debris: 'Ancient Debris',
						anvil: 'Anvil',
						azalea: 'Azalea',
						bamboo_sapling: 'Bamboo Sapling',
						bamboo: 'Bamboo',
						basalt: 'Basalt',
						big_dripleaf: 'Big Dripleaf',
						bone_block: 'Bone Block',
						calcite: 'Calcite',
						candle: 'Candle',
						cave_vines: 'Cave Vines',
						chain: 'Chain',
						comparator: 'Comparator',
						copper: 'Copper',
						coral: 'Coral',
						deepslate_bricks: 'Deepslate Bricks',
						deepslate: 'Deepslate',
						dirt_with_roots: 'Dirt With Roots',
						dripstone_block: 'Dripstone Block',
						fungus: 'Fungus',
						hanging_roots: 'Hanging Roots',
						honey_block: 'Honey Block',
						itemframe: 'Itemframe',
						ladder: 'Ladder',
						lantern: 'Lantern',
						large_amethyst_bud: 'Large Amethyst Bud',
						medium_amethyst_bud: 'Medium Amethyst Bud',
						moss_block: 'Moss Block',
						moss_carpet: 'Moss Carpet',
						nether_brick: 'Nether Brick',
						nether_gold_ore: 'Nether Gold Ore',
						nether_sprouts: 'Nether Sprouts',
						nether_wart: 'Nether Wart',
						netherite: 'Netherite',
						netherrack: 'Netherrack',
						nylium: 'Nylium',
						pointed_dripstone: 'Pointed Dripstone',
						powder_snow: 'Powder Snow',
						roots: 'Roots',
						scaffolding: 'Scaffolding',
						shroomlight: 'Shroomlight',
						slime: 'Slime',
						small_amethyst_bud: 'Small Amethyst Bud',
						soul_sand: 'Soul Sand',
						soul_soil: 'Soul Soil',
						spore_blossom: 'Spore Blossom',
						stem: 'Stem',
						sweet_berry_bush: 'Sweet Berry Bush',
						tuff: 'Tuff',
						vines: 'Vines',
					},
					preset_search_term: '',
					resource_pack_path: null,
					behavior_pack_path: null,
					existing_packs: [],
					bedrock_installed: !1,
					current_tab_model: '',
					past_preset: !1,
					form: {
						identifier: '',
						display_name: '',
						category: 'construction',
						item_group: 'none',
						preset: 'stone',
						collision: !0,
						mineable: !0,
						destroy_time: 1,
						explodable: !0,
						explosion_resistance: 30,
						breathable: !1,
						friction: 0.4,
						flammable: !1,
						fire_destroy_chance: 20,
						fire_catch_chance: 5,
						use_current_model: !1,
						material: 'alpha_test',
						light_emission: 0,
						light_dampening: 15,
						map_color: '#ffffff',
						sound: 'stone',
						export_mode: isApp ? 'folder' : 'mcaddon',
						pack_name: '',
						pack_authors: '',
						pack_icon: '',
						integrate_pack: null,
					},
				}),
				computed: {
					identifier_error() {
						let e = this.form.identifier
						return e
							? e.match(/^minecraft:/)
								? "Use a different namespace than 'minecraft:'"
								: e.match(/[A-Z]/)
								? 'Identifiers cannot contain capital letters'
								: e.match(/^\d/)
								? 'Identifiers cannot start with a number'
								: e.match(/[^a-z0-9-_.:]/)
								? 'Identifiers cannot contain spaces or special characters'
								: e.match(/\w:\w/)
								? ''
								: 'Identifiers must start with a namespace, separated by a colon'
							: ''
					},
				},
				methods: {
					selectPreset(e) {
						if (
							this.past_preset &&
							!confirm(
								'Are you sure you want to go back and apply this preset? It may override some of the values that you have set.'
							)
						)
							return
						;(this.past_preset = !1), (this.form.preset = e)
						let t = this.presets[e]
						void 0 !== t.collision &&
							(this.form.collision = t.collision),
							void 0 !== t.mineable &&
								(this.form.mineable = t.mineable),
							void 0 !== t.destroy_time &&
								(this.form.destroy_time = t.destroy_time),
							void 0 !== t.explodable &&
								(this.form.explodable = t.explodable),
							void 0 !== t.explosion_resistance &&
								(this.form.explosion_resistance =
									t.explosion_resistance),
							void 0 !== t.breathable &&
								(this.form.breathable = t.breathable),
							void 0 !== t.friction &&
								(this.form.friction = t.friction),
							void 0 !== t.flammable &&
								(this.form.flammable = t.flammable),
							void 0 !== t.fire_destroy_chance &&
								(this.form.fire_destroy_chance =
									t.fire_destroy_chance),
							void 0 !== t.fire_catch_chance &&
								(this.form.fire_catch_chance =
									t.fire_catch_chance),
							void 0 !== t.light_emission &&
								(this.form.light_emission = t.light_emission),
							void 0 !== t.light_dampening &&
								(this.form.light_dampening = t.light_dampening),
							void 0 !== t.material &&
								(this.form.material = t.material),
							void 0 !== t.map_color &&
								(this.form.map_color = t.map_color),
							void 0 !== t.sound && (this.form.sound = t.sound)
					},
					checkPageComplete() {
						let { form: e } = this
						if ('metadata' == this.open_page) {
							if (!e.display_name)
								return (
									Blockbench.showQuickMessage(
										'Please enter a name'
									),
									!1
								)
							if (!e.identifier || this.identifier_error)
								return (
									Blockbench.showQuickMessage(
										'Please enter a correct identifier'
									),
									!1
								)
						} else if ('preset' == this.open_page) {
							if (!e.preset)
								return (
									Blockbench.showQuickMessage(
										'Please select a block preset'
									),
									!1
								)
						} else if ('spawn_egg' == this.open_page);
						else if ('export' == this.open_page) {
							if (
								'integrate' == e.export_mode &&
								!e.integrate_pack
							)
								return (
									Blockbench.showQuickMessage(
										'Please select a behavior pack'
									),
									!1
								)
							if ('integrate' != e.export_mode && !e.pack_name)
								return (
									Blockbench.showQuickMessage(
										'Please enter a pack name'
									),
									!1
								)
							if (
								'integrate' != e.export_mode &&
								e.pack_name.match(/[<>:"/\\|?*]/)
							)
								return (
									Blockbench.showQuickMessage(
										'You cannot use invalid characters in the pack name: ' +
											e.pack_name.match(/[<>:"/\\|?*]/)[0]
									),
									!1
								)
						}
						return !0
					},
					exportPacks() {
						d(this.form).then((e) => {
							;(this.resource_pack_path = e.rp_path),
								(this.behavior_pack_path = e.bp_path),
								'integrate' === this.form.export_mode
									? Blockbench.showQuickMessage(
											'Integrated into Resource and Behavior Pack'
									  )
									: (Blockbench.notification(
											'Export Successful',
											'Exported resource and behavior pack'
									  ),
									  Blockbench.showQuickMessage(
											'Exported Resource and Behavior Pack'
									  ))
						})
					},
					switchPage(e) {
						let t = Object.keys(this.pages)
						if (t.indexOf(e) - t.indexOf(this.open_page) > 0) {
							'preset' == this.open_page &&
								(this.past_preset = !0)
							let i = t.indexOf(this.open_page)
							for (; this.open_page != e; ) {
								if ((i++, !this.checkPageComplete())) return !1
								if (
									('export' == t[i - 1] && this.exportPacks(),
									'export' == t[i] && isApp)
								) {
									let e = m()
									e instanceof Array
										? ((this.bedrock_installed = !0),
										  this.existing_packs.replace(e))
										: this.form.export_mode
								}
								this.open_page = t[i]
							}
						}
						this.open_page = e
					},
					nextPage() {
						let e = Object.keys(this.pages),
							t = e[e.indexOf(this.open_page) + 1]
						if (t) Dialog.open.sidebar.setPage(t)
						else {
							let e = this.form.identifier.replace(/^.+:/, ''),
								t = this.resource_pack_path
							if ('mcaddon' == this.form.export_mode || !isApp) {
								let t = {
									no_file: !0,
									content: JSON.stringify(
										window.BlockWizardProject.model
									),
									path: e + '.geo.json',
								}
								console.log(t, window.BlockWizardProject)
								try {
									loadModelFile(t)
								} catch (e) {}
								return void setTimeout(() => {
									new Texture({ name: e })
										.fromDataURL(
											window.BlockWizardProject.texture
										)
										.add(!1),
										(window.BlockWizardProject.project =
											Project.uuid),
										Cube.all.forEach((e) => {
											e.autouv = 2
										})
								}, 100)
							}
							Blockbench.read(
								[
									PathModule.join(
										t,
										'models',
										'blocks',
										e + '.geo.json'
									),
								],
								{},
								(e) => {
									loadModelFile(e[0]),
										Cube.all.forEach((e) => {
											e.autouv = 2
										})
								}
							)
						}
					},
					previousPage() {
						let e = Object.keys(this.pages),
							t = e[e.indexOf(this.open_page) - 1]
						t && Dialog.open.sidebar.setPage(t)
					},
					inputExplosionResistance(e) {
						this.form.explosion_resistance =
							Math.pow(parseFloat(e.target.value), 24) - 1
						let t = this.form.explosion_resistance < 10 ? 10 : 1
						this.form.explosion_resistance > 20 && (t = 0.5),
							this.form.explosion_resistance > 200 && (t = 0.1),
							this.form.explosion_resistance > 2e3 && (t = 0.01),
							(this.form.explosion_resistance = Math.clamp(
								Math.round(this.form.explosion_resistance * t) /
									t,
								0,
								1e4
							))
					},
					getThumbnail: (e) => `url('${e}')`,
					copySummonCommand() {
						let e = '/setblock ~ ~ ~ ' + this.form.identifier
						Clipbench.setText(e),
							Blockbench.showQuickMessage(
								'Command copied to clipboard'
							)
					},
				},
				mounted() {
					$(this.$refs.map_color).spectrum({
						preferredFormat: 'hex',
						color: this.form.map_color,
						showAlpha: !1,
						showInput: !0,
						move: (e) => {
							this.form.map_color = e.toHexString()
						},
						change: (e) => {
							this.form.map_color = e.toHexString()
						},
					})
				},
			},
			a,
			[
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('section', [
						t('p', { staticClass: 'description' }, [
							this._v('Select a block preset to get started!'),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Mineable'),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Destroy Time'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'The time it takes for the player to mine the block, in seconds. Set to a negative value to make the block indestructible.'
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Destructible by Explosion'),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Explosion Resistance'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'The resistance of the block against explosions, where a value of 0 is like glass, and a value of 30 is like stone.'
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t(
						'ul',
						{ attrs: { id: 'block_explosion_resistance_markers' } },
						[
							t('li', { attrs: { block: 'glass' } }, [
								this._v('Glass'),
							]),
							this._v(' '),
							t('li', { attrs: { block: 'planks' } }, [
								this._v('Planks'),
							]),
							this._v(' '),
							t('li', { attrs: { block: 'stone' } }, [
								this._v('Stone'),
							]),
							this._v(' '),
							t('li', { attrs: { block: 'obsidian' } }, [
								this._v('Obsidian'),
							]),
						]
					)
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Friction'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								"Select the friction of the block. Friction affects an entity's movement speed when walking on the block. Low friction blocks are slippery like ice."
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t(
						'ul',
						{ attrs: { id: 'block_friction_markers' } },
						[
							t('li', [this._v('Like Ice')]),
							this._v(' '),
							t('li', [this._v('Normal')]),
							this._v(' '),
							t('li', [this._v('Like Soul Sand')]),
						]
					)
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Flammable'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v('Whether the block can burn'),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Fire Catch Chance'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								"Chance that this block will catch fire when it's next to fire. Wood has a chance of 5. Higher values increase the chance of catching on fire."
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Fire Destroy Chance'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'Chance that this block will be destroyed when on fire. Wood has a chance of 20. Higher values increase the chance of getting destroyed. If the value is 0, the block will burn forever.'
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Light Emission'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'Set a value to let the block emit light. 15 is the maximum value and is equivalent to glowstone.'
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Light Dampening'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'The amount that light will be dampened when it passes through the block, in a range (0-15). Higher value means the light will be dampened more.'
							),
						]),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('div', [
						t('label', { staticClass: 'required' }, [
							this._v('Map Color'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'The color that this block will be display with on a map item.'
							),
						]),
					])
				},
				function () {
					var e = this,
						t = e.$createElement,
						i = e._self._c || t
					return i('label', [
						i(
							'i',
							{
								staticClass: 'material-icons',
								staticStyle: {
									'vertical-align': 'sub',
									margin: '4px',
								},
							},
							[e._v('info')]
						),
						e._v('You can always re-export the MCAddon via '),
						i('b', [e._v('File')]),
						e._v(' > '),
						i('b', [e._v('Export')]),
						e._v(' > '),
						i('b', [e._v('Export MCAddon')]),
						e._v('.'),
					])
				},
				function () {
					var e = this.$createElement,
						t = this._self._c || e
					return t('section', [
						t('label', [
							this._v(
								'To learn more about creating Minecraft addons, visit the '
							),
							t(
								'a',
								{
									staticClass: 'open-in-browser',
									attrs: {
										href: 'https://learn.microsoft.com/en-us/minecraft/creator/',
										target: 'blank',
										rel: 'noopener',
									},
								},
								[this._v('Minecraft Bedrock Creator Portal')]
							),
							this._v('!'),
						]),
						this._v(' '),
						t('p', { staticClass: 'description' }, [
							this._v(
								'(You can re-open this dialog to return to this page)'
							),
						]),
					])
				},
			],
			!1,
			function (e) {
				var t = i(9)
				t.__inject__ && t.__inject__(e)
			},
			null,
			'18d1aca8'
		)
		f.options.__file = 'src/dialog.vue'
		var N = f.exports,
			v =
				'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iOTgwIgogICBoZWlnaHQ9IjQ2MCIKICAgdmlld0JveD0iMCAwIDI1OS4yOTE2NiAxMjEuNzA4MzQiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzQ0OTEiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMSByMTUzNzEiCiAgIHNvZGlwb2RpOmRvY25hbWU9InN0YXJ0X3NjcmVlbi5zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM0NDg1IiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0iYmFzZSIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp6b29tPSIwLjQ5NDk3NDc1IgogICAgIGlua3NjYXBlOmN4PSI1NTUuMDY1ODUiCiAgICAgaW5rc2NhcGU6Y3k9IjIzLjA4OTk4NiIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICB1bml0cz0icHgiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSI0NTEiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE0NDg4Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0xNzUuMjkxNjUpIj4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDojMDIwMjAyO2ZpbGwtb3BhY2l0eTowLjE4O3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGQ9Im0gMjU5LjI1MTQ0LDIwOS42MDI4NSBjIC01MS4wNDg0OCwwIC0xMjIuMjcxODgsMTcuMzM0NTMgLTE2Ni4xMDQwNzYsMTguMTM2MzQgQyA0OS4zMTUxNjEsMjI4LjU0MSA1LjkxMTYwNDJlLTgsMjIyLjU3MjYgNS45MTE2MDQyZS04LDIyMi41NzI2IEwgLTAuMDU2MzM2OCwyNTAuODIwMDcgLTEuMjA3MTY2MmUtOCwyOTcuMDAyOTMgMjU5LjI5NjIzLDI5Ny4wMDI0MiBaIgogICAgICAgaWQ9InBhdGg1MDU5IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIHNvZGlwb2RpOm5vZGV0eXBlcz0iY3NjY2NjYyIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDojNzU0OTE0O2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjI2NDU4MzMycHg7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGQ9Ik0gLTEuMjA3MTY2MmUtOCwyOTcuMDAyOTMgMC42OTk2NTIzNywyNTQuOTc3ODEgYyAwLDAgMzYuOTA3NDg2NjMsMTkuNjE3OTggODQuNzIzMDA3NjMsMjQuODI0MjYgNjUuOTU2ODQsNy4xODE1NCA5Ni4xMDM3NCwtNS42ODE2OCAxNDEuMzEwMDQsLTMuNjc4NTYgMjAuMTI5MTksMC44OTE5NCAyOS40ODQ1MSwzLjEwODU2IDMyLjYyNDkzLDMuNDQyNjQgbCAtMC4wNjE0LDE3LjQzNjI3IHoiCiAgICAgICBpZD0icGF0aDUwMzgtOSIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjc3NjY2MiIC8+CiAgICA8cGF0aAogICAgICAgc3R5bGU9ImZpbGw6I2EzNzMxZjtmaWxsLW9wYWNpdHk6MC45NDExNzY0NztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMnB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJNIC0xLjIwNzE2NjJlLTgsMjk3LjAwMjkzIC0wLjA1NjMzNjgsMjUwLjgyMDA3IGMgMCwwIDUzLjkxNzk0MTgsMzguOTk4MzcgMTEzLjQ0OTE5NjgsMzcuNDg2NDYgNDguMDgyNjEsLTEuMjIxMTUgNzMuOTg1ODksLTIuMDczMDggOTcuNTQwNzcsMC40NDI4MiAxOC4zMTU3MiwxLjk1NjMgNDguMzYyNiw4LjI1MzA3IDQ4LjM2MjYsOC4yNTMwNyB2IDAgeiIKICAgICAgIGlkPSJwYXRoNTAzOCIKICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjc3NjY2MiIC8+CiAgPC9nPgo8L3N2Zz4K',
			D =
				'data:image/png;base64,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'
		const x = []
		let Q, G
		BBPlugin.register('minecraft_block_wizard', {
			title: 'Minecraft Block Wizard',
			author: 'JannisX11 & Mojang Studios',
			icon: 'fas.fa-hat-wizard',
			description: 'Create custom blocks for Minecraft: Bedrock Edition!',
			tags: ['Minecraft: Bedrock Edition'],
			version: '1.0.1',
			min_version: '4.2.2',
			variant: 'both',
			onload() {
				function e() {
					Vue.nextTick(() => {
						Q.content_vue &&
							((Q.content_vue.current_tab_model = ''),
							Project &&
								'bedrock_block' == Project.format.id &&
								(Q.content_vue.current_tab_model =
									Project.name || 'Block Model'))
					})
				}
				async function t(t) {
					Q.content_vue && Q.content_vue.form.display_name
						? Blockbench.showMessageBox(
								{
									title: 'Block Wizard',
									message: `Do you want to keep editing your current block "${Q.content_vue.form.display_name}", or do you want to start over?`,
									icon: 'delete',
									buttons: ['Continue', 'Start New Block'],
								},
								(t) => {
									1 == t &&
										(Q.sidebar.setPage('metadata'),
										Q.delete(),
										delete Q.object,
										(window.BlockWizardProject = {})),
										Q.show(),
										e()
								}
						  )
						: t
						? G.show()
						: (Q.show(), e())
				}
				;(window.BlockWizardProject = {}),
					(G = new Dialog({
						id: 'minecraft_block_wizard_start',
						title: 'Create a Block!',
						width: 740,
						padding: !1,
						buttons: ['Create a Block!'],
						lines: [
							'<h2>Minecraft Block Wizard</h2>',
							'<p>Create custom blocks and export them as an addon!</p>',
							'<p>Custom blocks allow you to expand your Minecraft world and add new materials and objects</p>',
							'<p>With the block wizard, you can add a new block to your game in just a few simple steps. Once you are done, you will be able to edit the custom model in Blockbench</p>',
							`<img src="${D}" />`,
						],
						onConfirm() {
							setTimeout(() => {
								Q.show(), e()
							}, 10)
						},
					})),
					(Q = new Dialog({
						id: 'minecraft_block_wizard',
						title: 'Minecraft Block Wizard',
						width: 980,
						padding: !1,
						buttons: ['Next', 'dialog.cancel'],
						sidebar: {
							pages: p,
							actions: [
								{
									id: 'documentation',
									name: 'Documentation',
									icon: 'description',
									click() {
										Blockbench.openLink(
											'https://bedrock.dev/docs/stable/Blocks'
										)
									},
								},
							],
							onPageSwitch(e) {
								return this.dialog.content_vue.switchPage(e)
							},
						},
						component: N,
						onBuild(e) {
							let t = Interface.createElement(
								'div',
								{
									id: 'block_wizard_back_button',
									title: 'Go Back',
								},
								Blockbench.getIconNode('arrow_back')
							)
							t.onclick = () => {
								Q.content_vue.previousPage()
							}
							let i = Interface.createElement(
									'div',
									{ class: 'bar_spacer' },
									[
										Interface.createElement(
											'div',
											{ class: 'required_message' },
											' = Required'
										),
									]
								),
								a = e.querySelector('.button_bar')
							a.prepend(i), a.prepend(t)
						},
						onConfirm() {
							return this.content_vue.nextPage(), !1
						},
						onCancel(e) {
							if (e && 'blackout' == e.target.id) return !1
						},
					}))
				let i = new Action('open_minecraft_block_wizard', {
					name: 'Minecraft Block Wizard',
					icon: s,
					click() {
						t(!0)
					},
				})
				MenuBar.menus.filter.addAction(i), x.push(i)
				let a = new Action('block_wizard_export_mcaddon', {
					name: 'Export MCAddon (Block Wizard)',
					icon: s,
					condition: () =>
						Q.content_vue &&
						Q.content_vue.form.display_name &&
						'mcaddon' == Q.content_vue.form.export_mode,
					click() {
						Q.content_vue.exportPacks()
					},
				})
				MenuBar.menus.file.addAction(a, 'export.0'), x.push(a)
				let o = new Setting('block_wizard_target_edition', {
					name: 'Block Wizard: Target Edition',
					description:
						'Export packs into Minecraft Preview instead of regular Bedrock Edition',
					type: 'select',
					value: 'bedrock',
					category: 'export',
					options: {
						bedrock: 'Bedrock Edition',
						preview: 'Bedrock Edition Preview',
					},
					condition: isApp && 'win32' == Blockbench.platform,
				})
				x.push(o)
				let n = new ModelLoader('minecraft_block_wizard', {
					name: 'Minecraft Block Wizard',
					description:
						'Create custom blocks and export them as an addon!',
					icon: s,
					target: 'Minecraft: Bedrock Edition',
					onStart() {
						t(!1)
					},
					format_page: {
						content: [
							{
								type: 'label',
								text: 'Custom blocks allow you to expand your Minecraft world and add new materials and objects.',
							},
							{
								type: 'label',
								text: 'With the block wizard, you can add a new block to your game in just a few simple steps. Once you are done, you will be able to edit the custom model in Blockbench.',
							},
							{ type: 'image', source: D },
						],
						button_text: 'Create a Block!',
					},
				})
				x.push(n)
				let r = Blockbench.addCSS(
					`\n\t\t\t.format_entry[format=minecraft_block_wizard] {\n\t\t\t\tcolor: #ffa41b;\n\t\t\t}\n\t\t\t#start_files .format_entry[format=minecraft_block_wizard]:hover {\n\t\t\t\tcolor: #ffc151;\n\t\t\t}\n\n\n\t\t\t#format_page_minecraft_block_wizard {\n\t\t\t\tbackground-image: url('${v}');\n\t\t\t\tbackground-position: bottom;\n\t\t\t\tbackground-repeat: no-repeat;\n\t\t\t}\n\t\t\t#format_page_minecraft_block_wizard content {\n\t\t\t\tmargin-top: 18px;\n\t\t\t}\n\t\t\t#format_page_minecraft_block_wizard content > label {\n\t\t\t\tmax-width: 454px;\n\t\t\t\tmargin-bottom: 20px;\n\t\t\t\tdisplay: block;\n\t\t\t}\n\t\t\t#format_page_minecraft_block_wizard img {\n\t\t\t\tmargin-top: -244px;\n\t\t\t\tmargin-bottom: -58px;\n\t\t\t\tmargin-left: calc(20% - 130px);\n\t\t\t}\n\t\t\t#format_page_minecraft_block_wizard .button_bar {\n\t\t\t\tjustify-content: right;\n\t\t\t}\n\n\n\t\t\t#minecraft_block_wizard_start > .dialog_wrapper {\n\t\t\t\tbackground-image: url('${v}');\n\t\t\t\tbackground-position: bottom;\n\t\t\t\tbackground-repeat: no-repeat;\n\t\t\t}\n\t\t\t#minecraft_block_wizard_start content {\n\t\t\t\toverflow: initial;\n\t\t\t}\n\t\t\t#minecraft_block_wizard_start content > p {\n\t\t\t\tmax-width: 454px;\n\t\t\t\tmargin-bottom: 20px;\n\t\t\t\tdisplay: block;\n\t\t\t}\n\t\t\t#minecraft_block_wizard_start img {\n\t\t\t\tmargin-top: -244px;\n\t\t\t\tmargin-bottom: -58px;\n\t\t\t\tmargin-left: calc(20% - 130px);\n\t\t\t}\n\t\t\t#minecraft_block_wizard_start .button_bar {\n\t\t\t\ttext-align: center;\n\t\t\t}\n\t\t\t#minecraft_block_wizard_start .button_bar button {\n\t\t\t\twidth: 180px;\n\t\t\t\theight: 40px;\n\t\t\t\tmargin-top: 20px;\n\t\t\t}\n\n\n\t\t\tdialog#minecraft_block_wizard .dialog_sidebar_pages li {\n\t\t\t\tpadding: 8px 20px;\n\t\t\t}\n\t\t\tdialog#minecraft_block_wizard .button_bar {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\t\t\tdialog#minecraft_block_wizard .button_bar .bar_spacer {\n\t\t\t\tflex-grow: 1;\n\t\t\t\ttext-align: left;\n\t\t\t}\n\t\t\tdialog#minecraft_block_wizard .required_message {\n\t\t\t\tpadding-top: 5px;\n\t\t\t\tpadding-left: 16px;\n\t\t\t}\n\t\t\tdialog#minecraft_block_wizard .required_message::before, #block_wizard_wrapper label.required::after {\n\t\t\t\tcontent: "*";\n\t\t\t\tfont-size: 1.2em;\n\t\t\t\tline-height: 0;\n\t\t\t\tvertical-align: inherit;\n\t\t\t\tcolor: var(--color-accent);\n\t\t\t}\n\t\t`
				)
				x.push(r)
			},
			onunload() {
				x.forEach((e) => e.delete())
			},
		})
	},
	function (e, t, i) {
		'use strict'
		i.r(t)
		var a = i(0),
			o = i.n(a),
			n = i(4),
			r = { insert: 'head', singleton: !1 }
		o()(n.a, r), n.a.locals
	},
	function (e, t, i) {
		'use strict'
		i.r(t)
		var a = i(0),
			o = i.n(a),
			n = i(3),
			r = { insert: 'head', singleton: !1 }
		o()(n.a, r), n.a.locals
	},
	function (e, t, i) {
		'use strict'
		i.r(t)
		var a = i(0),
			o = i.n(a),
			n = i(2),
			r = { insert: 'head', singleton: !1 }
		o()(n.a, r), n.a.locals
	},
])
