export function print(grid) {
  console.log(grid.grid.map(e => e.map(e => e?e:' ').join(' ')).join('\n'))
}

export function svg(grid, scale = 20) {
  var padding = scale/5
  function renderCell(letter, i, j) {
    if (!letter) return ''
    var x = scale*i
    var y = scale*j
    if (letter == ' ')
      return `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" class="solid"/>`
    return `
      <rect x="${x}" y="${y}" width="${scale}" height="${scale}" />
      <text x="${x+scale/2}" y="${y+scale-padding}">${letter.toUpperCase()}</text>`
  }
  var elements = grid.flatMap((row, j) =>
    row.map((cell, i) => renderCell(cell, i, j))
  )
  return `<svg width="${grid.length*scale}" height="${grid[0].length*scale}">
  <style>
    rect { fill:none; stroke:#000; stroke-width: 2px; }
    .solid {fill:#000}
    text { text-anchor: middle; font-family: sans-serif; font-size: ${scale*0.8}px }
  </style>
  ${elements.join('')}
  </svg>`
}
