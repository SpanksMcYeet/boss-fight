import Canvas from './canvas.js'

const canvas = document.getElementById('canvas')
const c = new Canvas(canvas)
let mousePos = { x: 0, y: 0 }
let mouseEvent = { l: false, r: false }
let width = 1600
let height = 750
let frameCounter = 0
const fps = 60

// Smoothstep function: it makes things that are supposed to animate start slower, speed up in the middle, and slow down again at the end (graph 3x^2 - 2x^3 on Desmos)
const smoothStep = x => x > 1 ? 1 : x > 0 ? 3 * x * x - 2 * x * x * x : 0

const randomRadial = range => {
  let angle = Math.random() * Math.PI * 2
  return {
    x: Math.cos(angle) * range,
    y: Math.sin(angle) * range,
  }
}
const getDistance = (p1, p2) => {
  let dx = p2.x - p1.x
  let dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

const follow = (p1, p2, range) => {
  let ranLoc = randomRadial(range)
  let locationTo = {
    x: ranLoc.x + p2.x,
    y: ranLoc.y + p2.y,
  }
  return locationTo
}
const colors = {
  _: '#7adbbc',
  _: '#b9e87e',
  _: '#e7896d',
  _: '#fdf380',
  _: '#b58efd',
  _: '#ef99c3',
  _: '#e8ebf7',
  _: '#aa9f9e',
  white: '#ffffff',
  black: '#484848',
  blue: '#3ca4cb',
  green: '#8abc3f',
  red: '#e03e41',
  yellow: '#efc74b',
  purple: '#8d6adf',
  pink: '#cc669c',
  gray: '#a7a7af',
  _: '#726f6f',
  lgray: '#dbdbdb',
  pureBlack: '#000000',
}
const mixColors = (hex1, hex2, weight2 = 0.5) => {
  if (weight2 <= 0) return hex1
  if (weight2 >= 1) return hex2
  let weight1 = 1 - weight2
  let int1 = parseInt(hex1.slice(1, 7), 16)
  let int2 = parseInt(hex2.slice(1, 7), 16)
  let int =
    (((int1 & 0xff0000) * weight1 + (int2 & 0xff0000) * weight2) & 0xff0000) |
    (((int1 & 0x00ff00) * weight1 + (int2 & 0x00ff00) * weight2) & 0x00ff00) |
    (((int1 & 0x0000ff) * weight1 + (int2 & 0x0000ff) * weight2) & 0x0000ff)
  return '#' + int.toString(16).padStart(6, '0')
}

canvas.addEventListener('click', e => {
  mouseEvent.l = true
})
canvas.addEventListener('contextmenu', e => {
  e.preventDefault()
  mouseEvent.r = true
})
canvas.addEventListener('mousemove', e => {
  mousePos.x = e.clientX * window.devicePixelRatio
  mousePos.y = e.clientY * window.devicePixelRatio
})

const getDirection = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

const Player = class {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.size = 5
    this.color = '#00b0e1'
  }
  update() {
    this.x = mousePos.x
    this.y = mousePos.y
    c.circle(this.x, this.y, this.size, colors.blue, mixColors(colors.blue, colors.black, 0.65), 6)
  }
}
const p = new Player(mousePos.x, mousePos.y)

const Boss = class {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.start = { x: 0, y: 0, }
    this.goal = { x: 0, y: 0, }
    this.beamLength = 0
    this.to = 0
    this.size = 20
    this.color = '#ff0000'
    this.occupied = 'idle'
    this.projectiles = []
    this.firingCycle = false
  }
  update(timeElapsed, time) {
    this.think(timeElapsed, time)
    this.updateProjectiles()
    c.box(this.x, this.y, this.size, this.size, 0, this.color)
  }
  think(timeElapsed, time) {
    if (frameCounter % (fps * 3) === 0 && this.occupied === 'idle') {
      this.occupied = 'energyBeam'
    } else if (frameCounter % (fps * 1) === 0 && this.occupied !== 'energyBeam' && this.occupied !== 'fireProjectiles') {
      this.occupied = 'fireProjectiles'
    }
    if (getDistance({ x: this.start.x, y: this.start.y }, { x: p.x, y: p.y }) >= 200 && this.occupied === 'idle' && this.occupied !== 'energyBeam') { // do we need to idle or move near the player?
      this.goal = follow({ x: this.start.x, y: this.start.y }, { x: p.x, y: p.y }, 150) // choose a suitable spot
      this.occupied = 'move' 
    }
    switch(this.occupied) { // check if we're doing something
      case 'idle':
        
        break
      case 'move':
        if (getDistance({ x: this.x, y: this.y }, this.goal) <= 25) {
          this.occupied = 'idle'
          this.to = 0
          this.start.x = this.x
          this.start.y = this.y
        } else {
          this.move(timeElapsed)
        }
        break
      case 'energyBeam':
        if (this.beamLength > 450) {
          this.occupied = 'idle'
          this.to = 0
          this.beamLength = 0
        } else {
          this.energyBeam(timeElapsed)
        }
        break
      case 'fireProjectiles':
        this.fireProjectiles()
        this.occupied = 'move'
        break
      case 'homingTorpedos':
        this.fireProjectiles(true)
        this.occupied = 'move'
        break
    } 
  }
  move(timeElapsed) { 
    this.to += timeElapsed / 600
    this.to = Math.max(Math.min(this.to, 1), 0)
    this.x = this.start.x + smoothStep(this.to) * (this.goal.x - this.start.x)
    this.y = this.start.y + smoothStep(this.to) * (this.goal.y - this.start.y)
  }
  energyBeam(timeElapsed) {
    let randomRot = Math.random() * Math.PI * 2
    this.to += timeElapsed / 1e5
    this.to = Math.max(Math.min(this.to, 1), 0)
    this.beamLength = this.beamLength + smoothStep(this.to) * (500 - this.beamLength)
    for (let i = 0; i < 8; i++)
      c.box(this.x, this.y, 6, this.beamLength, (Math.PI * 2 / 8) * i + randomRot, colors.yellow, mixColors(colors.yellow, colors.black, 0.65), 6)
  }
  fireProjectiles(homing) {
    for (let i = 0; i < 16; i++)
      this.projectiles.push({ x: this.x, y: this.y, homing: true })
  }
  updateProjectiles() {
    for (let [i, projectile] of this.projectiles.entries()) {
      projectile.x = projectile.x + Math.cos((Math.PI * 2 / 16) * i) * 1.6
      projectile.y = projectile.y + Math.sin((Math.PI * 2 / 16) * i) * 1.6
      c.circle(projectile.x, projectile.y, 6, colors.yellow, mixColors(colors.yellow, colors.black, 0.65), 6)
    }
  }
}
const b = new Boss(150, 150)

const render = timeElapsed => {
  p.update()
  b.update(timeElapsed)
}

let time = 0
let gameLoop = newTime => {
  let timeElapsed = time ? newTime - time : 0
  time = newTime
  
  let ratio = c.setSize(window.innerWidth, window.innerHeight, window.devicePixelRatio)
  width = 1600
  height = 750
  if (width < height * ratio) {
    height = width / ratio
  } else {
    width = height * ratio
  }
  c.box(0, 0, 12000, 12000, 0, mixColors(colors.lgray, colors.pureBlack, 0.1))
  c.box(0, 0, 6000, 6000, 0, colors.lgray)
  for (let i = -300; i <= 300; i++) {
    c.box(0, i * 7.5, 12000, 2, 0, mixColors(colors.lgray, colors.pureBlack, 0.1))
    c.box(i * 7.5, 0, 2, 12000, 0, mixColors(colors.lgray, colors.pureBlack, 0.1))
  }
  render(timeElapsed)
  requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)

setInterval(() => {
  frameCounter++
}, 1e3 / fps)
