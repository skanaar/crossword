import { range } from './util.js'

export function Vec(x,y) { return {x,y} }

export const Vertical = (p, offset) => Vec(p.x, p.y+offset)
export const Horizontal = (p, offset) => Vec(p.x+offset, p.y)

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

  get(p) {
    return this.grid[p.y][p.x]
  }
  
  set(p, value) {
    this.grid[p.y][p.x] = value
  }

  find_v(word, modulo = 1, offset = 0) {
    for (var i=offset; i<this.size; i+=modulo)
      for (var j=0; j<this.size-word.length; j++)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j+l+1][i])))
          if (this.try(Vertical, word, Vec(i,j)))
            return Vec(i,j)
    return false
  }

  find_h(word, modulo = 1, offset = 0) {
    for (var i=0; i<this.size-word.length; i++)
      for (var j=offset; j<this.size; j+=modulo)
        if ([].some.call(word, (_,l) => isLetter(this.grid[j][i+l+1])))
          if (this.try(Horizontal, word, Vec(i,j))) return Vec(i,j)
    return false
  }

  try(offset, word, p) {
    if (!isFree(this.get(p))) return false
    var end = offset(p, word.length+2)
    if (end.x >= this.size || end.y >= this.size) return false
    var last = offset(p, word.length+1)
    if (isLetter(this.get(last))) return false
    for (var k=0; k<word.length; k++) {
      var cell = this.get(offset(p, k+1))
      if (cell !== null && cell !== word[k]) return false
    }
    return true
  }

  place(offset, word, number, p) {
    this.words.push(word)
    this.set(p, Clue(number))
    for (var k=0; k<word.length; k++)
      this.set(offset(p, k+1), Letter(word[k]))
    var end = offset(p, word.length+1)
    if (!isClue(this.get(end)))
      this.set(end, Stop())
  }

  score() {
    var result = 0
    for (var i=0; i<this.size; i++)
      for (var j=0; j<this.size; j++)
        result += isLetter(this.grid[j][i]) ? 1 : 0
    return result
  }
}
