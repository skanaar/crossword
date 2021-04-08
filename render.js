import { isClue, isStop } from './wordgrid.js'

export function print(grid) {
  console.log(grid.grid.map(e => e.map(e => e?e:' ').join(' ')).join('\n'))
}

export function svg(wordgrid, scale = 20) {
  var grid = wordgrid.grid
  var padding = scale/5
  
  function renderLetter(i, j, cell){
    return `
      <rect x="${scale*i}" y="${scale*j}" width="${scale}" height="${scale}" />
      <text x="${scale*i+scale/2}" y="${scale*j+scale-padding}">${cell.toString().toUpperCase()}</text>`
  }
  
  function renderClue(i, j, cell){
    var arrow = cell.direction === 'horizontal'
      ? `<path transform="translate(${scale*(i+1)}, ${scale*(j+0.5)}), scale(${scale*0.05})" d="M0 0 L-4 2L-4 -2 Z" />`
      : `<path transform="translate(${scale*(i+0.5)}, ${scale*(j+1)}), scale(${scale*0.05})" d="M0 0 L-2 -4L2 -4 Z" />`
    return `
      <rect x="${scale*i}" y="${scale*j}" width="${scale}" height="${scale}" class="solid" />
      ${arrow}
      <text x="${scale*i+scale/2}" y="${scale*j+scale-padding*1.5}" class="clue">${cell.toString()}</text>`
  }

  function renderStop(i, j){
    return `<rect x="${scale*i}" y="${scale*j}" width="${scale}" height="${scale}" class="solid"/>`
  }

  function renderCell(cell, i, j) {
    if (!cell) return ''
    if (isClue(cell)) return renderClue(i, j, cell)
    if (isStop(cell)) return renderStop(i, j)
    return renderLetter(i, j, cell)
  }

  function renderArea(area) {
    var x = scale*area.x
    var y = scale*area.y
    return `<rect x="${x}" y="${y}" width="${area.width*scale}" height="${area.height*scale}" />`
  }

  var elements = grid.flatMap((row, j) =>
    row.map((cell, i) => renderCell(cell, i, j))
  )
  return `<svg viewBox="-1 -1 ${grid.length*scale+2} ${grid[0].length*scale+2}">
  <style>
    rect { fill:none; stroke:#000; stroke-width: 2px; }
    .solid { fill:#000 }
    path { fill:#fff }
    text { text-anchor: middle; font-family: sans-serif; font-size: ${scale*0.8}px; font-weight: normal; }
    text.clue { fill: #fff; font-size: ${scale*0.6}px }
  </style>
  ${wordgrid.reserved.map(renderArea).join('')}
  ${elements.join('')}
  </svg>`
}
