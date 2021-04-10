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
  removeLastWordButton,
  wordsSelect,
  wordsTextbox,
  sizeSelect,
  insetSelect,
  iterationsSelect,
  consoleHost,
  displayHost,
  usedWordsTextbox,
}) {
  
  function loadState() {
    var json = localStorage.getItem('crossword_config') ?? '{}'; // jshint ignore:line
    var state = JSON.parse(json)
    if (state.wordlist) wordsSelect.value = state.wordlist
    if (state.words) wordsTextbox.value = state.words
    if (state.size) sizeSelect.value = state.size
    if (state.inset) insetSelect.value = state.inset
    if (state.iterations) iterationsSelect.value = state.iterations
  }
  
  function storeState() {
    var state = {
      wordlist: wordsSelect.value,
      words: wordsTextbox.value,
      size: sizeSelect.value,
      inset: insetSelect.value,
      iterations: iterationsSelect.value,
    }
    localStorage.setItem('crossword_config', JSON.stringify(state))
  }
  
  loadState()
  
  var blockableGenerate = blocking(generate, () => {
    generateButton.disabled = blockableGenerate.isBlocked
  })
  
  generateButton.addEventListener('click', blockableGenerate)
  removeLastWordButton.addEventListener('click', removeLastWord)
  
  var lastGrid = null
  
  function blocking(action, onChange = () => {}) {
    var blockable = async function () {
      if (blockable.isBlocked) return
      blockable.isBlocked = true
      try {
        onChange()
        await action()
      }
      finally {
        blockable.isBlocked = false
        onChange()
      }
    }
    blockable.isBlocked = false
    return blockable
  }
  
  function removeLastWord() {
    lastGrid.removeLastWord()
    render(lastGrid)
  }
  
  function render(grid) {
    storeState()
    var size = +sizeSelect.value
    var scale = 500/size
    console.log(grid)
    consoleHost.innerHTML = 'score: ' + grid.score()
    displayHost.innerHTML = svg(grid, scale)
    usedWordsTextbox.value = grid.words.map(e => e.word).join('\n')
  }

  async function generate() {
    var size = +sizeSelect.value
    var inset = insetSelect.value.split('x').map(e => Math.floor(size * +e))
  
    var optimize = Optimizer({
      seconds: +iterationsSelect.value,
      onProgress(progress) {
        displayHost.innerHTML = progressSvg(500, progress)
      }
    })
    
    var mandatory = wordsTextbox.value.trim().split('\n').map(e => e.trim())
    var wordOptions = {
      swe: ordlista,
      eng: wordlist,
      none: [],
      saol: 'saol'
    }
    var words = wordOptions[wordsSelect.value]
    if (words == 'saol') words = await (await fetch('saol.json')).json()

    var grid = await optimize(() => {
      var wordlist = randomizeWords({ mandatory, fillers: words })
      var grid = new WordGrid(size)
      grid.reserve({ x: 0, y: 0, width: inset[0], height: inset[1] })
      return generateSparse(wordlist, grid)
    })
    lastGrid = grid
    render(grid)
  }
}
