import { isClue, isStop } from './wordgrid.js'

export function print(grid) {
  console.log(grid.grid.map(e => e.map(e => e?e:' ').join(' ')).join('\n'))
}

export function svg(wordgrid, scale = 20) {
  var grid = wordgrid.grid
  var padding = scale/5
  function renderCell(cell, i, j) {
    if (!cell) return ''
    var x = scale*i
    var y = scale*j
    if (isClue(cell))
      return `
        <rect x="${x}" y="${y}" width="${scale}" height="${scale}" class="solid" />
        <text x="${x+scale/2}" y="${y+scale-padding}" class="clue">${cell.toString()}</text>`
    if (isStop(cell))
      return `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" class="solid"/>`
    return `
      <rect x="${x}" y="${y}" width="${scale}" height="${scale}" />
      <text x="${x+scale/2}" y="${y+scale-padding}">${cell.toUpperCase()}</text>`
  }
  function renderArea(area) {
    var x = scale*area.x
    var y = scale*area.y
    return `<rect x="${x}" y="${y}" width="${area.width*scale}" height="${area.height*scale}" />`
  }
  var elements = grid.flatMap((row, j) =>
    row.map((cell, i) => renderCell(cell, i, j))
  )
  return `<svg width="${grid.length*scale}" height="${grid[0].length*scale}">
  <style>
    rect { fill:none; stroke:#000; stroke-width: 2px; }
    .solid {fill:#000}
    text { text-anchor: middle; font-family: sans-serif; font-size: ${scale*0.8}px; font-weight: normal; }
    text.clue { fill: #fff }
  </style>
  <rect x="0" y="0" width="${grid.length*scale}" height="${grid[0].length*scale}" ></rect>
  ${wordgrid.reserved.map(renderArea).join('')}
  ${elements.join('')}
  </svg>`
}
