import { Vec, Vertical, Horizontal } from './wordgrid.js'

function shuffle(list) {
  var input = [...list]
  var result = []
  while(input.length) {
    var i = Math.floor(input.length*Math.random())
    result.push(input[i])
    input.splice(i, 1)
  }
  return result
}

export function randomizeWords({ mandatory, fillers }) {
  return [...mandatory.filter(e => e && e.length), ...shuffle(fillers).sort((a,b) => a.length < b.length)]
}

export function generateSparse(words, grid) {
  var size = grid.size
  var number = 1
  var [first, ...tail] = words.filter(e => e.length + 2 <= size)

  grid.place(Horizontal, first, number++, Vec(Math.floor((size-first.length)/2), Math.floor(size/2)))
  
  var isVertical = true
  for(var word of tail){
    if (isVertical){
      let p = grid.find_v(word, 2, 1)
      if (p) {
        grid.place(Vertical, word, number++, p)
        isVertical = !isVertical
      }
    } else {
      let p = grid.find_h(word, 2, 1)
      if (p) {
        grid.place(Horizontal, word, number++, p)
        isVertical = !isVertical
      }
    }
  }
  
  return grid
}
