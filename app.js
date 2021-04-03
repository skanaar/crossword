import { generateSparse } from './crossword.js'
import { svg } from './render.js'
import { ordlista } from './svenska.js'
import { Optimizer } from './optimizer.js'

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

const sq = x => x*x

export function App({
  generateButton,
  customWordsCheckbox,
  customWords,
  sizeSelect,
  iterationsSlider,
  consoleHost,
  displayHost,
}) {
  generateButton.addEventListener('click', generate)

  async function generate() {
    
    var size = +sizeSelect.value
    console.log({size})
    var scale = 500/size
  
    var optimize = Optimizer({
      seconds: sq(iterationsSlider.value) / 10,
      onProgress(progress) {
        displayHost.innerHTML = progressSvg(scale*size, progress)
      }
    })

    var words = customWordsCheckbox.checked
    ? customWords.value.trim().split('\n').map(e => e.trim())
    : ordlista
    var grid = await optimize(() => generateSparse(words, size), )
    consoleHost.innerHTML = 'score: ' + grid.score()
    displayHost.innerHTML = svg(grid.grid, scale)
  }
}
