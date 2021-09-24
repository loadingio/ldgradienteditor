(function(){
var konfig;
konfig = function(opt){
  var this$ = this;
  opt == null && (opt = {});
  this.root = typeof opt.root === 'string'
    ? document.querySelector(opt.root)
    : opt.root;
  this.opt = opt;
  this.evtHandler = {};
  this.useBundle = opt.useBundle != null ? opt.useBundle : true;
  this.view = opt.view;
  this._ctrlobj = {};
  this._ctrllist = [];
  this._tabobj = {};
  this._tablist = [];
  this._meta = opt.meta || {};
  this._tab = opt.tab || {};
  this._val = {};
  this.typemap = opt.typemap || null;
  this.mgr = this.mgrChain = new block.manager({
    registry: function(arg$){
      var name, version, path;
      name = arg$.name, version = arg$.version, path = arg$.path;
      throw new Error("@plotdb/konfig: " + name + "@" + version + "/" + path + " is not supported");
    }
  });
  if (opt.manager) {
    this.mgr = opt.manager;
    this.mgr.chain(this.mgrChain);
  }
  this.init = proxise.once(function(){
    return this$._init();
  });
  this._updateDebounced = debounce(150, function(){
    return this$._update();
  });
  this.doDebounce = !(opt.debounce != null) || opt.debounce;
  this.update = function(){
    if (this$.doDebounce) {
      return this$._updateDebounced();
    } else {
      return this$._update();
    }
  };
  return this;
};
konfig.views = {
  simple: function(){
    var this$ = this;
    return new ldview({
      root: this.root,
      initRender: false,
      handler: {
        ctrl: {
          list: function(){
            return this$._ctrllist.filter(function(it){
              return !it.meta.hidden;
            });
          },
          key: function(it){
            return it.key;
          },
          init: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            return node.appendChild(data.root);
          }
        }
      }
    });
  },
  'default': function(){
    var this$ = this;
    return new ldview({
      root: this.root,
      initRender: false,
      handler: {
        tab: {
          list: function(){
            this$._tablist.sort(function(a, b){
              return b.tab.order - a.tab.order;
            });
            return this$._tablist;
          },
          key: function(it){
            return it.key;
          },
          view: {
            text: {
              name: function(arg$){
                var ctx;
                ctx = arg$.ctx;
                return ctx.tab.id;
              }
            },
            handler: {
              ctrl: {
                list: function(arg$){
                  var ctx;
                  ctx = arg$.ctx;
                  return this$._ctrllist.filter(function(it){
                    return it.meta.tab === ctx.tab.id && !it.meta.hidden;
                  });
                },
                key: function(it){
                  return it.key;
                },
                init: function(arg$){
                  var node, data;
                  node = arg$.node, data = arg$.data;
                  return node.appendChild(data.root);
                },
                handler: function(arg$){
                  var node, data;
                  node = arg$.node, data = arg$.data;
                  return data.itf.render();
                }
              }
            }
          }
        }
      }
    });
  },
  recurse: function(){
    var template, opt, this$ = this;
    template = ld$.find(this.root, '[ld=template]', 0);
    template.parentNode.removeChild(template);
    template.removeAttribute('ld-scope');
    return new ldview(import$(opt = {}, {
      ctx: {
        tab: {
          id: null
        }
      },
      template: template,
      root: this.root,
      initRender: false,
      text: {
        name: function(arg$){
          var ctx;
          ctx = arg$.ctx;
          return ctx.tab ? (ctx.tab.name || '') + "" : '';
        }
      },
      handler: {
        tab: {
          list: function(arg$){
            var ctx, tabs;
            ctx = arg$.ctx;
            tabs = this$._tablist.filter(function(it){
              return !(it.tab.parent.id || ctx.tab.id) || (it.tab.parent && ctx.tab && it.tab.parent.id === ctx.tab.id);
            });
            tabs.sort(function(a, b){
              return b.tab.order - a.tab.order;
            });
            return tabs;
          },
          key: function(it){
            return it.key;
          },
          view: opt
        },
        ctrl: {
          list: function(arg$){
            var ctx, ret;
            ctx = arg$.ctx;
            ret = this$._ctrllist.filter(function(it){
              if (!ctx.tab) {
                return false;
              }
              return it.meta.tab === ctx.tab.id && !it.meta.hidden;
            });
            return ret;
          },
          key: function(it){
            return it.key;
          },
          init: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            return node.appendChild(data.root);
          },
          handler: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            node.style.flex = "1 1 " + 16 * (data.meta.weight || 1) + "%";
            return data.itf.render();
          }
        }
      }
    }));
  }
};
konfig.prototype = import$(Object.create(Object.prototype), {
  on: function(n, cb){
    var ref$;
    return ((ref$ = this.evtHandler)[n] || (ref$[n] = [])).push(cb);
  },
  fire: function(n){
    var v, res$, i$, to$, ref$, len$, cb, results$ = [];
    res$ = [];
    for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    v = res$;
    for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {
      cb = ref$[i$];
      results$.push(cb.apply(this, v));
    }
    return results$;
  },
  render: function(){
    if (!this.view) {
      return;
    }
    if (!this._view) {
      if (typeof this.view === 'string') {
        this._view = konfig.views[this.view].apply(this);
      } else {
        this._view = this.view;
      }
    }
    return this._view.render();
  },
  meta: function(arg$){
    var meta, tab;
    meta = arg$.meta, tab = arg$.tab;
    if (meta != null) {
      this._meta = meta;
    }
    if (tab != null) {
      this._tab = tab;
    }
    return this.build(true);
  },
  get: function(){
    return JSON.parse(JSON.stringify(this._val));
  },
  set: function(it){
    this._val = JSON.parse(JSON.stringify(it));
    return this.render();
  },
  _update: function(){
    return this.fire('change', this._val);
  },
  _init: function(){
    var this$ = this;
    return this.mgr.init().then(function(){
      if (this$.useBundle) {
        return konfig.bundle || [];
      } else {
        return [];
      }
    }).then(function(data){
      return this$.mgr.set(data.map(function(d){
        return new block['class']((d.manager = this$.mgr, d));
      }));
    }).then(function(){
      return this$.build();
    });
  },
  _prepareTab: function(tab){
    var ref$, root, d;
    if (this._tabobj[tab.id]) {
      return ref$ = this._tabobj[tab.id], ref$.tab = tab, ref$;
    }
    root = document.createElement('div');
    this._tablist.push(d = {
      root: root,
      tab: tab,
      key: Math.random().toString(36).substring(2)
    });
    return this._tabobj[tab.id] = d;
  },
  _prepareCtrl: function(meta, val, ctrl){
    var id, ref$, name, version, path, ret, this$ = this;
    id = meta.id;
    if (ctrl[id]) {
      return Promise.resolve();
    }
    if (meta.block) {
      ref$ = {
        name: (ref$ = meta.block).name,
        version: ref$.version,
        path: ref$.path
      }, name = ref$.name, version = ref$.version, path = ref$.path;
    } else if (this.typemap && (ret = this.typemap(meta.type))) {
      name = ret.name, version = ret.version, path = ret.path;
    } else {
      ref$ = [meta.type, "master", ''], name = ref$[0], version = ref$[1], path = ref$[2];
    }
    return this.mgr.get({
      name: name,
      version: version,
      path: path
    }).then(function(it){
      return it.create({
        data: meta
      });
    }).then(function(b){
      var root;
      root = document.createElement('div');
      if (!(meta.tab != null)) {
        meta.tab = 'default';
      }
      if (!this$._tabobj[meta.tab]) {
        this$._prepareTab({
          id: meta.tab,
          name: meta.tab,
          depth: 0,
          parent: {}
        });
      }
      this$._ctrllist.push(ctrl[id] = {
        block: b,
        meta: meta,
        root: root,
        key: Math.random().toString(36).substring(2)
      });
      return b.attach({
        root: root
      }).then(function(){
        return b['interface']();
      }).then(function(it){
        return ctrl[id].itf = it;
      });
    }).then(function(item){
      var v;
      val[id] = v = item.get();
      this$.update();
      return item.on('change', function(it){
        val[id] = it;
        return this$.update();
      });
    }).then(function(){
      return ctrl[id];
    });
  },
  build: function(clear){
    var this$ = this;
    clear == null && (clear = false);
    this._buildTab(clear);
    return this._buildCtrl(clear).then(function(){
      return this$.render();
    });
  },
  _buildCtrl: function(clear){
    var promises, traverse, this$ = this;
    clear == null && (clear = false);
    promises = [];
    traverse = function(meta, val, ctrl){
      var ctrls, tab, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      if (!(meta && typeof meta === 'object')) {
        return;
      }
      ctrls = meta.child ? meta.child : meta;
      tab = meta.child ? meta.tab : null;
      if (!ctrls) {
        return;
      }
      for (id in ctrls) {
        v = ctrls[id];
        if (v.type) {
          import$((v.id = id, v), tab && !v.tab
            ? {
              tab: tab
            }
            : {});
          promises.push(this$._prepareCtrl(v, val, ctrl));
          continue;
        }
        results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {})));
      }
      return results$;
    };
    if (clear && this._ctrllist) {
      this._ctrllist.map(function(arg$){
        var block, root;
        block = arg$.block, root = arg$.root;
        if (block.destroy) {
          block.destroy();
        }
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    if (clear || !this._val) {
      this._val = {};
    }
    if (clear || !this._ctrlobj) {
      this._ctrlobj = {};
    }
    if (clear || !this._ctrllist) {
      this._ctrllist = [];
    }
    traverse(this._meta, this._val, this._ctrlobj);
    return Promise.all(promises);
  },
  _buildTab: function(clear){
    var traverse, this$ = this;
    clear == null && (clear = false);
    if (this.renderMode === 'ctrl') {
      return;
    }
    if (clear && this._tablist) {
      this._tablist.map(function(arg$){
        var root;
        root = arg$.root;
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    if (clear || !this._tablist) {
      this._tablist = [];
    }
    if (clear || !this._tab) {
      this._tab = {};
    }
    if (clear) {
      this._tabobj = {};
    }
    traverse = function(tab, depth, parent){
      var list, id, v, i$, to$, order, item, results$ = [];
      depth == null && (depth = 0);
      parent == null && (parent = {});
      if (!(tab && (Array.isArray(tab) || typeof tab === 'object'))) {
        return;
      }
      list = Array.isArray(tab)
        ? tab
        : (function(){
          var ref$, results$ = [];
          for (id in ref$ = tab) {
            v = ref$[id];
            results$.push({
              id: id,
              v: v
            });
          }
          return results$;
        }()).map(function(arg$, i){
          var id, v;
          id = arg$.id, v = arg$.v;
          return v.id = id, v;
        });
      for (i$ = 0, to$ = list.length; i$ < to$; ++i$) {
        order = i$;
        item = list[order];
        import$((item.depth = depth, item.parent = parent, item), !v.name
          ? {
            name: item.id
          }
          : {});
        import$(item, !(v.order != null)
          ? {
            order: order
          }
          : {});
        this$._prepareTab(item);
        results$.push(traverse(item.child, (item.depth || 0) + 1, item));
      }
      return results$;
    };
    return traverse(this._tab);
  }
});
if (typeof module != 'undefined' && module !== null) {
  module.exports = konfig;
} else if (typeof window != 'undefined' && window !== null) {
  window.konfig = konfig;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig.widget.default","version":"master","path":"base","code":"<div><div class=\"d-flex\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug><style type=\"text/css\">[ld=hint] {\n  margin-left: 0.5em;\n  width: 1.2em;\n  height: 1.2em;\n  border-radius: 50%;\n  background: rgba(0,0,0,0.1);\n  font-size: 10px;\n  line-height: 1.1em;\n  text-align: center;\n  cursor: pointer;\n}\n</style><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      dependencies: [\n        {\n          name: \"ldview\",\n          version: \"main\",\n          path: \"index.js\"\n        }, {\n          name: \"@loadingio/debounce.js\",\n          version: \"main\",\n          path: \"debounce.min.js\"\n        }, {\n          name: \"ldcover\",\n          version: \"main\",\n          path: \"ldcv.min.js\"\n        }, {\n          name: \"ldcover\",\n          version: \"main\",\n          path: \"ldcv.min.css\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, t, view, this$ = this;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub, t = arg$.t;\n      this.data = {};\n      pubsub.on('init', function(opt){\n        var itf;\n        opt == null && (opt = {});\n        this$.itf = itf = {\n          evtHandler: {},\n          get: opt.get || function(){},\n          set: opt.set || function(){},\n          render: function(){\n            view.render();\n            if (opt.render) {\n              return opt.render();\n            }\n          },\n          on: function(n, cb){\n            var this$ = this;\n            return (Array.isArray(n)\n              ? n\n              : [n]).map(function(n){\n              var ref$;\n              return ((ref$ = this$.evtHandler)[n] || (ref$[n] = [])).push(cb);\n            });\n          },\n          fire: function(n){\n            var v, res$, i$, to$, ref$, len$, cb, results$ = [];\n            res$ = [];\n            for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {\n              res$.push(arguments[i$]);\n            }\n            v = res$;\n            for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {\n              cb = ref$[i$];\n              results$.push(cb.apply(this, v));\n            }\n            return results$;\n          }\n        };\n        return view.render('hint');\n      });\n      pubsub.on('event', function(n){\n        var v, res$, i$, to$;\n        res$ = [];\n        for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {\n          res$.push(arguments[i$]);\n        }\n        v = res$;\n        return this$.itf.fire.apply(this$.itf, [n].concat(v));\n      });\n      return view = new ldview({\n        root: root,\n        text: {\n          name: function(){\n            return t(data.name || data.id || '');\n          }\n        },\n        handler: {\n          hint: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.classList.toggle('d-none', !data.hint);\n          }\n        },\n        action: {\n          click: {\n            hint: function(){\n              return alert(t(data.hint || 'no hint'));\n            }\n          }\n        }\n      });\n    },\n    'interface': function(){\n      return this.itf;\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"boolean","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, pubsub, ldview, obj, view;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      obj = {\n        state: false\n      };\n      pubsub.fire('init', {\n        get: function(){\n          return obj.state;\n        },\n        set: function(it){\n          return obj.state = !!it;\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          click: {\n            'switch': function(){\n              obj.state = !obj.state;\n              view.render('switch');\n              return pubsub.fire('event', 'change', obj.state);\n            }\n          }\n        },\n        handler: {\n          'switch': function(arg$){\n            var node;\n            node = arg$.node;\n            return node.classList.toggle('on', obj.state);\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"choice","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, cfg, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      cfg = data;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('select').value;\n        },\n        set: function(it){\n          return view.get('select').value = it;\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          change: {\n            select: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          }\n        },\n        handler: {\n          option: {\n            list: function(){\n              return cfg.values;\n            },\n            key: function(it){\n              return it;\n            },\n            init: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              if (cfg['default'] === data) {\n                return node.setAttribute('selected', 'selected');\n              }\n            },\n            handler: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              node.setAttribute('value', data);\n              return node.textContent = data;\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"color","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          name: \"ldcolor\",\n          version: \"main\",\n          path: \"ldcolor.min.js\",\n          async: false\n        }, {\n          name: \"@loadingio/ldcolorpicker\",\n          version: \"main\",\n          path: \"ldcp.min.js\"\n        }, {\n          name: \"@loadingio/ldcolorpicker\",\n          version: \"main\",\n          path: \"ldcp.min.css\",\n          global: true\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, pubsub, ldview, ldcolor, ldcolorpicker, view, this$ = this;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldcolor = context.ldcolor, ldcolorpicker = context.ldcolorpicker;\n      pubsub.fire('init', {\n        get: function(){\n          if (this$.ldcp) {\n            return ldcolor.web(this$.ldcp.getColor());\n          }\n        },\n        set: function(it){\n          return this$.ldcp.set(it);\n        }\n      });\n      this.ldcp = new ldcolorpicker(root, {\n        className: \"round shadow-sm round flat compact-palette no-button no-empty-color\"\n      });\n      view = new ldview({\n        ctx: {\n          color: ldcolor.web(this.ldcp.getColor())\n        },\n        root: root,\n        handler: {\n          color: function(arg$){\n            var node, ctx;\n            node = arg$.node, ctx = arg$.ctx;\n            if (node.nodeName.toLowerCase() === 'input') {\n              return node.value = ctx.color;\n            } else {\n              return node.style.backgroundColor = ctx.color;\n            }\n          }\n        }\n      });\n      return this.ldcp.on('change', function(it){\n        var color;\n        color = ldcolor.web(it);\n        pubsub.fire('event', 'change', color);\n        view.setCtx({\n          color: color\n        });\n        return view.render();\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"font","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          name: \"@plotdb/choose\",\n          version: \"main\",\n          path: \"index.min.js\"\n        }, {\n          name: \"@plotdb/choose\",\n          version: \"main\",\n          path: \"index.min.css\",\n          global: true\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, ldcover, ChooseFont, obj, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldcover = context.ldcover, ChooseFont = context.ChooseFont;\n      obj = {\n        font: {}\n      };\n      pubsub.fire('init', {\n        get: function(){\n          return obj.font;\n        },\n        set: function(it){\n          return obj.fontview.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            return obj.ldcv = new ldCover({\n              root: node\n            });\n          },\n          inner: function(arg$){\n            var node;\n            node = arg$.node;\n            obj.cf = new ChooseFont({\n              root: node,\n              metaUrl: '/assets/lib/choosefont.js/main/fontinfo/meta.json',\n              base: 'https://plotdb.github.io/xl-fontset/alpha'\n            });\n            return obj.cf.init().then(function(){\n              return obj.cf.on('choose', function(it){\n                return obj.ldcv.set(it);\n              });\n            });\n          }\n        },\n        action: {\n          click: {\n            button: function(){\n              return obj.ldcv.get().then(function(it){\n                if (!it) {\n                  return;\n                }\n                return obj.font = it;\n              });\n            }\n          }\n        },\n        text: {\n          \"font-name\": function(){\n            return obj.font.name || 'Font';\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"number","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          name: \"ldslider\",\n          version: \"main\",\n          path: \"ldrs.css\"\n        }, {\n          name: \"ldslider\",\n          version: \"main\",\n          path: \"ldrs.js\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, ldslider, obj, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldslider = context.ldslider;\n      obj = {};\n      pubsub.fire('init', {\n        get: function(){\n          return obj.ldrs.get();\n        },\n        set: function(it){\n          return obj.ldrs.set(it);\n        },\n        render: function(){\n          return obj.ldrs.update();\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          click: {\n            'switch': function(){\n              return obj.ldrs.edit();\n            }\n          }\n        },\n        init: {\n          ldrs: function(arg$){\n            var node;\n            node = arg$.node;\n            obj.ldrs = new ldslider(import$({\n              root: node\n            }, Object.fromEntries(['min', 'max', 'step', 'from', 'to', 'exp', 'limitMax', 'range', 'label'].map(function(it){\n              return [it, data[it]];\n            }).filter(function(it){\n              return it[1] != null;\n            }))));\n            return obj.ldrs.on('change', function(it){\n              return pubsub.fire('event', 'change', it);\n            });\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});\nfunction import$(obj, src){\n  var own = {}.hasOwnProperty;\n  for (var key in src) if (own.call(src, key)) obj[key] = src[key];\n  return obj;\n}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"palette","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          name: \"ldcolor\",\n          version: \"main\",\n          path: \"ldcolor.min.js\",\n          async: false\n        }, {\n          name: \"ldslider\",\n          version: \"main\",\n          path: \"ldrs.min.js\",\n          async: false\n        }, {\n          name: \"ldslider\",\n          version: \"main\",\n          path: \"ldrs.min.css\"\n        }, {\n          name: \"@loadingio/ldcolorpicker\",\n          version: \"main\",\n          path: \"ldcp.min.js\",\n          async: false\n        }, {\n          name: \"@loadingio/ldcolorpicker\",\n          version: \"main\",\n          path: \"ldcp.min.css\"\n        }, {\n          name: \"ldpalettepicker\",\n          version: \"main\",\n          path: \"index.min.js\"\n        }, {\n          name: \"ldpalettepicker\",\n          version: \"main\",\n          path: \"index.min.css\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, pubsub, data, i18n, ldview, ldcolor, ldpp, ldcover, obj, view;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub, data = arg$.data, i18n = arg$.i18n;\n      ldview = context.ldview, ldcolor = context.ldcolor, ldpp = context.ldpp, ldcover = context.ldcover;\n      obj = {\n        pal: null\n      };\n      pubsub.fire('init', {\n        get: function(){\n          return obj.pal;\n        },\n        set: function(it){\n          obj.pal = it;\n          return view.render();\n        }\n      });\n      root = ld$.find(root, '[plug=config]', 0);\n      view = new ldview({\n        root: root,\n        action: {\n          click: {\n            ldp: function(){\n              return obj.ldpp.get().then(function(it){\n                if (!it) {\n                  return;\n                }\n                obj.pal = it;\n                view.render('color');\n                return pubsub.fire('event', 'change', obj.pal);\n              });\n            }\n          }\n        },\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            obj.ldpp = new ldpp({\n              root: node,\n              ldcv: true,\n              useClusterizejs: true,\n              i18n: i18n,\n              palette: data.palette,\n              palettes: data.palettes\n            });\n            return obj.pal = obj.ldpp.ldpe.getPal();\n          }\n        },\n        handler: {\n          color: {\n            list: function(){\n              var ref$;\n              return (ref$ = obj.pal || (obj.pal = {})).colors || (ref$.colors = []);\n            },\n            key: function(it){\n              return ldcolor.web(it);\n            },\n            handler: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              return node.style.backgroundColor = ldcolor.web(data);\n            }\n          }\n        }\n      });\n      return view.render();\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"paragraph","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, obj, ldview, ldCover, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      obj = {\n        data: data['default'] || ''\n      };\n      ldview = context.ldview, ldCover = context.ldCover;\n      pubsub.fire('init', {\n        get: function(){\n          return obj.data || '';\n        },\n        set: function(it){\n          obj.data = it || '';\n          return view.render();\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            return obj.ldcv = new ldCover({\n              root: node\n            });\n          }\n        },\n        handler: {\n          panel: function(arg$){\n            var node;\n            node = arg$.node;\n          },\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = obj.data || '';\n          },\n          textarea: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = obj.data || '';\n          }\n        },\n        action: {\n          click: {\n            input: function(arg$){\n              var node, ibox, pbox;\n              node = arg$.node;\n              ibox = view.get('input').getBoundingClientRect();\n              pbox = view.get('panel').getBoundingClientRect();\n              import$(view.get('panel').style, {\n                width: ibox.width + \"px\",\n                left: ibox.left + \"px\",\n                top: ibox.top + \"px\"\n              });\n              return obj.ldcv.get().then(function(it){\n                var value;\n                if (it !== 'ok') {\n                  return;\n                }\n                value = view.get('textarea').value;\n                if (obj.data !== value) {\n                  pubsub.fire('event', 'change', value);\n                }\n                obj.data = value;\n                return view.render();\n              });\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});\nfunction import$(obj, src){\n  var own = {}.hasOwnProperty;\n  for (var key in src) if (own.call(src, key)) obj[key] = src[key];\n  return obj;\n}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"popup","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [],\n      i18n: {\n        \"zh-TW\": {\n          \"config\": \"設定\"\n        }\n      }\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, t, local, getData, setText, ldview, ldcolor, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub, t = arg$.t;\n      local = {};\n      getData = function(it){\n        var that;\n        if (!it) {\n          return null;\n        } else if (that = it.data) {\n          return that;\n        } else {\n          return it;\n        }\n      };\n      setText = function(it){\n        var that;\n        local.text = (that = it && it.text)\n          ? that\n          : typeof it === 'string'\n            ? it + \"\"\n            : t('config');\n        return view.render('button');\n      };\n      ldview = context.ldview, ldcolor = context.ldcolor;\n      pubsub.fire('init', {\n        get: function(){\n          return data.popup.data();\n        },\n        set: function(it){\n          data.popup.data(it);\n          return setText(data.popup.data());\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          click: {\n            button: function(){\n              return data.popup.get().then(function(it){\n                pubsub.fire('event', 'change', getData(it));\n                return setText(it);\n              });\n            }\n          }\n        },\n        text: {\n          button: function(){\n            var that;\n            if (that = local.text) {\n              return that;\n            } else {\n              return t(\"config\");\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"text","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('input').value || '';\n        },\n        set: function(it){\n          return view.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = data['default'] || '';\n          }\n        },\n        action: {\n          input: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          },\n          change: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"upload","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('input').value || '';\n        },\n        set: function(it){\n          return view.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            if (data.multiple) {\n              return node.setAttribute('multiple', true);\n            }\n          }\n        },\n        action: {\n          change: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.files);\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"}]);
})();
