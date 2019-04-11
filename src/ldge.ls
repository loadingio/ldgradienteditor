(!->
  get-color-alt = (c) ->
    c = ldColor.hcl c
    color-alt = {} <<< c <<< {l: if c.l > 50 => c.l - 20 else c.l + 20}

  CENS = (n) -> document.createElementNS("http://www.w3.org/2000/svg", n)
  SA = (n, o) -> for k,v of o => n.setAttribute k, v
  QS = (n, s) -> n.querySelector(s)
  QSA = (n, s) -> Array.from(n.querySelectorAll(s))

  local = {}

  window.GradientEditor = GradientEditor = (opt = {}) ->
    @root = root = if typeof(opt.root) == typeof('') => opt.root = QS(document, opt.root) else opt.root
    @root.classList.add \ldgradient
    @ <<< do
      opt: opt
      id: opt.id or "ldg-#{Math.random!toString 36 .substring 2}" # used in linearGradient
      dir: opt.dir or 0 # gradient direction
      angle: {}         # angle information for user interaaction
      state: do
        drag: false    # dragging the dots
        slider: false  # slider shown
        knob: false    # knob is turning
        active: false  # are widgets shown?
        hover: false   # is mouse over?

    # if there is no colors in opt, try lookup some from DOM. 
    if !opt.colors or opt.colors.length < 2 =>
      opt.colors = QSA(@root,'g.ldg-colors circle').map(-> it.getAttribute \fill)
    if opt.colors.length < 2 => opt.colors = <[#eee #ddd]>

    # colors = [ldColor, ldColor, ...] with "offset" fields in ldColor.
    @colors = opt.colors.map (d,i) -> 
      ret = if typeof(d) == \string => ldColor.hsl(d) else d
      if !(ret.offset?) => ret.offset = i / (opt.colors.length - 1)
      ret

    # Prepare DOM
    if !@opt.manual-dom => @build! # skeleton
    @el = do # containers
      bar: QS(@root, '.ldg-bar')
      colors: QS(@root, '.ldg-colors')
      board: QS(@root, '.ldg-board')
      gradient: gradient = QS(@root, 'linearGradient')
      texts: QS(@root, \.ldg-texts)
      percent: QS(@root, \.ldg-percent)
      hex: QS(@root, \.ldg-hex)

    @set-idx 0

    # Prepare DOM from colors
    @build-dots!
    @update-gradient!

    angle = (e, knob = true) ~>
      box = @root.getBoundingClientRect!
      [x, y] = [box.left + box.width * 0.5, box.top + (box.width) * 0.5]
      [dx, dy] = [e.clientX - x, e.clientY - y]
      a = 180 * Math.acos(60 * dy / Math.sqrt((dx * dx + dy * dy) * (60 * 60))) / Math.PI
      if knob => a = 180 - a
      if knob and dx < 0 => a = 360 - a
      if !knob => a <?= 60
      if !knob and dx > 0 => a = -a
      return a

    funcs = do
      knob: cancel: (e) ~>
        @state.knob = false
        if !isNaN(a = angle(e) - @angle.init + @dir) => @dir = a
        document.removeEventListener \mouseup, funcs.knob.cancel
      bar:
        move: (e) ~> if @dot =>
          @state.drag = true
          a = angle e, false
          @dot.style.transform =  "rotate(#{a}deg)"
          @colors[+@dot.getAttribute(\data-idx)].offset = offset = (60 - a) / 120
          @el.percent.textContent = Math.round(offset * 100)
          @update-gradient!
        cancel: (e) ~>
          @dot = null
          if !@state.hover => @debounce = setTimeout (~> @toggle false), 300
          document.removeEventListener \mousemove, funcs.bar.move
          document.removeEventListener \mouseup, funcs.bar.cancel

    @root.addEventListener \mouseover, ~>
      @state.hover = true
      if !@state.active => @toggle true
    @root.addEventListener \mouseout, ~>
      @state.hover = false
      if !@dot and !@locked => @debounce = setTimeout (~> @toggle false), 300
    @root.addEventListener \mousedown, (e) ~>
      if @el.board in [e.target, e.target.parentNode] =>
        @state.knob = true
        @angle.init = angle e
        document.addEventListener \mouseup, funcs.knob.cancel
      else if e.target.parentNode.parentNode == @el.colors =>
        @dot = e.target.parentNode
        @set-idx +@dot.getAttribute(\data-idx)
        @el.hex.textContent = ldColor.hex @colors[@idx]
        @el.percent.textContent = Math.round(@colors[@idx].offset * 100)
        document.addEventListener \mousemove, funcs.bar.move
        document.addEventListener \mouseup, funcs.bar.cancel
    @root.addEventListener \mousemove, (e) ~>
      if @state.knob =>
        if isNaN(a = angle(e) - @angle.init + @dir) => return
        @el.board.setAttribute \transform, "rotate(#a 50 50)"
    @root.addEventListener \click, (e) ~>
      act = e.target.getAttribute(\data-action) or e.target.parentNode.getAttribute(\data-action)
      if @el.colors == e.target.parentNode.parentNode and !@state.drag =>
        @set-idx +e.target.parentNode.getAttribute(\data-idx)
        if local.client and local.client != @ => local.client.lock false
        local.client = @
        @lock true
        if !(ldcp?) => return
        ldcp.set-palette {colors: @colors}
        ldcp.set-idx @idx
        ldcp.toggle true, e.target
        e.stopPropagation!
      @state.drag = false
      if act == \dup =>
        nc = {} <<< @colors[@idx]
        nc.offset = (nc.offset + @colors[@idx + (if @idx < @colors.length - 1 => 1 else -1)].offset) / 2
        @colors.splice @idx, 0, nc
        if @idx == @colors.length - 1 => @set-idx @idx + 1
      else if act == \del and @colors.length > 2 => @colors.splice (@idx), 1
      else return
      @update-gradient!
      @build-dots true

    @

  GradientEditor.prototype = Object.create(Object.prototype) <<< do

    build: ->
      @root.innerHTML = """
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 10 120 120" preserveAspectRatio="xMidYMid">
        <linearGradient id="#{@id}-gradient" x1="0" x2="1" y1="0" y2="0"></linearGradient>
        <path class="ldg-bar" d="M-1.962 80 A60 60 1 0 0 101.962 80" fill="none" stroke="\#eeeff1" stroke-width="1"/>
        <g class="ldg-board"><circle cx="50" cy="50" r="50" fill="url(\##{@id}-gradient)"/><use href="\#ldg-knob"/></g>
        <g class="ldg-texts" transform="translate(50 50)">
          <text class="ldg-hex" dx="-0.2em" dy="-0.7em"></text>
          <text dx="0.1em" dy="0.6em">
            <tspan class="ldg-percent"></tspan><tspan font-size="0.7em">%</tspan>
          </text>
          <text dy="1.4em" class="ldg-btn">
            <tspan data-action="dup">+ </tspan><tspan data-action="del"> &times;</tspan>
          </text>
        </g>
        <g class="ldg-colors"></g>
      </svg>
      """

    build-dots: (toggled = false) ->
      cs = @el.colors
      for i from cs.childNodes.length - 1 to 0 by -1 => cs.removeChild cs.childNodes[i]
      for i from 0 til @colors.length =>
        color = @colors[i]
        color-alt = get-color-alt color
        [g, c1, c2] = <[g circle circle]>.map CENS
        g.appendChild c2
        g.appendChild c1
        SA c2, {cx: 50, cy: 110, r: 11, fill: \#fff, "fill-opacity": 0}
        SA c1, {cx: 50, cy: 110, r: 6, stroke: ldColor.web(color-alt), "stroke-width": 1, fill: ldColor.web(color)}
        c1.classList.add \ldg-dot
        g.setAttribute \data-idx, i
        g.style.transform = "rotate(#{-15 * (@colors.length - 1) * 0.5 + i * 15}deg)"
        @el.colors.appendChild g
      @toggle-slider toggled

    update-gradient: ->
      g = @el.gradient
      for i from g.childNodes.length - 1 to 0 by -1 => g.removeChild g.childNodes[i]
      colors = [c for c in @colors]
      colors.sort (a, b) -> a.offset - b.offset
      for c in colors =>
        s = CENS \stop
        SA s, {"stop-color": ldColor.web(c), offset: c.offset}
        g.appendChild s

    lock: (v) ->
      @locked = v
      if v => @toggle true
      if !v and !@state.hover => @toggle false
    set-idx: (idx) ->
      @idx = idx
      c = @colors[@idx]
      @el.hex.textContent = ldColor.hex c
      @el.percent.textContent = Math.round(c.offset * 100)
    set-color: (c) ->
      @colors[@idx] = c <<< @colors[@idx]{offset}
      c-alt = get-color-alt c
      SA @el.colors.querySelector("g:nth-child(#{1 + @idx}) .ldg-dot"), do
        fill: ldColor.web(c), stroke: ldColor.web(c-alt)
      @el.hex.textContent = ldColor.hex(c)
      @update-gradient!

    toggle: (v) ->
      if @locked => return
      if !(v?) => @state.active = v = !@state.active
      if @debounce => clearTimeout @debounce; @debounce = null
      @root.classList[if v => \add else \remove] \active
      setTimeout (~> @root.classList[if v => \add else \remove] \on), 300
      @toggle-slider v

    get-dots: -> QSA @el.colors, 'g'

    toggle-slider: (v) ->
      if !(v?) => v = !@state.slider
      @el.bar.classList[if v => \add else \remove] \active
      cs = @get-dots!
      if !v =>
        order = {}
        offsets = (@colors.map (d,i) -> [d.offset, i])
        offsets.sort (a,b) -> b.0 - a.0
        offsets.map (d,i) -> order[d.1] = i

      for i from 0 til cs.length =>
        n = cs[i]
        idx = n.getAttribute(\data-idx)
        n.style.transform = if v => "rotate(#{ -60 + 120 * ( 1 - @colors[idx].offset)}deg)"
        else "rotate(#{(-15 * ((cs.length - 1) * 0.5) + order[idx] * 15)}deg)"
        n.childNodes.0.setAttribute \fill, ldColor.web @colors[idx]
      @state.slider = v

  ld$.find(document.body, '.ldgradient').map -> new GradientEditor({root: it})

  if ldColorPicker? =>
    ldcp = new ldColorPicker null, {className: 'flat compact-palette shadow no-alpha'}
    ldcp.on \change, -> if local.client => local.client.set-color it
    ldcp.on \toggle, -> local.client.lock it
)!
