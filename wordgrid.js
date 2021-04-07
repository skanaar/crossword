/* jshint undef: true */
import { range } from './util.js'

export function Vec(x,y) { return {x,y} }

export const Vertical = (p, offset) => Vec(p.x, p.y+offset)
Vertical.id = 'vertical'
export const Horizontal = (p, offset) => Vec(p.x+offset, p.y)
Horizontal.id = 'horizontal'
const offsets = { vertical: Vertical, horizontal: Horizontal }

export function isEmpty(c) { return c === null }
export function isClue(c) { return c && c.clue }
export function isStop(c) { return c && c.isStop }
export function isLetter(c) { return c && c.isLetter }
export function isMatch(c, letter) { return c.letter === letter }
export function isFree(c) { return isEmpty(c) || isStop(c) }
export function Empty() { return null }
export function Reserved() { return false }
export function Clue(number) {
  return { clue: number, intersection: false, toString() { return this.clue.toString() } }
}
export function Stop() { return { isStop: true, intersection: false } }
export function Letter(letter) {
  return {
    isLetter: true,
    letter,
    intersection: false,
    toString() { return this.letter }
  }
}

export class WordGrid {
  constructor({ size, reserved = [] }) {
    this.size = size
    this.grid = range(0, size).map(() => range(0, size).map(e => Empty()))
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
      if (isEmpty(cell) || (isLetter(cell) && isMatch(cell, word[k])))
        continue
      else
        return false
    }
    return true
  }

  place(offset, word, number, p) {
    this.words.push({ word, loc: p, direction: offset.id })
    if (isStop(this.get(p))){
      this.set(p, Clue(number))
      this.setIntersection(p, true)
    } else
      this.set(p, Clue(number))

    for (var k=0; k<word.length; k++) {
      var loc = offset(p, k+1)
      if (isLetter(this.get(loc)))
        this.setIntersection(loc, true)
      else
        this.set(loc, Letter(word[k]))
    }

    var end = offset(p, word.length+1)
    if (isClue(this.get(end)) || isStop(this.get(end)))
      this.setIntersection(end, true)
    else
      this.set(end, Stop())
  }

  pop() {
    var { word, direction, loc } = this.words.pop()
    var offset = offsets[direction]

    if (this.get(loc).intersection)
      this.set(loc, Stop())
    else
      this.set(loc, Empty())

    for (var k=0; k<word.length; k++) {
      var p = offset(loc, k+1)
      if (this.get(p).intersection)
        this.setIntersection(p, false)
      else
        this.set(p, Empty())
    }

    var end = offset(loc, word.length+1)
    if (isStop(this.get(end))){
      if (this.get(end).intersection) this.setIntersection(false)
      else this.set(end, Empty())
    }
    if (isClue(this.get(end))){
      this.setIntersection(end, false)
    }
  }

  score() {
    var result = 0
    for (var i=0; i<this.size; i++)
      for (var j=0; j<this.size; j++)
        result += isLetter(this.grid[j][i]) ? 1 : 0
    return result
  }
}
