import { generateSparse, randomizeWords } from './generator.js'
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
  popButton,
  wordsSelect,
  customWords,
  sizeSelect,
  insetSelect,
  iterationsSelect,
  consoleHost,
  displayHost,
  usedWords,
}) {
  generateButton.addEventListener('click', generate)
  popButton.addEventListener('click', pop)
  
  var lastGrid = null
  var isGenerating = false
  
  function pop() {
    lastGrid.pop()
    render(lastGrid)
  }
  
  function render(grid) {
    var size = +sizeSelect.value
    var scale = 500/size
    console.log(grid)
    consoleHost.innerHTML = 'score: ' + grid.score()
    displayHost.innerHTML = svg(grid, scale)
    usedWords.value = grid.words.map(e => e.word).join('\n')
  }

  async function generate() {
    if (isGenerating) return
    isGenerating = true
    var size = +sizeSelect.value
    var inset = insetSelect.value.split('x').map(e => +e)
  
    var optimize = Optimizer({
      seconds: +iterationsSelect.value,
      onProgress(progress) {
        displayHost.innerHTML = progressSvg(500, progress)
      }
    })
    
    var mandatory = customWords.value.trim().split('\n').map(e => e.trim())
    var wordOptions = {
      swe: ordlista,
      eng: wordlist,
    }

    var words = wordOptions[wordsSelect.value]
    var grid = await optimize(() => {
      var wordlist = randomizeWords({ mandatory, fillers: words })
      return generateSparse(wordlist, new WordGrid({
        size,
        reserved: [{
          x: 0,
          y: 0,
          width: Math.floor(size*inset[0]),
          height: Math.floor(size*inset[1])
        }]
      }))
    })
    lastGrid = grid
    render(grid)
    isGenerating = false
  }
}
