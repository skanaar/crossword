import { Vec, Vertical, Horizontal, isBlock, isLetter} from './wordgrid.js'

export function grow(words, grid) {
  var size = grid.size
  var number = 1
  var [first, ...tail] = words.filter(e => e.length + 2 <= size)

  for (var p of diagonally(size)) {
    if (isEmpty(grid.get(p))) {
      var clue_h = findSeedPoint(Horizontal, p)
      var clue_v = findSeedPoint(Horizontal, p)
      if (clue_h) {
        
      }
    }
  }

  function findSeedPoint(direction, p){
    for (var i=1; i<size; i++) {
      direction(p, -i)
    }
  }

  return grid
}

export function* diagonally(size) {
  var x = 0
  var y = 0
  while(y < size) {
    yield Vec(x, y)
    x++
    y--
    if (y < 0) {
      y = x
      x = 0
    }
  }
  while(!(x == size-1 && y == size-1)) {
    x++
    y--
    if (x == size) {
      x = y+2
      y = size-1
    }
    yield Vec(x, y)
  }
}
