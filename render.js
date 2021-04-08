/* jshint -W014, -W083, undef: true */
import { isBlock } from './wordgrid.js'

export function ascii(grid) {
  return grid.grid.map(e => e.map(e => e?e:' ').join(' ')).join('\n')
}

export function svg(wordgrid, scale = 20) {
  var padding = scale/5
  var z = scale
  
  function renderLetter(i, j, cell){
    return `
      <rect x="${z*i}" y="${z*j}" width="${z}" height="${z}" />
      <text x="${z*i+z/2}" y="${z*j+z-padding}">${cell.toString().toUpperCase()}</text>`
  }
  
  function renderBlock(i, j, cell){
    var pad = z/10
    var clueh = cell.clues.horizontal
      ? `<text x="${z*i+z-pad}" y="${z*j+z/2}" class="clue-h">${cell.clues.horizontal}</text>`
      : ''
    var cluev = cell.clues.vertical
      ? `<text x="${z*i+pad}" y="${z*j+z-pad}" class="clue-v">${cell.clues.vertical}</text>`
      : ''
    return `
      <rect x="${z*i}" y="${z*j}" width="${z}" height="${z}" class="solid" />
      ${clueh}
      ${cluev}`
  }

  function renderCell(cell, i, j) {
    if (!cell) return ''
    if (isBlock(cell)) return renderBlock(i, j, cell)
    return renderLetter(i, j, cell)
  }

  function renderArea({ x, y, width, height }) {
    return `<rect x="${z*x}" y="${z*y}" width="${width*z}" height="${height*z}" />`
  }

  var elements = []
  for (var i=0; i<wordgrid.size; i++)
    for (var j=0; j<wordgrid.size; j++)
      elements.push(renderCell(wordgrid.get({x:i,y:j}), i, j))

  return `<svg viewBox="-1 -1 ${wordgrid.size*z+2} ${wordgrid.size*z+2}">
  <style>
    rect { fill:none; stroke:#000; stroke-width: 2px; }
    .solid { fill:#000 }
    path { fill:#fff }
    text { text-anchor: middle; font-family: sans-serif; font-size: ${z*0.8}px; font-weight: normal; }
    text.clue-h { text-anchor: end; fill: #fff; font-size: ${z*0.4}px }
    text.clue-v { text-anchor: start; fill: #fff; font-size: ${z*0.4}px }
  </style>
  ${wordgrid.reserved.map(renderArea).join('')}
  ${elements.join('')}
  </svg>`
}
