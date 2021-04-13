import { generateSparse, randomizeWords } from './algo-sparse.js'
import { imageFileToDataUrl } from './img-loader.js'
import { grow, diagonally } from './algo-grow.js'
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
  insetFileInput,
  iterationsSelect,
  algoSelect,
  consoleHost,
  displayHost,
  usedWordsTextbox,
  saveSvgButton,
  resultElement,
}) {

  function loadState() {
    var json = localStorage.getItem('crossword_config') ?? '{}'; // jshint ignore:line
    var state = JSON.parse(json)
    if (state.wordlist) wordsSelect.value = state.wordlist
    if (state.words) wordsTextbox.value = state.words
    if (state.size) sizeSelect.value = state.size
    if (state.inset) insetSelect.value = state.inset
    if (state.iterations) iterationsSelect.value = state.iterations
    if (state.algo) algoSelect.value = state.algo
  }
  
  function storeState() {
    var state = {
      wordlist: wordsSelect.value,
      words: wordsTextbox.value,
      size: sizeSelect.value,
      inset: insetSelect.value,
      iterations: iterationsSelect.value,
      algo: algoSelect.value,
    }
    localStorage.setItem('crossword_config', JSON.stringify(state))
  }
  
  loadState()
  
  var blockableGenerate = blocking(generate, () => {
    generateButton.disabled = blockableGenerate.isBlocked
  })
  
  generateButton.addEventListener('click', blockableGenerate)
  removeLastWordButton.addEventListener('click', removeLastWord)
  saveSvgButton.addEventListener('click', saveSvg)
  
  var self = {
    wordgrid: null
  }
  
  async function saveSvg() {
    try {
      var size = +sizeSelect.value
      var scale = 500/size
      var svgSource = svg(self.wordgrid, scale)
      const blob = new Blob([svgSource], {type : 'image/svg+xml'})
      const newHandle = await window.showSaveFilePicker()
      const writableStream = await newHandle.createWritable()
      await writableStream.write(blob)
      await writableStream.close()
    } catch (e) { console.log(e) }
  }
  
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
    self.wordgrid.removeLastWord()
    render(self.wordgrid)
  }
  
  function render(grid, scale) {
    storeState()
    consoleHost.innerHTML = 'score: ' + grid.score()
    displayHost.innerHTML = svg(grid, scale)
    usedWordsTextbox.value = grid.words.map(e => e.word).join('\n')
    resultElement.classList.remove('hidden')
  }

  async function generate() {
    var size = +sizeSelect.value
    var scale = 500/size
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
    
    var algos = {
      sparse: generateSparse,
      grow
    }

    var algo = algos[algoSelect.value]
    var insetSize = { width: inset[0], height: inset[1] }
    var image = null
    if (insetFileInput.files.length) {
      image = await imageFileToDataUrl(insetFileInput.files[0], {
        width: scale*insetSize.width,
        height: scale*insetSize.height,
      })
    }

    var grid = await optimize(() => {
      var wordlist = randomizeWords({ mandatory, fillers: words })
      var grid = new WordGrid(size)
      grid.reserve({ ...insetSize, x: 0, y: 0, image })
      return algo(wordlist, grid)
    })
    self.wordgrid = grid
    render(grid, scale)
  }
  
  return self
}
