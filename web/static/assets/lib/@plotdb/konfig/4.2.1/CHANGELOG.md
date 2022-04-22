# Change Logs

## v4.2.1

 - rebuild and remove useless log


## v4.2.0

 - support function as view parameter, with `{root, ctrls, tabs}` as this object.
 - use `{root, ctrls, tabs}` as view context
 - bundler output to standard out.
 - pass changed id and value to `update` and `change` event.
 - support `meta` in widget for re-configuring


## v4.1.0

 - add missing `ldview` lib in boolean widget
 - batch attach widgets
 - add `konfig.merge` API


## v4.0.3

 - remove log in `boolean` widget
 - upgrade `@plotdb/rescope` and `@plotdb/csscope` for running in nodejs


## v4.0.2

 - fix bug: in recursive view, ctx should be defined outside view config to prevent infinite recursive call.


## v4.0.1

 - fix ldpp include path in palette blocks
 - rebuild dist for correct version of lib inclusion


## v4.0.0

 - add `main` field in `package.json`.
 - upgrade modules
 - patch test code to make it work with upgraded modules
 - add `@plotdb/semver` to make things work
 - release with compact directory structure


## v3.0.0

 - upgrade `@plotdb/block` and `@plotdb/rescope` for bug fixing
 - adopt `@xlfont` for font picker
 - upgrade modules
 - adopt `@plotdb/block` v4 syntax
 - add bunlder sample


## v2.0.2

 - upgrade rescope for bug fixing


## v2.0.1

 - replace `konfig.js`, `konfig.min.js` with `index.js` and `index.min.js`


## v2.0.0

 - upgrade block modules


## v1.2.10

 - add `aria-label` in controls with input for accessibility


## v1.2.9

 - rebuild blocks for fixing incorrectly removed code
 - upgrade `@zbryikt/template` for inline script minification bug fixing


## v1.2.8

 - minify inline script and style.
 - mangle and compress minified output.


## v1.2.7

 - lazy init ldpp, and init with vscroll to improve performance
 - update blocks to use minimized version of lib files


## v1.2.6

 - paragraph ctrl remove `inline` class to prevent from conflict of new ldcover feature


## v1.2.5

 - accept string palettes option in in palette ctrl and by default use `all` palettes from all.palettes.js


## v1.2.4

 - add button ctrl


## v1.2.3

 - enable auto direction detection in ldcolorpicker


## v1.2.2

 - support autotab ( use group id as name )


## v1.2.1

 - support default value in boolean ( default false )
 - support default value in color ( default black )
 - support context in colorpicker ( default random )
 - add default palette for colorpicker
 - show warning if use `from` in number ( which should be `default` )
 - in number ctrl, pass `default` as `from` ( and optionally `to` if default is an object ) to ldslider
 - when calling `build`, update only after built, not in between each `prepare-ctrl`.
 - resolve config object for init call. ( based on proxise 0.1.3 )
 - upgrade proxise dependency to 0.1.3


## v1.2.0

 - make all bootstrap config size relative to container font size
 - add config for panel font size to see the relative size effect


## v1.1.0

 - upgrade dependencies.
 - change ldCover to ldcover due to ldcover upgrade.
 - remove unnecessary dependencies and fix ldcover module path.


## v1.0.3

 - upgrade dependencies


## v1.0.2

 - enable debouncing switch


## v1.0.1

 - fix typo
 - add missing attributes in implicit tab object


## v1.0.0

 - rename `config` in view presets to `ctrl` to better align the spec naming 
 - update block dependency to `2.0.5`, which uses new registry syntax ( breaking change ).
 - support customized views
 - add nested (parent) information in tab
 - add recursive config panel example
 - add depth info in tab
 - reorg tab builder code for supporting both list and object type tab metadata.
 - add recurse view
 - update README for recursive view and fix some incorrect information


## v0.0.18

 - fix bug: check parentNode for existence before using it
 - clear also tabobj when force cleaning
 - force clean when rebuild


## v0.0.17

 - tweak `color` config


## v0.0.16

 - upgrade ldpalettepicker and rebuild palette widget ( to 3.1.1 )


## v0.0.15

 - upgrade ldpalettepicker and rebuild palette widget


## v0.0.14

 - popup by default show `config` instead of `...`
 - use ✎ for switch in bootstrap/number


## v0.0.13

 - update for rebuild missed by 0.0.12


## v0.0.12

 - update palette for `ldpalettepicker` 3.0.3


## v0.0.11

 - move util view to class level.
 - update render for actually rendering thing, and separate code from build
 - fix bug in default popup block


## v0.0.10

 - use semantic module naming in dependencies


## v0.0.9

 - by default enabling clusterizejs in palette picker. it will still be enabled only if clusterize.js is available.


## v0.0.8

 - add `render` interface and tweak `itf` and `block` naming in konfig design.
 - remove `data` interface since it's already passed directly into `base` block
 - remove `undefined` in `number` block ldslider initialization
 - prevent translating `undefined` in `base` block
 - support array of names in `base` block event handler
 - update documentation
 - fix bug: don't traverse into non-object in prepare-ctrl / prepare-tab
 - add `view` option for default view handler


## v0.0.7

 - support `palette` and `palettes` in palette directive.
 - upgrade modules for correct work in @plotdb/block


## v0.0.6

 - fix bug: popup.data should not be promise-based.


## v0.0.5

 - bug fix: block name should use `meta.type`, instead of `meta.id`
 - add `path` information in registry error
 - use `...` in `popup` directive for display text, if text is not defined.


## v0.0.4

 - add `popup` directive


## v0.0.3

 - correctly rename all config to konfig


## v0.0.2

 - remove dependencies temporarily ( choosefont.js, xl-fontload )

