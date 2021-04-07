import { shuffle } from './util.js'
import { Vec, Vertical, Horizontal } from './wordgrid.js'

export function generateSparse(words, grid) {  
  var list = shuffle(words).sort((a,b) => a.length < b.length)
  var size = grid.size
  
  var isFirst = true
  var isVertical = true
  var number = 1
  for(var word of list){
    if (word.length+1 > size) continue
    if (isFirst) {
      grid.place(Horizontal, word, number++, Vec(Math.floor((size-word.length)/2), Math.floor(size/2)))
      isFirst = false
    } else if (isVertical){
      let p = grid.find_v(word, 2, 1)
      if (p) grid.place(Vertical, word, number++, p)
    } else {
      let p = grid.find_h(word, 2, 1)
      if (p) grid.place(Horizontal, word, number++, p)
    }
    isVertical = !isVertical
  }
  
  return grid
}
