konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"base","code":"<div><div class=\"d-flex\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug><style type=\"text/css\">[ld=hint]{margin-left:.5em;width:1.2em;height:1.2em;border-radius:50%;background:rgba(0,0,0,0.1);font-size:10px;line-height:1.1em;text-align:center;cursor:pointer}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"boolean","code":"<div><div plug=\"config\"><div class=\"btn-group w-100\" ld=\"switch\"><div class=\"btn btn-outline-secondary text-success\" ld=\"true\"><i class=\"i-check\"></i></div><div class=\"btn btn-outline-secondary text-danger\" ld=\"false\"><i class=\"i-close\"></i></div></div></div><style type=\"text/css\">.btn-group .btn:hover{background:#fff}.btn-group:not(.on) .btn[ld=true]{color:transparent !important;flex:0 0 auto;background:rgba(0,0,0,0.3)}.btn-group.on .btn[ld=false]{color:transparent !important;flex:0 0 auto;background:rgba(0,0,0,0.3)}.btn{font-size:1em}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"boolean\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"button","code":"<div><div plug=\"config\"><div class=\"btn btn-outline-secondary d-block position-relative\" ld=\"button\">...</div></div><style type=\"text/css\">.btn { font-size: 1em }</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"button\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"choice","code":"<div><div plug=\"config\"><select class=\"form-control\" ld=\"select\"><option ld-each=\"option\"></option></select></div><style type=\"text/css\">.form-control { font-size: 1em }</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"choice\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"color","code":"<div><div plug=\"config\"><div class=\"color\"><input class=\"form-control\" ld=\"color\" aria-label=\"color\"><div ld=\"color\"></div></div></div><style type=\"text/css\">.color{position:relative}div[ld=color]{top:0;bottom:0;width:.66em;right:.33em;margin:auto;position:absolute;height:calc(100% - 0.5em);border-radius:.25em}.form-control{font-size:1em}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"color\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"font","code":"<div><div plug=\"config\"><div class=\"ldcv default-size\" ld=\"ldcv\"><div class=\"base\"><div class=\"inner\"><div class=\"xfc toolbar d-flex flex-column h-100\"><div class=\"xfc-head d-flex px-3 py-2 border-bottom\"><div class=\"mr-2 text-left\"><div class=\"text-muted\" style=\"font-size:12px\" t>Category</div><div class=\"dropdown\"><div class=\"btn btn-sm btn-outline-secondary dropdown-toggle text-capitalize\" ld=\"cur-cat\" style=\"min-width:5em\" data-toggle=\"dropdown\"></div><div class=\"dropdown-menu shadow-sm\" style=\"max-height:50vh;overscroll-behavior:contain;overflow-y:scroll\"><div class=\"dropdown-item text-capitalize\" ld-each=\"category\"></div></div></div></div><div class=\"mr-2 text-left\"><div class=\"text-muted\" style=\"font-size:12px\" t>Subset</div><div class=\"dropdown mr-2\"><div class=\"btn btn-sm btn-outline-secondary dropdown-toggle text-capitalize\" ld=\"cur-subset\" style=\"min-width:5em\" data-toggle=\"dropdown\"></div><div class=\"dropdown-menu shadow-sm\" style=\"max-height:50vh;overscroll-behavior:contain;overflow-y:scroll\"><div class=\"dropdown-item text-capitalize\" ld-each=\"subset\"></div></div></div></div><div class=\"flex-grow-1 text-left\"><div class=\"text-muted\" style=\"font-size:12px\" t>Name</div><input class=\"form-control form-control-sm\" ld=\"search\" placeholder=\"Search...\"></div><div><div class=\"text-muted\" style=\"font-size:12px\">&nbsp;</div><div class=\"btn btn-sm btn-text mx-2\" t>or</div><div class=\"btn btn-sm btn-outline-secondary btn-upload\" ld=\"upload\"><span t>Upload</span> <input type=\"file\"></div></div><div class=\"ml-2\"><div class=\"text-muted\" style=\"font-size:12px\">&nbsp;</div><div class=\"btn btn-sm btn-outline-secondary\" t ld=\"cancel\">Cancel</div></div></div><div class=\"xfc-content flex-grow-1\" style=\"overflow-y:hidden\"><div class=\"h-100\" ld=\"font-list\" style=\"display:grid;grid-template-columns:repeat(auto-fill,250px);grid-gap:1em;justify-content:space-around;overscroll-behavior:contain;overflow-y:scroll\"><div class=\"xfc-font\" ld-each=\"font\"><div class=\"inner\" ld=\"name\"></div></div></div></div></div></div></div></div><div class=\"btn btn-outline-secondary d-block\" ld=\"button\"><span ld=\"font-name\">...</span></div></div><style type=\"text/css\">[ld=button]{position:relative}.btn{font-size:1em}.choosefont .item .img{background-image:url(\"/assets/lib/choosefont.js/main/fontinfo/sprite.min.png\")}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"font\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"number","code":"<div><div plug=\"config\"><input class=\"ldrs auto\" data-class=\"form-control\" ld=\"ldrs\" aria-label=\"number\"></div><div plug=\"ctrl\"><div class=\"clickable\" ld=\"switch\"><i class=\"i-pen\"></i></div></div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"number\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"palette","code":"<div><div ld-scope plug=\"config\"><div class=\"ldp\" ld=\"ldp\"><div class=\"colors\"><div class=\"color\" ld-each=\"color\"></div></div></div><div class=\"ldcv default-size\" ld=\"ldcv\"><div class=\"base\"><div class=\"inner ldpp\"><div class=\"ldpp\" ldpp><div class=\"header\"><div class=\"flex-grow-1 mr-4\"><div class=\"input-group\"><input class=\"form-control\" data-tag=\"search\"><div class=\"input-group-append\"><div class=\"btn btn-outline-dark dropdown-toggle\" data-toggle=\"dropdown\"><span t=\"filter\">&nbsp;</span></div><div class=\"dropdown-menu shadow-sm\" data-tag=\"categories\"><a class=\"dropdown-item\" href=\"#\" data-cat=\"\"><span t=\"all\"></span></a><div class=\"dropdown-divider\"></div><a class=\"dropdown-item\" href=\"#\" data-cat=\"artwork\"><span t=\"artwork\"></span></a><a class=\"dropdown-item\" href=\"#\" data-cat=\"brand\"><span t=\"brand\"></span></a><a class=\"dropdown-item\" href=\"#\" data-cat=\"concept\"><span t=\"concept\"></span></a><div class=\"dropdown-divider\"></div><a class=\"dropdown-item\" href=\"#\" data-cat=\"gradient\"><span t=\"gradient\"></span></a><a class=\"dropdown-item\" href=\"#\" data-cat=\"qualitative\"><span t=\"qualitative\"></span></a><a class=\"dropdown-item\" href=\"#\" data-cat=\"diverging\"><span t=\"diverging\"></span></a><a class=\"dropdown-item\" href=\"#\" data-cat=\"colorbrew\"><span t=\"colorbrew\"></span></a></div></div></div></div><div style=\"white-space:nowrap\"><div class=\"btn btn-primary\" data-panel=\"view\"><span t=\"view\"></span></div><div class=\"btn btn-text\" data-panel=\"mypal\"><span t=\"my pals\"></span></div><div class=\"btn btn-text\" data-panel=\"edit\"><span t=\"edit\"></span></div></div></div><div class=\"panels\"><div class=\"panel active clusterize-scroll\" data-panel=\"view\" style=\"max-height:600px\"><div class=\"inner clusterize-content\"></div></div><div class=\"panel clusterize-scroll\" data-panel=\"mypal\" style=\"max-height:600px\"><div class=\"inner clusterize-content\"></div><div class=\"btn btn-primary btn-block ld-over-inverse btn-load\"><span t=\"load more\"></span><div class=\"ld ldld ldbtn sm\"></div></div></div><div class=\"panel\" data-panel=\"edit\"><div class=\"ldp\"><div class=\"name\"></div><div class=\"colors\"></div></div><div class=\"edit\"><div class=\"inner\"><div class=\"row\"><div class=\"col-sm-6\"><div class=\"ldcolorpicker no-border no-palette\"></div></div><div class=\"col-sm-6\"><div class=\"row mb-2\"><div class=\"col-sm-8\"><select class=\"form-control form-control-local-sm\" value=\"rgb\"><option value=\"rgb\">RGB</option><option value=\"hsl\">HSL</option><option value=\"hcl\">HCL</option></select></div><div class=\"col-sm-4 pl-0\"><input class=\"form-control form-control-local-sm value\" placeholder=\"Hex Value\" data-tag=\"hex\" style=\"margin:0\"></div></div><div class=\"row config active\" data-tag=\"rgb\"><div class=\"col-sm-8\"><div class=\"label-group\"><span>Red</span></div><input class=\"ldrs sm\" data-tag=\"rgb-r\"><div class=\"label-group\"><span>Green</span></div><input class=\"ldrs sm\" data-tag=\"rgb-g\"><div class=\"label-group\"><span>Blue</span></div><input class=\"ldrs sm\" data-tag=\"rgb-b\"></div><div class=\"col-sm-4\"><input class=\"value form-control form-control-local-sm\" data-tag=\"rgb-r\"><input class=\"value form-control form-control-local-sm\" data-tag=\"rgb-g\"><input class=\"value form-control form-control-local-sm\" data-tag=\"rgb-b\"></div></div><div class=\"row config\" data-tag=\"hsl\"><div class=\"col-sm-8\"><div class=\"label-group\"><span>Hue</span></div><input class=\"ldrs sm\" data-tag=\"hsl-h\"><div class=\"label-group\"><span>Saturation</span></div><input class=\"ldrs sm\" data-tag=\"hsl-s\"><div class=\"label-group\"><span>Luminance</span></div><input class=\"ldrs sm\" data-tag=\"hsl-l\"></div><div class=\"col-sm-4\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hsl-h\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hsl-s\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hsl-l\"></div></div><div class=\"row config\" data-tag=\"hcl\"><div class=\"col-sm-8\"><div class=\"label-group\"><span>Hue</span></div><input class=\"ldrs sm\" data-tag=\"hcl-h\"><div class=\"label-group\"><span>Chroma</span></div><input class=\"ldrs sm\" data-tag=\"hcl-c\"><div class=\"label-group\"><span>Luminance</span></div><input class=\"ldrs sm\" data-tag=\"hcl-l\"></div><div class=\"col-sm-4\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hcl-h\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hcl-c\"><input class=\"value form-control form-control-local-sm\" data-tag=\"hcl-l\"></div></div></div></div></div></div><div class=\"foot\"><hr><div class=\"float-right\"><div class=\"btn btn-primary mr-2\" data-action=\"use\"><span t=\"use this palette\"></span></div><div class=\"btn btn-outline-secondary ld-ext-right\" data-action=\"save\"><span t=\"save as asset\"></span><div class=\"ld ldld ldbtn sm\"></div></div></div><div class=\"btn btn-outline-secondary\" data-action=\"undo\"><span t=\"undo\"></span> <i class=\"i-undo\"></i></div></div></div></div></div></div></div></div></div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"palette\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"paragraph","code":"<div><div plug=\"config\"><textarea class=\"form-control\" rows=\"1\" ld=\"input\" aria-label=\"paragraph\"></textarea><div class=\"ldcv\" ld=\"ldcv\"><div class=\"base\" ld=\"panel\"><div class=\"inner\"><div class=\"p-2\"><textarea class=\"form-control\" ld=\"textarea\" rows=\"3\" aria-label=\"paragraph\"></textarea></div><div class=\"px-2 pb-2 text-right\"><div class=\"btn btn-sm btn-outline-secondary\" data-ldcv-set=\"\">Cancel</div><div class=\"btn btn-sm btn-primary ml-2\" data-ldcv-set=\"ok\">OK</div></div></div></div></div></div><style type=\"text/css\">textarea[ld=input]{resize:none}.ldcv{position:absolute}.ldcv:before{background:rgba(0,0,0,0.1)}.ldcv:after{display:none}.ldcv .base{position:absolute}.form-control{font-size:1em}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"paragraph\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"popup","code":"<div><div plug=\"config\"><div class=\"btn btn-outline-secondary d-block position-relative\" ld=\"button\">...</div></div><style type=\"text/css\">.btn { font-size: 1em }</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"popup\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"text","code":"<div><div plug=\"config\"><input class=\"form-control\" ld=\"input\" aria-label=\"text\"></div><style type=\"text/css\">.form-control{font-size:1em}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"text\",dom:\"overwrite\"}}};</script></div>"},{"name":"@plotdb/konfig.widget.bootstrap","version":"master","path":"upload","code":"<div><div plug=\"config\"><div class=\"btn btn-outline-secondary d-block\" ld=\"button\"><span>Upload</span><input type=\"file\" ld=\"input\" aria-label=\"file\"></div></div><style type=\"text/css\">[ld=button]{position:relative}[ld=button] input{cursor:pointer;width:100%;height:100%;position:absolute;opacity:.001;z-index:1;top:0;left:0}::-webkit-file-upload-button{cursor:pointer;height:100%;border:0}.btn{font-size:1em}</style><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"upload\",dom:\"overwrite\"}}};</script></div>"}]);
