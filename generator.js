import { shuffle } from './util.js'
import { WordGrid, Vec } from './wordgrid.js'

export function generateSparse(words, size) {
  var grid = new WordGrid(size)
  
  var list = shuffle(words).sort((a,b) => a.length < b.length)
  
  var first = true
  var vertical = true
  var number = 1
  for(var word of list){
    if (word.length > size) continue
    if (first) {
      grid.place_h(word, number++, Vec(Math.floor((size-word.length)/2), Math.floor(size/2)))
      first = false
    } else if (vertical){
      let p = grid.find_v(word, 2, 1)
      if (p) grid.place_v(word, number++, p)
    } else {
      let p = grid.find_h(word, 2, 1)
      if (p) grid.place_h(word, number++, p)
    }
    vertical = !vertical
  }
  
  return grid
}