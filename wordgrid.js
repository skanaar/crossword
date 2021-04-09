/* jshint -W083, undef: true */
function seq(size, factory) {
  return Array(size).fill(0).map(factory)
}

export function Vec(x,y) { return {x,y} }

export const Vertical = (p, offset) => Vec(p.x, p.y+offset)
Vertical.id = 'vertical'
export const Horizontal = (p, offset) => Vec(p.x+offset, p.y)
Horizontal.id = 'horizontal'
const offsets = { vertical: Vertical, horizontal: Horizontal }

export function isEmpty(c) { return c === null }
export function isBlock(c) { return c && !!c.clues }
export function isLetter(c) { return c && ('string' == typeof c.letter) }
export function isMatch(c, letter) { return c.letter === letter }

export function Empty() { return null }
export function Reserved() { return false }
export function Block() {
  return {
    clues: { horizontal: null, vertical: null },
    uses: 0,
  }
}
export function Letter(letter) {
  return {
    letter,
    intersection: false,
    toString() { return this.letter }
  }
}

export class WordGrid {
  constructor({ size, reserved = [] }) {
    this.size = size
    this.grid = seq(size, () => seq(size, () => Empty()))
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
  
  setIntersection(p, intersecting) {
    this.grid[p.y][p.x].intersection = intersecting
  }

  try(direction, word, p) {
    var start = this.get(p)
    if (!(isEmpty(start) || isBlock(start))) return false
    var end = direction(p, word.length+1)
    if (end.y >= this.size) return false
    if (end.x >= this.size) return false
    var last = direction(p, word.length+1)
    if (isLetter(this.get(last))) return false
    for (var k=0; k<word.length; k++) {
      var cell = this.get(direction(p, k+1))
      if (isEmpty(cell) || (isLetter(cell) && isMatch(cell, word[k])))
        continue
      else
        return false
    }
    return true
  }

  place(direction, word, number, p) {
    this.words.push({ word, loc: p, direction: direction.id })
    if (isEmpty(this.get(p))){
      this.set(p, Block())
    }
    this.get(p).clues[direction.id] = number
    this.get(p).uses++

    for (var k=0; k<word.length; k++) {
      var loc = direction(p, k+1)
      if (isLetter(this.get(loc)))
        this.setIntersection(loc, true)
      else
        this.set(loc, Letter(word[k]))
    }

    var end = direction(p, word.length+1)
    if (isEmpty(this.get(end))) {
      this.set(end, Block())
    }
    this.get(end).uses++
  }

  removeLastWord() {
    var { word, direction, loc } = this.words.pop()
    var offset = offsets[direction]

    var start = this.get(loc)
    start.clues[direction] = null
    start.uses--
    if (start.uses == 0) this.set(loc, Empty())

    for (var k=0; k<word.length; k++) {
      var p = offset(loc, k+1)
      if (this.get(p).intersection)
        this.setIntersection(p, false)
      else
        this.set(p, Empty())
    }

    var endLoc = offset(loc, word.length+1)
    var end = this.get(endLoc)
    end.uses--
    if (end.uses == 0) this.set(endLoc, Empty())
  }

  score() {
    var result = 0
    for (var i=0; i<this.size; i++)
      for (var j=0; j<this.size; j++)
        result += isLetter(this.grid[j][i]) ? 1 : 0
    return result
  }
}
