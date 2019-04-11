colors = [ <[#f0f #0ff]> <[#ff0 #f0f]> <[#ff9 #fc9]> <[#5f9 #7ff]> <[#f00 #f93]> <[#fbd786 #f7797d]> ]
colors.map ->
  node = document.createElement("div")
  document.body.appendChild node
  new GradientEditor {root: node, colors: it}

