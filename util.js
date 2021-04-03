export function range(from, to) {
  return ' '.repeat(to-from).split('').map((e,i) => i)
}

export function sample(list) {
  return list[Math.floor(list.length*Math.random())]
}

export function shuffle(list) {
  var input = [...list]
  var result = []
  while(input.length) {
    var i = Math.floor(input.length*Math.random())
    result.push(input[i])
    input.splice(i, 1)
  }
  return result
}
