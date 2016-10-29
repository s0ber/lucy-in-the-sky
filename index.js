const text = document.getElementById('lucy')
const createSpan = letter => `<span class="letter">${letter}</span>`
text.innerHTML = text.textContent.trim().split('').map(createSpan).join('')
const letters = document.querySelectorAll('.letter')

const getDirection = () => {
  const x = Math.random() * 6 - 3
  const y = Math.random() * 6 - 3
  return {x, y}
}

const normalizeVector = ({x, y}) => {
  const arcLength = Math.sqrt(x * x + y * y)
  return {x: x / arcLength, y: y / arcLength}
}

const move = () => {
  letters.forEach((letter) => {
    const {x, y} = normalizeVector(getDirection())
    letter.style.transform = `translate(${x}px, ${y}px)`
  })
  requestAnimationFrame(move)
}

move()

const lerp = (startPoint, endPoint, period) => {
  return {
    x: startPoint.x + (endPoint.x - startPoint.x) * period,
    y: startPoint.y + (endPoint.y - startPoint.y) * period
  }
}

let letterState = []
let deltaTime = 0
let lastTimeStamp = performance.now()
const animate = () => {
  const timeStamp = performance.now()
  deltaTime = timeStamp - lastTimeStamp
  lastTimeStamp = timeStamp

  letters.forEach((letter, i) => { })

  requestAnimationFrame(animate)
}
// animate()
