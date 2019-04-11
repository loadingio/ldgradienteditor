#colors = [ <[#f0f #0ff]> <[#ff0 #f0f]> <[#ff9 #fc9]> <[#5f9 #7ff]> <[#f00 #f93]> <[#fbd786 #f7797d]> ]
#
ld$.fetch \gradients.json, {}, {type: \json}
  .then (colors) ->
    colors.sort (a,b) -> ldColor.hcl(a.colors.0).h - ldColor.hcl(b.colors.0).h
    colors
      .filter -> it.colors.length
      .map ->
        node = document.createElement("div")
        container.appendChild node
        new GradientEditor {root: node, colors: it.colors, dir: it.dir}

