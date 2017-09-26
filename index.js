const createSpan = (letter) => {
  if (letter === ' ' || letter === '\n') {
    return letter
  } else {
    return '<span class="letter" style="display: inline-block; position: relative;">' +
      `<span style="position: absolute; left: 0; top: 0; color: #0f0;">${letter}</span>` +
      `<span style="position: absolute; left: 0; top: 0; color: #f0f;">${letter}</span>` +
      `<span style="position: relative;">${letter}</span>` +
    '</span>'
  }
}

const wrapIntoSpan = (node) => {
  let span = document.createElement('span')
  node.parentNode.insertBefore(span, node)
  span.appendChild(node)
  return span
}

const createLetters = (span) => {
  span.innerHTML = span.textContent.trim().split('').map(createSpan).join('')
}

const letterize = (node) => {
  node.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      let span = wrapIntoSpan(node)
      createLetters(span)
    } else {
      letterize(node)
    }
  })
}

letterize(document.body)

const letters = document.querySelectorAll('.letter')

const JITTER_TIME = 1000
const X_PERIOD = 20000
const Y_PERIOD = 12000
const GLITCH_OFFSET = 1 //px
const LETTER_MOVEMENT_RADIUS = 1.5

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

const markLettersInsideViewport = () => {
  let rect
  for (i = 0; i < letters.length; i++) {
    rect = letters[i].getBoundingClientRect()
    letters[i]._isInsideViewport = rect.top >= 0 && rect.bottom <= window.innerHeight
  }
}

markLettersInsideViewport()
window.onscroll = markLettersInsideViewport
window.onresize = markLettersInsideViewport

const bringJoy = (letters, movements = []) => {
  let nextMovements = []

  // do nothing when window loses focus
  if (isWindowActive) {
    if (movements.length === 0) {
      const letterArray = Array.from(letters)
      nextMovements = letterArray.map(moveLetter)
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

  if (letter._isInsideViewport) {
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
    endPoint = {x: endPoint.x * LETTER_MOVEMENT_RADIUS, y: endPoint.y * LETTER_MOVEMENT_RADIUS}
    endTime = startTime + JITTER_TIME
  }

  const timeDelta = curTime - startTime
  const movementPos = timeDelta / JITTER_TIME
  const x = startPoint.x + (endPoint.x - startPoint.x) * movementPos
  const y = startPoint.y + (endPoint.y - startPoint.y) * movementPos

  letter.style.transform = `translate(${x}px, ${y}px)`
  moveGlitches(letter)
  }

  return () => {
    return moveLetter(letter, {startPoint, startTime, endPoint, endTime})
  }
}

let glitchesStartTime

const moveGlitches = (letter) => {
  const curTime = performance.now()

  // initialize the movement
  if (!glitchesStartTime) {
    glitchesStartTime = curTime
  }

  if (letter._isInsideViewport) {
    const glitches = [letter.children[0], letter.children[1]]

  const timeDelta = curTime - glitchesStartTime
  const xPos = timeDelta / X_PERIOD
  const yPos = timeDelta / Y_PERIOD

  for (let i = 0, glitch; glitch = glitches[i]; i++) {
    const angleShift = i / glitches.length * TAU

    const x = Math.sin(angleShift + xPos * TAU) * GLITCH_OFFSET
    const y = Math.cos(Math.PI + angleShift + yPos * TAU) * GLITCH_OFFSET

    glitch.style.transform = `translate(${x}px, ${y}px)`
  }
  }
}

bringJoy(letters)
