import { range } from './util.js'

export function Vec(x,y) { return {x,y} }

export function isEmpty(c) { return c === null }
export function isClue(c) { return 'number' === typeof c }
export function isStop(c) { return 'object' === typeof c }
export function isLetter(c) { return 'string' === typeof c }
export function isFree(c) { return isEmpty(c) || isStop(c) }
export function Reserved() { return false }
export function Clue(number) { return number }
export function Letter(letter) { return letter }
export function Stop() { return {} }

export class WordGrid {
  constructor({ size, reserved = [] }) {
    this.size = size
    this.grid = range(0, size).map(() => range(0, size).map(e => null))
    this.words = []
    this.reserved = reserved
    for(var { x, y, width, height } of reserved) {
      for (var i=x; i<x+width; i++)
        for (var j=y; j<y+height; j++)
          this.grid[j][i] = Reserved()
    }
  }

  find_v(word, modulo = 1, offset = 0) {
    for (var i=offset; i<this.size; i+=modulo)
      for (var j=0; j<this.size-word.length; j++)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j+l+1][i])))
          if (this.try_v(word, Vec(i,j)))
            return Vec(i,j)
    return false
  }

  find_h(word, modulo = 1, offset = 0) {
    for (var i=0; i<this.size-word.length; i++)
      for (var j=offset; j<this.size; j+=modulo)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j][i+l+1])))
          if (this.try_h(word, Vec(i,j))) return Vec(i,j)
    return false
  }

  get(p) {
    return this.grid[p.y][p.x]
  }

  offset(p, direction, offset) {
    return direction === 'v' ?
      Vec(p.x, p.y+offset) :
      Vec(p.x+offset, p.y)
  }

  try_v(word, p) {
    if (!isFree(this.grid[p.y][p.x])) return false
    if (p.y + word.length + 2 >= this.size) return false
    if (isLetter(this.grid[p.y+word.length+1][p.x])) return false
    for (var k=0; k<word.length; k++) {
      var cell = this.grid[p.y+k+1][p.x]
      if (cell !== null && cell !== word[k]) return false
    }
    return true
  }

  try_h(word, p) {
    if (!isFree(this.grid[p.y][p.x])) return false
    if (p.x + word.length + 2 >= this.size) return false
    if (isLetter(this.grid[p.y][p.x+word.length+1])) return false
    for (var k=0; k<word.length; k++) {
      var cell = this.grid[p.y][p.x+k+1]
      if (cell !== null && cell !== word[k]) return false
    }
    return true
  }

  place_h(word, number, p) {
    this.words.push(word)
    this.grid[p.y][p.x] = Clue(number)
    for (var k=0; k<word.length; k++) this.grid[p.y][p.x+k+1] = Letter(word[k])
    if (!isClue(this.grid[p.y][p.x+word.length+1]))
      this.grid[p.y][p.x+word.length+1] = Stop()
  }

  place_v(word, number, p) {
    this.words.push(word)
    this.grid[p.y][p.x] = Clue(number)
    for (var k=0; k<word.length; k++) this.grid[p.y+k+1][p.x] = Letter(word[k])
    if (!isClue(this.grid[p.y+word.length+1][p.x]))
      this.grid[p.y+word.length+1][p.x] = Stop()
  }

  score() {
    var result = 0
    for (var i=0; i<this.size; i++)
      for (var j=0; j<this.size; j++)
        result += isLetter(this.grid[j][i]) ? 1 : 0
    return result
  }
}
