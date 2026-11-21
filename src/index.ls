(->
  CENS = (n) -> document.createElementNS "http://www.w3.org/2000/svg", n
  SA = (n, o) -> for k,v of o => n.setAttribute k, v
  QS = (n, s) -> n.querySelector s
  QSA = (n, s) -> Array.from n.querySelectorAll s
  C = -> window.ldcolor or window.ldColor
  action-of = (t) -> if t and t.closest and (n = t.closest '[data-action]') => n.getAttribute(\data-action) else null
  hex = (c) -> C!.hex c

  # 顏色一律存成 {hex, offset}. 輸入可以是色碼字串、ldcolor 物件或 {hex, offset}
  norm = (list = []) ->
    n = list.length
    list.map (d, i) ->
      src = if typeof(d) == \string => d else if d.hex => d.hex else {} <<< d
      hex: hex(src), offset: if d.offset? => +d.offset else if n > 1 => i / (n - 1) else 0
  sorted = (cs) -> cs.slice!sort (a, b) -> a.offset - b.offset
  # 兩端 ( offset 最小 / 最大 ) 的 index; 兩端不能刪
  ends = (cs) ->
    [lo, hi] = [0, 0]
    for c,i in cs
      if c.offset < cs[lo].offset => lo = i
      if c.offset >= cs[hi].offset => hi = i
    [lo, hi]
  can-del = (cs, i) -> cs.length > 2 and !(i in ends(cs))
  # 某個位置上的內插色
  color-at = (cs, o) ->
    s = sorted cs
    if o <= s.0.offset => return s.0.hex
    if o >= s[* - 1].offset => return s[* - 1].hex
    for i from 1 til s.length => if o <= s[i].offset =>
      [a, b] = [s[i - 1], s[i]]
      t = if b.offset == a.offset => 0 else (o - a.offset) / (b.offset - a.offset)
      [ca, cb] = [C!.rgb(a.hex), C!.rgb(b.hex)]
      mix = (k) -> Math.round(ca[k] + (cb[k] - ca[k]) * t)
      return hex {r: mix(\r), g: mix(\g), b: mix(\b), a: 1}
    s[* - 1].hex
  is-light = (cs) -> (cs.map(-> C!.hcl(it.hex).l).reduce(((a, b) -> a + b), 0) / cs.length) > 75
  # dir: 漸層方向 ( 0 = 由左到右, 順時針 ), 等於 CSS 角度 - 90
  css-angle = (dir) -> ((Math.round(dir) + 90) % 360 + 360) % 360
  # w x h 的框內, 跟 CSS linear-gradient 一樣長度的漸層線
  line = (dir, w = 100, h = 100) ->
    a = css-angle(dir) * Math.PI / 180
    [sx, cy] = [Math.sin(a), Math.cos(a)]
    l = Math.abs(w * sx) + Math.abs(h * cy)
    f = -> Math.round(it * 1000) / 1000
    x1: f(w / 2 - sx * l / 2), y1: f(h / 2 + cy * l / 2), x2: f(w / 2 + sx * l / 2), y2: f(h / 2 - cy * l / 2)
  pct = -> Math.round(it * 1000) / 10

  to-css = ({dir, colors}) ->
    "linear-gradient(#{css-angle dir}deg, #{sorted(colors).map(-> "#{it.hex} #{pct it.offset}%").join(', ')})"
  to-svg = ({dir, colors}, o = {}) ->
    [w, h, id] = [o.width or 100, o.height or 100, o.id or \gradient]
    p = line dir, w, h
    stops = sorted(colors).map(-> """<stop offset="#{Math.round(it.offset * 10000) / 10000}" stop-color="#{it.hex}"/>""").join('')
    """<svg xmlns="http://www.w3.org/2000/svg" width="#w" height="#h" viewBox="0 0 #w #h"><defs><linearGradient id="#id" gradientUnits="userSpaceOnUse" x1="#{p.x1}" y1="#{p.y1}" x2="#{p.x2}" y2="#{p.y2}">#stops</linearGradient></defs><rect width="#w" height="#h" fill="url(\##id)"/></svg>"""

  # 小事件系統
  evts = ->
    it.on = (n, cb) -> (@_evt[n] or (@_evt[n] = [])).push cb; @
    it.fire = (n, ...args) -> (@_evt[n] or []).map ~> it.apply @, args
    it

  # 全頁共用一個 ldcolorpicker; client 要有 set-color 與 lock
  picker = do
    cp: null, client: null, setting: false
    get: ->
      if @cp => return @cp
      if !(P = window.ldcolorpicker or window.ldColorPicker) => return null
      # 上 / 下由 open 自己決定 ( ldcolorpicker 的 vertical 是優先放下面 )
      @cp = new P null, {className: 'no-palette flat no-alpha', exclusive: true}
      @cp.on \change, (c) ~> if !@setting and @client => @client.set-color hex(c), true
      @cp.on \toggle, (v) ~>
        @opened = v
        if !v and (c = @client) => @client = null; c.lock false
      # ldcolorpicker 只在有 toggler 時才處理 Esc; 這裡自己收, 開著時只關 picker ( capture, 不讓外層的對話框也跟著關 )
      window.addEventListener \keydown, ((e) ~>
        if !@opened or e.key != \Escape => return
        e.stopImmediatePropagation!
        e.preventDefault!
        @cp.toggle false
      ), true
      @cp
    # node: 對齊的元素 ( 漸層本身 ); 上緣放得下就放上面, 不然放下緣
    open: (client, color, node) ->
      if !(cp = @get!) => return
      if @client and @client != client => @client.lock false
      @client = client
      client.lock true
      @setting = true
      cp.set-color C!.hsl(color)
      @setting = false
      setTimeout (~>
        h = @h or 240
        cp.root.classList.toggle \top, node.getBoundingClientRect!top - h - 10 >= 0
        cp.toggle true, node
        if cp.root.offsetHeight => @h = cp.root.offsetHeight
      ), 0
    close: -> if @cp and @client => @cp.toggle false

  # ---------- 圓形編輯器 ----------
  # 中間是轉盤 ( 拖動改方向 ), 下方弧線上的點是顏色 ( 拖動改位置 ); 滑過時展開
  # opt: root, colors, dir, id, pinned ( 一直展開, 不隨滑鼠收合 )
  window.GradientEditor = GradientEditor = (opt = {}) ->
    @root = root = if typeof(opt.root) == \string => QS(document, opt.root) else opt.root
    root.classList.add \ldgradient
    if opt.pinned => root.classList.add \pinned
    @ <<< do
      opt: opt
      _evt: {}
      name: opt.name or null
      id: opt.id or "ldg-#{Math.random!toString 36 .substring 2}"
      dir: +(opt.dir or 0)
      idx: 0
      state: {drag: false, slider: false, knob: false, active: false, hover: false}
    if !opt.colors or opt.colors.length < 2 =>
      opt.colors = QSA(root, 'g.ldg-colors circle').map(-> it.getAttribute \fill)
    if opt.colors.length < 2 => opt.colors = <[#eeeeee #dddddd]>
    @colors = norm opt.colors

    @build!
    @el = do
      bar: QS(root, \.ldg-bar)
      colors: QS(root, \.ldg-colors)
      disc: QS(root, \.ldg-disc)
      knob: QS(root, \.ldg-knob)
      gradient: QS(root, \linearGradient)
      hex: QS(root, \.ldg-hex)
      swatch: QS(root, \.ldg-swatch)
      percent: QS(root, \.ldg-percent)
      del: QS(root, '.ldg-btn[data-action=del]')
    @build-dots!
    @update-gradient!
    @set-idx 0, false
    if opt.pinned => @toggle true

    # 指標相對圓心的角度: 0 = 正上方, 順時針為正
    angle = (e) ~>
      b = @el.disc.getBoundingClientRect!
      Math.atan2(e.clientX - (b.left + b.width / 2), -(e.clientY - (b.top + b.height / 2))) * 180 / Math.PI
    up = (e) ~>
      document.removeEventListener \pointermove, move
      document.removeEventListener \pointerup, up
      document.removeEventListener \pointercancel, up
      @state.knob = false
      if @dot =>
        @dot = null
        if !@state.hover and !@opt.pinned => @debounce = setTimeout (~> @toggle false), 300
    move = (e) ~>
      if @state.knob =>
        if isNaN(a = angle e) => return
        @dir = (Math.round(@knob.dir + a - @knob.a) % 360 + 360) % 360
        if @dir != @knob.dir => @knob.moved = true
        @update-gradient!
        return @fire \change, @get!
      if !@dot => return
      @state.drag = true
      r = angle(e) - 180
      if r < -180 => r += 360
      r = Math.max(-60, Math.min(60, r))
      @colors[@idx].offset = (60 - r) / 120
      @dot.style.transform = "rotate(#{r}deg)"
      @update-gradient!
      @update-info!
      @fire \change, @get!

    root.addEventListener \mouseover, (e) ~>
      @state.hover = true
      if !@state.active => @toggle true
    root.addEventListener \mouseout, (e) ~>
      if e.relatedTarget and root.contains(e.relatedTarget) => return
      @state.hover = false
      if !@dot and !@locked and !@opt.pinned => @debounce = setTimeout (~> @toggle false), 300
    root.addEventListener \pointerdown, (e) ~>
      if e.button and e.button != 0 => return
      if action-of(e.target) => return
      if (g = e.target.closest('.ldg-colors > g')) =>
        if !@state.active => @toggle true
        @dot = g
        @state.drag = false
        @set-idx +g.getAttribute(\data-idx)
      else if e.target.closest('.ldg-board') =>
        @state.knob = true
        @knob = {a: angle(e), dir: @dir, moved: false}
      else return
      e.preventDefault!
      document.addEventListener \pointermove, move
      document.addEventListener \pointerup, up
      document.addEventListener \pointercancel, up
    root.addEventListener \click, (e) ~>
      act = action-of e.target
      # 點在圓上但沒轉動、也沒點到按鈕或色點: 發 tap ( 頁面可以拿來當「套用」 )
      if !act and !e.target.closest('.ldg-colors') =>
        if e.target.closest('.ldg-board') and !(@knob and @knob.moved) => @fire \tap, @get!
        @knob = null
        return
      if act == \pick => return picker.open @, @colors[@idx].hex, @el.disc
      if act == \apply => return @fire \apply, @get!
      if act == \dup =>
        c = @colors[@idx]
        s = sorted @colors
        i = s.indexOf c
        nb = s[i + 1] or s[i - 1]
        o = (c.offset + nb.offset) / 2
        @colors.push {hex: color-at(@colors, o), offset: o}
        @idx = @colors.length - 1
      else if act == \del =>
        if !can-del(@colors, @idx) => return
        picker.close!
        @colors.splice @idx, 1
        @idx = Math.min(@idx, @colors.length - 1)
      else return
      @build-dots true
      @update-gradient!
      @update-info!
      @fire \select, @idx
      @fire \change, @get!
    @

  GradientEditor.prototype = evts Object.create(Object.prototype) <<< do
    get: -> {dir: @dir, colors: @colors.map(-> {} <<< it)}
    get-json: -> @get! <<< {id: @id}
    get-css: -> to-css @
    get-svg: (o) -> to-svg @, o
    # 從外部改 ( 不觸發 change )
    set: ({dir, colors}, idx) ->
      if dir? => @dir = +dir
      if colors => @colors = norm colors
      @idx = Math.max(0, Math.min((if idx? => idx else @idx), @colors.length - 1))
      @build-dots @state.slider
      @update-gradient!
      @update-info!

    build: ->
      @root.innerHTML = """
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -4 124 132" preserveAspectRatio="xMidYMid">
        <defs><linearGradient id="#{@id}-gradient" gradientUnits="userSpaceOnUse"></linearGradient></defs>
        <path class="ldg-bar" d="M-1.962 80 A60 60 1 0 0 101.962 80" fill="none" stroke-width="1"/>
        <g class="ldg-board">
          <circle class="ldg-disc" cx="50" cy="50" r="50" fill="url(\##{@id}-gradient)"/>
          <path class="ldg-knob" fill="none" stroke-width="1.5" d="M53.422,10.156C73.91,11.893,90,29.062,90,50c0,22.091-17.909,40-40,40S10,72.091,10,50c0-20.938,16.09-38.107,36.578-39.844 M50,7.5v4"/>
        </g>
        <g class="ldg-texts" transform="translate(50 50)">
          <g class="ldg-hexrow" data-action="pick">
            <rect class="ldg-swatch" x="-25" y="-14.6" width="8" height="8" rx="1.8"/>
            <text class="ldg-hex" x="-14" y="-7"></text>
          </g>
          <text class="ldg-pos" y="6.5"><tspan class="ldg-percent"></tspan><tspan font-size="0.7em">%</tspan></text>
          #{@build-btns!}
        </g>
        <g class="ldg-colors"></g>
      </svg>
      """

    # + / × ( / 套用 ): 各自一個熱區; 圖示都用線畫、同樣大小並置中在 y = 16.5, 套用是半邊填滿的方框
    build-btns: ->
      xs = if @opt.apply => [-13 0 13] else [-6.5 6.5]
      hit = (x) -> """<rect class="ldg-hit" x="#{x - 6}" y="10.5" width="12" height="12"/>"""
      ret = """
      <g class="ldg-btn" data-action="dup">#{hit xs.0}<path class="ldg-ic" transform="translate(#{xs.0} 16.5)" d="M-3.6 0H3.6M0-3.6V3.6"/></g>
      <g class="ldg-btn" data-action="del">#{hit xs.1}<path class="ldg-ic" transform="translate(#{xs.1} 16.5)" d="M-2.9-2.9L2.9 2.9M2.9-2.9L-2.9 2.9"/></g>
      """
      if @opt.apply => ret += """
      <g class="ldg-btn ldg-apply" data-action="apply"><title>Apply as page background</title>#{hit xs.2}
        <g transform="translate(#{xs.2} 16.5)"><rect class="ldg-ic" x="-3.5" y="-3.5" width="7" height="7" rx="1.4"/><path class="ldg-fill" d="M-3.5 3.5L3.5-3.5V2.1A1.4 1.4 0 0 1 2.1 3.5Z"/></g>
      </g>
      """
      ret

    build-dots: (toggled = false) ->
      cs = @el.colors
      cs.innerHTML = ''
      for i from 0 til @colors.length =>
        [g, hit, ring, dot] = <[g circle circle circle]>.map CENS
        SA hit, {cx: 50, cy: 110, r: 11, fill: \#fff, "fill-opacity": 0}
        SA ring, {cx: 50, cy: 110, r: 9.5, fill: \none, "stroke-width": 1.6}
        SA dot, {cx: 50, cy: 110, r: 6, "stroke-width": 1}
        ring.classList.add \ldg-ring
        dot.classList.add \ldg-dot
        [hit, ring, dot].map -> g.appendChild it
        g.setAttribute \data-idx, i
        cs.appendChild g
      @paint-dots!
      @toggle-slider toggled

    paint-dots: ->
      @get-dots!map (g) ~>
        i = +g.getAttribute(\data-idx)
        if !(c = @colors[i]) => return
        h = C!.hcl c.hex
        SA g.querySelector(\.ldg-dot), {fill: c.hex, stroke: hex({} <<< h <<< {l: if h.l > 50 => h.l - 20 else h.l + 20})}
        g.classList.toggle \active, i == @idx

    update-gradient: ->
      g = @el.gradient
      SA g, line(@dir, 100, 100)
      g.innerHTML = ''
      for c in sorted(@colors) =>
        s = CENS \stop
        SA s, {"stop-color": c.hex, offset: c.offset}
        g.appendChild s
      @el.knob.setAttribute \transform, "rotate(#{@dir} 50 50)"
      @root.classList.toggle \dark, is-light(@colors)

    # 中間的色碼 / 位置 / 刪除鈕
    update-info: ->
      if !(c = @colors[@idx]) => return
      @el.hex.textContent = c.hex.toUpperCase!
      w = try @el.hex.getComputedTextLength! catch e => 0
      if !w => w = 38
      x = -(w + 11) / 2
      SA @el.swatch, {x: x, fill: c.hex}
      SA @el.hex, {x: x + 11}
      @el.percent.textContent = Math.round(c.offset * 100)
      @el.del.classList.toggle \disabled, !can-del(@colors, @idx)
      @paint-dots!

    lock: (v) ->
      @locked = v
      if v => @toggle true
      if !v and !@state.hover and !@opt.pinned => @toggle false
    set-idx: (idx, fire = true) ->
      @idx = idx
      @update-info!
      if fire => @fire \select, idx
    set-color: (c, fire = false) ->
      @colors[@idx].hex = hex(c)
      @update-info!
      @update-gradient!
      if fire => @fire \change, @get!

    toggle: (v) ->
      if @opt.pinned => v = true
      if !(v?) => v = !@state.active
      if @locked and !v => return
      @state.active = v
      if @debounce => clearTimeout @debounce; @debounce = null
      @root.classList.toggle \active, v
      setTimeout (~> @root.classList.toggle \on, @state.active), 300
      @toggle-slider v
      # 展開後才量得到色碼寬度
      if v => setTimeout (~> @update-info!), 0

    get-dots: -> QSA @el.colors, 'g'

    toggle-slider: (v) ->
      if !(v?) => v = !@state.slider
      @el.bar.classList.toggle \active, v
      gs = @get-dots!
      order = {}
      sorted(@colors).map (c, i) ~> order[@colors.indexOf c] = @colors.length - 1 - i
      for g in gs =>
        i = +g.getAttribute(\data-idx)
        g.style.transform = if v => "rotate(#{-60 + 120 * (1 - @colors[i].offset)}deg)"
        else "rotate(#{-15 * ((gs.length - 1) * 0.5) + order[i] * 15}deg)"
      @state.slider = v

  # ---------- 長條編輯器 ----------
  # 一條漸層, 下方是色標: 拖動改位置, 點長條加一個 ( 取該處的顏色 ), 雙擊色標換色;
  # 色標可用鍵盤 ← → 移動 ( shift 一次 10% )、Delete 刪除、Enter 換色
  # opt: root, colors, dir
  GradientEditor.Bar = Bar = (opt = {}) ->
    @root = root = if typeof(opt.root) == \string => QS(document, opt.root) else opt.root
    root.classList.add \ldgb
    @ <<< {opt, _evt: {}, idx: 0, dir: +(opt.dir or 0)}
    @colors = norm(if opt.colors and opt.colors.length >= 2 => opt.colors else <[#eeeeee #dddddd]>)
    root.innerHTML = """
    <div class="ldgb-rail">
      <div class="ldgb-track"><div class="ldgb-fill"></div></div>
      <div class="ldgb-stops"></div>
    </div>
    <div class="ldgb-info">
      <div class="ldgb-pick" data-action="pick" title="Pick a color"><span class="ldgb-swatch"></span><span class="ldgb-hex"></span></div>
      <label class="ldgb-pos"><input type="number" min="0" max="100" step="1"/><span>%</span></label>
      <button type="button" class="ldgb-del" data-action="del" title="Remove this color"><svg viewBox="-6 -6 12 12"><path d="M-3.2-3.2L3.2 3.2M3.2-3.2L-3.2 3.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button>
      #{if opt.apply => '<button type="button" class="ldgb-apply" data-action="apply" title="Apply as page background"><svg viewBox="-6 -6 12 12"><rect x="-4.5" y="-4.5" width="9" height="9" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M-4.5 4.5L4.5-4.5V2.7A1.8 1.8 0 0 1 2.7 4.5Z" fill="currentColor"/></svg></button>' else ''}
      <span class="ldgb-hint">Click the bar to add a color</span>
    </div>
    """
    @el = do
      rail: QS(root, \.ldgb-rail)
      track: QS(root, \.ldgb-track)
      fill: QS(root, \.ldgb-fill)
      stops: QS(root, \.ldgb-stops)
      swatch: QS(root, \.ldgb-swatch)
      hex: QS(root, \.ldgb-hex)
      pos: QS(root, '.ldgb-pos input')
      del: QS(root, \.ldgb-del)
    @render!

    focus = ~> QS(@el.stops, "[data-idx='#{@idx}']")?focus!
    offset-of = (e) ~>
      b = @el.track.getBoundingClientRect!
      Math.max(0, Math.min(1, (e.clientX - b.left) / b.width))
    drag = null
    move = (e) ~>
      if !drag => return
      if !drag.moved and Math.abs(e.clientX - drag.x) < 3 => return
      drag.moved = true
      @colors[@idx].offset = offset-of e
      @render!
      @fire \change, @get!
    up = (e) ~>
      document.removeEventListener \pointermove, move
      document.removeEventListener \pointerup, up
      document.removeEventListener \pointercancel, up
      drag := null
    @el.rail.addEventListener \pointerdown, (e) ~>
      if e.button and e.button != 0 => return
      if (n = e.target.closest \.ldgb-stop) => @set-idx +n.dataset.idx
      else
        # 只有點在長條上才加, 下方色標列的空白不算
        b = @el.track.getBoundingClientRect!
        if e.clientY > b.bottom + 2 => return
        o = offset-of e
        @colors.push {hex: color-at(@colors, o), offset: o}
        @set-idx @colors.length - 1, false
        @fire \select, @idx
        @fire \change, @get!
      e.preventDefault!
      focus!
      drag := {x: e.clientX, moved: false}
      document.addEventListener \pointermove, move
      document.addEventListener \pointerup, up
      document.addEventListener \pointercancel, up
    @el.stops.addEventListener \dblclick, (e) ~>
      if (n = e.target.closest \.ldgb-stop) => picker.open @, @colors[@idx].hex, @el.track
    @el.stops.addEventListener \keydown, (e) ~>
      if !(e.target.closest \.ldgb-stop) => return
      if e.key in <[ArrowLeft ArrowRight]> =>
        d = (if e.key == \ArrowLeft => -1 else 1) * (if e.shiftKey => 0.1 else 0.01)
        @colors[@idx].offset = Math.max(0, Math.min(1, Math.round((@colors[@idx].offset + d) * 100) / 100))
        @render!
        @fire \change, @get!
      else if e.key in <[Delete Backspace]> => @del!; focus!
      else if e.key == \Enter => picker.open @, @colors[@idx].hex, @el.track
      else return
      e.preventDefault!
    root.addEventListener \click, (e) ~>
      act = action-of e.target
      if act == \pick => picker.open @, @colors[@idx].hex, @el.track
      else if act == \del => @del!
      else if act == \apply => @fire \apply, @get!
    @el.pos.addEventListener \change, ~>
      v = +@el.pos.value
      if @el.pos.value == '' or isNaN(v) => return @render!
      @colors[@idx].offset = Math.max(0, Math.min(100, v)) / 100
      @render!
      @fire \change, @get!
    @

  Bar.prototype = evts Object.create(Object.prototype) <<< do
    get: -> {dir: @dir, colors: @colors.map(-> {} <<< it)}
    get-css: -> to-css @
    set: ({dir, colors}, idx) ->
      if dir? => @dir = +dir
      if colors => @colors = norm colors
      @idx = Math.max(0, Math.min((if idx? => idx else @idx), @colors.length - 1))
      @render!
    set-idx: (idx, fire = true) ->
      @idx = idx
      @render!
      if fire => @fire \select, idx
    set-color: (c, fire = false) ->
      @colors[@idx].hex = hex(c)
      @render!
      if fire => @fire \change, @get!
    lock: ->
    del: ->
      if !can-del(@colors, @idx) => return
      picker.close!
      @colors.splice @idx, 1
      @idx = Math.min(@idx, @colors.length - 1)
      @render!
      @fire \select, @idx
      @fire \change, @get!
    render: ->
      @el.fill.style.background = to-css {dir: 0, colors: @colors}
      ns = QSA @el.stops, \.ldgb-stop
      for i from 0 til Math.max(ns.length, @colors.length)
        if i >= @colors.length => ns[i].remove!; continue
        if !(n = ns[i]) =>
          n = document.createElement \div
          n <<< {className: \ldgb-stop, tabIndex: 0, innerHTML: '<i></i>'}
          n.setAttribute \role, \slider
          @el.stops.appendChild n
        c = @colors[i]
        n.dataset.idx = i
        n.style.left = "#{c.offset * 100}%"
        n.firstChild.style.background = c.hex
        n.classList.toggle \active, i == @idx
        n.setAttribute \aria-label, "#{c.hex} at #{Math.round(c.offset * 100)}%"
      c = @colors[@idx]
      @el.swatch.style.background = c.hex
      @el.hex.textContent = c.hex.toUpperCase!
      if document.activeElement != @el.pos => @el.pos.value = Math.round(c.offset * 100)
      @el.del.disabled = !can-del(@colors, @idx)

  GradientEditor <<< {css: to-css, svg: to-svg, color-at, can-del, picker, norm, css-angle}
  window.ldgradienteditor = GradientEditor
  QSA(document, '.ldgradient[data-auto]').map -> new GradientEditor({root: it})
)!
