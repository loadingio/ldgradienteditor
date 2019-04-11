require! <[fs]>
gradients = fs.read-file-sync \gradient-180.txt .toString!
  .split \\n
  .map ->
    it = it.split \,
    dir = +it.splice(0, 1).0
    colors = it.map ->
      it = it.trim!split ' '
      {hex: it.0, offset: +it.1/100}
    colors.sort (a, b) -> a.offset - b.offset
    {dir, colors}

fs.write-file-sync 'gradients.json', JSON.stringify(gradients)
