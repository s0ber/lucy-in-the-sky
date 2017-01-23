const text = document.getElementById('lucy')
const createSpan = letter => `<span class="letter">${letter}</span>`
text.innerHTML = text.textContent.trim().split('').map(createSpan).join('')
const letters = document.querySelectorAll('.letter')

const MOVEMENT_TIME = 600

const getDirection = () => {
  const x = Math.random() * 6 - 3
  const y = Math.random() * 6 - 3
  return {x, y}
}

const normalizeVector = ({x, y}) => {
  const arcLength = Math.sqrt(x * x + y * y)
  return {x: x / arcLength, y: y / arcLength}
}

let isWindowActive = true
window.onfocus = () => { isWindowActive = true }
window.onblur = () => { isWindowActive = false }

const bringJoy = (letters, movements = []) => {
  let nextMovements = []

  // do nothing when window loses focus
  if (isWindowActive) {
    if (movements.length === 0) {
      nextMovements = Array.from(letters).map(moveLetter)
    } else {
      nextMovements = movements.map(movement => movement())
    }
  }

  // reset "next movements", if window loses focus,
  // so new movements will be scheduled, when window will receive focus next time
  requestAnimationFrame(() => { bringJoy(letters, nextMovements) })
}

const moveLetter = (letter, {startPoint, endPoint, startTime, endTime} = {}) => {
  const curTime = performance.now()

  // prev movement is over
  if (endTime && curTime >= endTime) {
    // start from previous "frame", so letter will not stop for a moment
    return moveLetter(letter, {startPoint: endPoint, startTime: curTime - (1000 / 60)})
  }

  // very first movement started
  if (!startPoint) {
    startPoint = {x: 0, y: 0}
    // start from random time to make letters move more independent
    startTime = curTime - (MOVEMENT_TIME * Math.random())
  }

  // new movement started, schedule new direction
  if (!endPoint) {
    endPoint = normalizeVector(getDirection())
    endTime = startTime + MOVEMENT_TIME
  }

  const movementPos = (curTime - startTime) / MOVEMENT_TIME
  const x = startPoint.x + (endPoint.x - startPoint.x) * movementPos
  const y = startPoint.y + (endPoint.y - startPoint.y) * movementPos

  letter.style.transform = `translate(${x}px, ${y}px)`

  return () => {
    return moveLetter(letter, {startPoint, startTime, endPoint, endTime})
  }
}

bringJoy(letters)
