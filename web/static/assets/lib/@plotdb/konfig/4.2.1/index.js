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
  this.autotab = opt.autotab || false;
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
  }, function(){
    return this$._val;
  });
  this._updateDebounced = debounce(150, function(n, v){
    return this$._update(n, v);
  });
  this.doDebounce = !(opt.debounce != null) || opt.debounce;
  this.update = function(n, v){
    if (this$.doDebounce) {
      return this$._updateDebounced(n, v);
    } else {
      return this$._update(n, v);
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
    return new ldview(import$({
      ctx: {
        tab: {
          id: null
        }
      }
    }, import$(opt = {}, {
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
    })));
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
      } else if (typeof this.view === 'function') {
        this._view = this.view.apply({
          root: this.root,
          ctrls: this._ctrllist,
          tabs: this._tablist
        });
      } else {
        this._view = this.view;
        this._view.setCtx({
          root: this.root,
          ctrls: this._ctrllist,
          tabs: this._tablist
        });
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
  _update: function(n, v){
    return this.fire('change', this._val, n, v);
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
    }).then(function(){
      return this$._val;
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
        root: root,
        defer: true
      }).then(function(){
        return b['interface']();
      }).then(function(it){
        return ctrl[id].itf = it;
      });
    }).then(function(item){
      var v;
      val[id] = v = item.get();
      return item.on('change', function(it){
        val[id] = it;
        return this$.update(id, it);
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
      return this$._ctrllist.map(function(c){
        return c.block.attach();
      });
    }).then(function(){
      return this$.render();
    }).then(function(){
      return this$.update();
    });
  },
  _buildCtrl: function(clear){
    var promises, traverse, this$ = this;
    clear == null && (clear = false);
    promises = [];
    traverse = function(meta, val, ctrl, pid){
      var ctrls, tab, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      if (!(meta && typeof meta === 'object')) {
        return;
      }
      ctrls = meta.child ? meta.child : meta;
      tab = meta.child ? meta.tab : null;
      if (!tab && this$.autotab && pid) {
        tab = pid;
      }
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
        results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {}), id));
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
    traverse(this._meta, this._val, this._ctrlobj, null);
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
konfig.merge = function(des){
  var objs, res$, i$, to$, _, i;
  des == null && (des = {});
  res$ = [];
  for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  objs = res$;
  _ = function(des, src){
    var ref$, dc, sc, k, v;
    des == null && (des = {});
    src == null && (src = {});
    ref$ = [des.child ? des.child : des, src.child ? src.child : src], dc = ref$[0], sc = ref$[1];
    for (k in sc) {
      v = sc[k];
      if (v.type) {
        if (!dc[k]) {
          dc[k] = src[k];
        } else if (dc[k]) {
          import$(dc[k], src[k]);
        }
      } else {
        dc[k] = _(dc[k], sc[k]);
      }
    }
    return des;
  };
  for (i$ = 0, to$ = objs.length; i$ < to$; ++i$) {
    i = i$;
    des = _(des, JSON.parse(JSON.stringify(objs[i])));
  }
  return des;
};
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
konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig.widget.default","version":"master","path":"base","code":"<div><div class=\"d-flex\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug><style type=\"text/css\">[ld=hint]{margin-left:.5em;width:1.2em;height:1.2em;border-radius:50%;background:rgba(0,0,0,0.1);font-size:10px;line-height:1.1em;text-align:center;cursor:pointer}</style><script type=\"@plotdb/block\">module.exports={pkg:{dependencies:[{name:\"@loadingio/vscroll\",version:\"main\",path:\"index.min.js\"},{name:\"@loadingio/debounce.js\",version:\"main\",path:\"index.min.js\"},{name:\"ldview\",version:\"main\",path:\"index.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.css\"},{name:\"ldloader\",version:\"main\",path:\"index.min.js\"},{name:\"ldloader\",version:\"main\",path:\"index.min.css\",global:true},{name:\"zmgr\",version:\"main\",path:\"index.min.js\"}]},init:function(n){var e,i,t,r,a,o,d,s,u,m,l=this;e=n.root,i=n.context,t=n.data,r=n.pubsub,a=n.t;this.data={};o=i.ldcover,d=i.ldloader,s=i.zmgr;u=new s;o.zmgr(u);d.zmgr(u);r.on(\"init\",function(n){var e;n==null&&(n={});l.itf=e={evtHandler:{},get:n.get||function(){},set:n.set||function(){},meta:n.meta||function(){},render:function(){m.render();if(n.render){return n.render()}},on:function(n,i){var t=this;return(Array.isArray(n)?n:[n]).map(function(n){var e;return((e=t.evtHandler)[n]||(e[n]=[])).push(i)})},fire:function(n){var e,i,t,r,a,o,d,s=[];i=[];for(t=1,r=arguments.length;t<r;++t){i.push(arguments[t])}e=i;for(t=0,o=(a=this.evtHandler[n]||[]).length;t<o;++t){d=a[t];s.push(d.apply(this,e))}return s}};return m.render(\"hint\")});r.on(\"event\",function(n){var e,i,t,r;i=[];for(t=1,r=arguments.length;t<r;++t){i.push(arguments[t])}e=i;return l.itf.fire.apply(l.itf,[n].concat(e))});return m=new ldview({root:e,text:{name:function(){return a(t.name||t.id||\"\")}},handler:{hint:function(n){var e;e=n.node;return e.classList.toggle(\"d-none\",!t.hint)}},action:{click:{hint:function(){return alert(a(t.hint||\"no hint\"))}}}})},interface:function(){return this.itf}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"boolean","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldview\",version:\"main\",path:\"index.min.js\"}]},init:function(t){var e,n,i,a,r,s,o;e=t.root,n=t.context,i=t.pubsub,a=t.data;r=n.ldview;s={state:a[\"default\"]||false};i.fire(\"init\",{get:function(){return s.state},set:function(t){return s.state=!!t}});return o=new r({root:e,action:{click:{switch:function(){s.state=!s.state;o.render(\"switch\");return i.fire(\"event\",\"change\",s.state)}}},handler:{switch:function(t){var e;e=t.node;return e.classList.toggle(\"on\",s.state)}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"button","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var e,n,r,o,a,i,u,d,c;e=t.root,n=t.context,r=t.data,o=t.pubsub,a=t.t;i=n.ldview,u=n.ldcolor;d={data:r[\"default\"]};o.fire(\"init\",{get:function(){return d.data},set:function(t){return d.data=t}});return c=new i({root:e,action:{click:{button:function(){return Promise.resolve(r.cb(d.data)).then(function(t){if(d.data===t){return}return o.fire(\"event\",\"change\",d.data=t)})}}},text:{button:function(){return r.text||\"...\"}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"choice","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(e){var t,n,r,u,i,a,o;t=e.root,n=e.context,r=e.data,u=e.pubsub;i=r;a=n.ldview;u.fire(\"init\",{get:function(){return o.get(\"select\").value},set:function(e){return o.get(\"select\").value=e}});return o=new a({root:t,action:{change:{select:function(e){var t;t=e.node;return u.fire(\"event\",\"change\",t.value)}}},handler:{option:{list:function(){return i.values},key:function(e){return e},init:function(e){var t,n;t=e.node,n=e.data;if(i[\"default\"]===n){return t.setAttribute(\"selected\",\"selected\")}},handler:function(e){var t,n;t=e.node,n=e.data;t.setAttribute(\"value\",n);return t.textContent=n}}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"color","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldcolor\",version:\"main\",path:\"index.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.js\"},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.css\",global:true}]},init:function(e){var t,n,o,l,c,r,i,a,d=this;t=e.root,n=e.context,o=e.pubsub,l=e.data;c=n.ldview,r=n.ldcolor,i=n.ldcolorpicker;o.fire(\"init\",{get:function(){if(d.ldcp){return r.web(d.ldcp.getColor())}},set:function(e){return d.ldcp.set(e)},meta:function(e){d.ldcp.setPalette(e.palette);if(e.idx!=null){return d.ldcp.setIdx(e.idx)}}});this.ldcp=new i(t,{className:\"round shadow-sm round flat compact-palette no-button no-empty-color vertical\",palette:(l[\"default\"]?[l[\"default\"]]:[]).concat(l.palette||[\"#cc0505\",\"#f5b70f\",\"#9bcc31\",\"#089ccc\"]),context:l.context||\"random\",exclusive:l.exclusive!=null?l.exclusive:true});a=new c({ctx:{color:r.web(this.ldcp.getColor())},root:t,handler:{color:function(e){var t,n;t=e.node,n=e.ctx;if(t.nodeName.toLowerCase()===\"input\"){return t.value=n.color}else{return t.style.backgroundColor=n.color}}}});return this.ldcp.on(\"change\",function(e){var t;t=r.web(e);o.fire(\"event\",\"change\",t);a.setCtx({color:t});return a.render()})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"font","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"@xlfont/load\",version:\"main\",path:\"index.min.js\"},{name:\"@xlfont/choose\",version:\"main\",path:\"index.min.js\"},{name:\"@xlfont/choose\",version:\"main\",path:\"index.min.css\",global:true}]},init:function(n){var t,e,o,r,i,u,c,a,d,f;t=n.root,e=n.context,o=n.data,r=n.pubsub;i=e.ldview,u=e.ldcover,c=e.xfc;r.fire(\"init\",{get:function(){return a.font},set:function(n){a.font=n;return f.render(\"button\")}});a={font:null};d=new c({root:t.querySelector(\".ldcv\"),initRender:true,meta:\"https://xlfont.maketext.io/meta\",links:\"https://xlfont.maketext.io/links\"});d.init();d.on(\"choose\",function(n){return a.ldcv.set(n)});return f=new i({root:t,init:{ldcv:function(n){var t;t=n.node;a.ldcv=new u({root:t});return a.ldcv.on(\"toggle.on\",function(){return debounce(50).then(function(){return d.render()})})}},action:{click:{button:function(n){var t;t=n.node;return a.ldcv.get().then(function(n){a.font=n;f.render(\"button\");return r.fire(\"event\",\"change\",n)})}}},text:{button:function(n){var t;t=n.node;if(!a.font){return\"...\"}else{return a.font.name||\"...\"}}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"number","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldslider\",version:\"main\",path:\"index.min.css\"},{name:\"ldslider\",version:\"main\",path:\"index.min.js\"}]},init:function(e){var n,t,r,i,o,l,u,a;n=e.root,t=e.context,r=e.data,i=e.pubsub;o=t.ldview,l=t.ldslider;u={};i.fire(\"init\",{get:function(){return u.ldrs.get()},set:function(e){return u.ldrs.set(e)},render:function(){return u.ldrs.update()}});if(r.from!=null){console.warn(\"[@plotdb/konfig] ctrl should use `default` for default value.\\nplease update your config to comply with it.\")}if(r[\"default\"]!=null){if(typeof r[\"default\"]===\"object\"){import$(r,r[\"default\"])}else if(typeof r[\"default\"]===\"number\"){r.from=r[\"default\"]}}return a=new o({root:n,action:{click:{switch:function(){return u.ldrs.edit()}}},init:{ldrs:function(e){var n;n=e.node;u.ldrs=new l(import$({root:n},Object.fromEntries([\"min\",\"max\",\"step\",\"from\",\"to\",\"exp\",\"limitMax\",\"range\",\"label\"].map(function(e){return[e,r[e]]}).filter(function(e){return e[1]!=null}))));return u.ldrs.on(\"change\",function(e){return i.fire(\"event\",\"change\",e)})}}})}};function import$(e,n){var t={}.hasOwnProperty;for(var r in n)if(t.call(n,r))e[r]=n[r];return e}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"palette","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldcolor\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"index.min.css\"},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.css\"},{name:\"@loadingio/vscroll\",version:\"main\",path:\"index.min.js\"},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.css\"},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldpalettepicker\",version:\"main\",path:\"all.palettes.js\"}]},init:function(e){var n,t,a,i,l,r,o,s,d,p,c;n=e.root,t=e.context,a=e.pubsub,i=e.data,l=e.i18n;r=t.ldview,o=t.ldcolor,s=t.ldpp,d=t.ldcover;p={pal:i.palette||s.defaultPalette};a.fire(\"init\",{get:function(){return p.pal},set:function(e){p.pal=e;return c.render()}});n=ld$.find(n,\"[plug=config]\",0);c=new r({root:n,action:{click:{ldp:function(){var e;if(!p.ldpp){e=Array.isArray(i.palettes)?i.palettes:typeof i.palettes===\"string\"?s.get(i.palettes):s.get(\"all\");p.ldpp=new s({root:c.get(\"ldcv\"),ldcv:true,useClusterizejs:true,i18n:l,palette:i.palette,palettes:e,useVscroll:true})}return p.ldpp.get().then(function(e){if(!e){return}p.pal=e;c.render(\"color\");return a.fire(\"event\",\"change\",p.pal)})}}},handler:{color:{list:function(){var e;return(e=p.pal||(p.pal={})).colors||(e.colors=[])},key:function(e){return o.web(e)},handler:function(e){var n,t;n=e.node,t=e.data;return n.style.backgroundColor=o.web(t)}}}});return c.render()}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"paragraph","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(t){var e,n,r,a,i,o,d,u;e=t.root,n=t.context,r=t.data,a=t.pubsub;i={data:r[\"default\"]||\"\"};o=n.ldview,d=n.ldcover;a.fire(\"init\",{get:function(){return i.data||\"\"},set:function(t){i.data=t||\"\";return u.render()}});return u=new o({root:e,init:{ldcv:function(t){var e;e=t.node;return i.ldcv=new d({root:e})}},handler:{panel:function(t){var e;e=t.node},input:function(t){var e;e=t.node;return e.value=i.data||\"\"},textarea:function(t){var e;e=t.node;return e.value=i.data||\"\"}},action:{click:{input:function(t){var e,n,r;e=t.node;n=u.get(\"input\").getBoundingClientRect();r=u.get(\"panel\").getBoundingClientRect();import$(u.get(\"panel\").style,{width:n.width+\"px\",left:n.left+\"px\",top:n.top+\"px\"});return i.ldcv.get().then(function(t){var e;if(t!==\"ok\"){return}e=u.get(\"textarea\").value;if(i.data!==e){a.fire(\"event\",\"change\",e)}i.data=e;return u.render()})}}}})}};function import$(t,e){var n={}.hasOwnProperty;for(var r in e)if(n.call(e,r))t[r]=e[r];return t}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"popup","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var n,e,r,o,u,i,a,f,p,c,d;n=t.root,e=t.context,r=t.data,o=t.pubsub,u=t.t;i={};a=function(t){var n;if(!t){return null}else if(n=t.data){return n}else{return t}};f=function(t){var n;i.text=(n=t&&t.text)?n:typeof t===\"string\"?t+\"\":u(\"config\");return d.render(\"button\")};p=e.ldview,c=e.ldcolor;o.fire(\"init\",{get:function(){return r.popup.data()},set:function(t){r.popup.data(t);return f(r.popup.data())}});return d=new p({root:n,action:{click:{button:function(){return r.popup.get().then(function(t){o.fire(\"event\",\"change\",a(t));return f(t)})}}},text:{button:function(){var t;if(t=i.text){return t}else{return u(\"config\")}}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"text","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(e){var n,t,u,i,r,a;n=e.root,t=e.context,u=e.data,i=e.pubsub;r=t.ldview;i.fire(\"init\",{get:function(){return a.get(\"input\").value||\"\"},set:function(e){return a.get(\"input\").value=e||\"\"}});return a=new r({root:n,init:{input:function(e){var n;n=e.node;return n.value=u[\"default\"]||\"\"}},action:{input:{input:function(e){var n;n=e.node;return i.fire(\"event\",\"change\",n.value)}},change:{input:function(e){var n;n=e.node;return i.fire(\"event\",\"change\",n.value)}}}})}};</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"upload","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(e){var t,n,i,u,r,o;t=e.root,n=e.context,i=e.data,u=e.pubsub;r=n.ldview;u.fire(\"init\",{get:function(){return o.get(\"input\").value||\"\"},set:function(e){return o.get(\"input\").value=e||\"\"}});return o=new r({root:t,init:{input:function(e){var t;t=e.node;if(i.multiple){return t.setAttribute(\"multiple\",true)}}},action:{change:{input:function(e){var t;t=e.node;return u.fire(\"event\",\"change\",t.files)}}}})}};</script></div>"}]);
})();
