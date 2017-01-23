const text = document.getElementById('lucy')
const createSpan = letter => `<span class="letter"><span class="base">${letter}</span><span class="glitch">${letter}</span><span class="glitch">${letter}</span></span>`
text.innerHTML = text.textContent.trim().split('').map(createSpan).join('')
const letters = document.querySelectorAll('.letter')

const JITTER_TIME = 600
const X_PERIOD = 10000
const Y_PERIOD = 6000
const GLITCH_OFFSET = 1.5 //px

const TAU = 2 * Math.PI

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
      const letterArray = Array.from(letters)
      nextMovements = letterArray.map(moveLetter).concat(letterArray.map(moveGlitches))
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
    startTime = curTime - (JITTER_TIME * Math.random())
  }

  // new movement started, schedule new direction
  if (!endPoint) {
    endPoint = normalizeVector(getDirection())
    endTime = startTime + JITTER_TIME
  }

  const timeDelta = curTime - startTime
  const movementPos = timeDelta / JITTER_TIME
  const x = startPoint.x + (endPoint.x - startPoint.x) * movementPos
  const y = startPoint.y + (endPoint.y - startPoint.y) * movementPos

  letter.style.transform = `translate(${x}px, ${y}px)`

  return () => {
    return moveLetter(letter, {startPoint, startTime, endPoint, endTime})
  }
}

const moveGlitches = (letter, {startTime} = {}) => {
  const curTime = performance.now()
  const glitches = letter.querySelectorAll('.glitch')

  // initialize the movement
  if (!startTime) {
    return moveGlitches(letter, {startTime: curTime})
  }

  const timeDelta = curTime - startTime
  const xPos = timeDelta / X_PERIOD
  const yPos = timeDelta / Y_PERIOD

  for (let i = 0, glitch; glitch = glitches[i]; i++) {
    const angleShift = i / glitches.length * TAU

    const x = Math.sin(angleShift + xPos * TAU) * GLITCH_OFFSET
    const y = Math.cos(Math.PI + angleShift + yPos * TAU) * GLITCH_OFFSET

    glitch.style.transform = `translate(${x}px, ${y}px)`
  }

  return () => moveGlitches(letter, {startTime})
}

bringJoy(letters)
