import { range } from './util.js'

export function Vec(x,y) { return {x,y} }
  
function isLetter(c) {
  return (c != null) && (c != ' ')
}

export class WordGrid {
  constructor(size) {
    this.size = size
    this.grid = range(0, size).map(() => range(0, size).map(e => null))
  }

  find_v(word, modulo = 1, offset = 0) {
    for (var i=offset; i<this.size; i+=modulo)
      for (var j=0; j<this.size-word.length; j++)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j+l][i])))
          if (this.try_v(word, Vec(i,j)))
            return Vec(i,j)
    return false
  }

  find_h(word, modulo = 1, offset = 0) {
    for (var i=0; i<this.size-word.length; i++)
      for (var j=offset; j<this.size; j+=modulo)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j][i+l])))
          if (this.try_h(word, Vec(i,j))) return Vec(i,j)
    return false
  }

  try_v(word, p) {
    for (var k=0; k<word.length; k++) {
      var cell = this.grid[p.y+k][p.x]
      if (cell !== null && cell !== word[k]) return false
    }
    return true
  }

  try_h(word, p) {
    for (var k=0; k<word.length; k++) {
      var cell = this.grid[p.y][p.x+k]
      if (cell !== null && cell !== word[k]) return false
    }
    return true
  }

  place_h(word, p) {
    for (var k=0; k<word.length; k++) this.grid[p.y][p.x+k] = word[k]
  }
  place_v(word, p) {
    for (var k=0; k<word.length; k++) this.grid[p.y+k][p.x] = word[k]
  }
  score() {
    
    var result = 0
    for (var i=0; i<this.size; i++)
      for (var j=0; j<this.size; j++)
        result += isLetter(this.grid[j][i]) ? 1 : 0
    return result
  }
}
