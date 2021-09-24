

make-one = (it,append = true) ->
  node = document.createElement("div")
  if append => container.appendChild node
  else container.insertBefore node, container.childNodes.1
  ret = new GradientEditor {root: node, colors: it.colors, dir: it.dir, w: it.w, id: it.id}
  ret.root.ldge = ret
  ret.root.addEventListener \mouseover, ->
    mbox = menu.getBoundingClientRect!
    box = ret.root.getBoundingClientRect!
    x = box.x + box.width / 2 - (mbox.width / 2)
    y = box.y - mbox.height + 5 + document.scrollingElement.scrollTop
    menu.style <<< left: "#{x}px", top: "#{y}px"
    menu.active = ret
  ret


local = {}
ld$.fetch \assets/data/orders.json, {}, {type: \json}
  .then (orders) ->
    local.orders = orders
    ld$.fetch \assets/data/gradients.json, {}, {type: \json}
  .then (colors) ->
    if Array.isArray(colors) => colors.map (d,i) -> d.id = (i + 1)
    else colors = [v <<< {id: k} for k,v of colors]

    colors = colors.filter -> it.colors.length
    colors = colors.map -> 
      w = it.colors.map(->100 - ldcolor.hcl(it).h).reduce(((a,b) -> a + b),0) / it.colors.length
      it <<< w: if isNaN(w) => 0 else w
    #colors.sort (a,b) -> return b.w - a.w
    colors.sort (a,b) -> local.orders.indexOf("#{a.id}") - local.orders.indexOf("#{b.id}")
    menu.addEventListener \mousedown, (e) ->
      if e.target.classList.contains \i-bars =>
        menu.drag = menu.active
        dragger = (e) ->
        document.addEventListener \mousemove, dragger
        document.addEventListener \mouseup, (->
          up = (e) ->
            document.removeEventListener \mousemove, dragger
            document.removeEventListener \mouse, up
            p = ld$.parent(e.target, '.ldgradient')
            if !p or p == menu.drag.root => return
            menu.drag.root.parentNode.removeChild menu.drag.root
            p.parentNode.insertBefore menu.drag.root, p
            orders = Array.from(container.childNodes).filter(->it.ldge).map (d,i) -> d.ldge.id
            ld$.fetch "gradient/order?data=#{encodeURIComponent(orders.join(','))}", {}, {}
            menu.drag = null

        )!


    menu.addEventListener \click, (e) ->
      if e.target.classList.contains \i-save =>
        d = encodeURIComponent(JSON.stringify(menu.active.get-json!))
        ld$.fetch "/gradient?data=#d", {method: \GET}
      else if e.target.classList.contains \i-close =>
        d = encodeURIComponent(JSON.stringify(menu.active.get-json!))
        ld$.fetch "/gradient?data=#d", {method: \DELETE}
        menu.active.root.parentNode.removeChild menu.active.root
    ldges = colors
      .map make-one

add.addEventListener \click, -> make-one {colors: <[#f0f #0ff]>, dir: 0, id: Math.random!toString(36)substring(2)}, false
