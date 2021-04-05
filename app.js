import { generateSparse } from './generator.js'
import { svg } from './render.js'
import { ordlista } from './svenska.js'
import { wordlist } from './english.js'
import { Optimizer } from './optimizer.js'
import { WordGrid } from './wordgrid.js'

function progressSvg(size, amount) {
  return `<svg width="${size}" height="${size}">
  <style>
    rect.border { fill:none; stroke:#000; stroke-width: 5px; }
    rect.bar { fill:#333; stroke:none; }
  </style>
  <rect class="bar" x="${size*0.2}" y="${size*0.45}" width="${size*0.6*amount}" height="${size*0.1}" />
  <rect class="border" x="${size*0.2}" y="${size*0.45}" width="${size*0.6}" height="${size*0.1}" />
  </svg>`
}

export function App({
  generateButton,
  wordsSelect,
  customWords,
  sizeSelect,
  insetSelect,
  iterationsSelect,
  consoleHost,
  displayHost,
}) {
  generateButton.addEventListener('click', generate)

  async function generate() {
    
    var size = +sizeSelect.value
    var inset = insetSelect.value.split('x').map(e => +e)
    var scale = 500/size
  
    var optimize = Optimizer({
      seconds: +iterationsSelect.value,
      onProgress(progress) {
        displayHost.innerHTML = progressSvg(scale*size, progress)
      }
    })
    
    var wordOptions = {
      custom: customWords.value.trim().split('\n').map(e => e.trim()),
      swe: ordlista,
      eng: wordlist,
    }

    var words = wordOptions[wordsSelect.value]
    var grid = await optimize(() => {
      var inputGrid = new WordGrid(size)
      inputGrid.reserve(0, 0, size*inset[0], size*inset[1])
      return generateSparse(words, inputGrid)
    })
    console.log(grid.words)
    consoleHost.innerHTML = 'score: ' + grid.score()
    displayHost.innerHTML = svg(grid.grid, scale)
  }
}
