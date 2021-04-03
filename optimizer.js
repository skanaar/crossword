function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function Optimizer({ seconds, onProgress = () => {} }) {
  return async function (algo) {
    var best = algo()
    var bestScore = best.score()
    var start = Date.now()
  
    while(true) {
      var candidate = algo()
      var score = candidate.score()
      if (score > bestScore) {
        best = candidate
        bestScore = score
      }
      var progress = (Date.now() - start) / (1+1000*seconds)
      if (progress < 1) {
        onProgress(progress)
        await timeout(0)
      } else {
        return best
      }
    }
  }
}
