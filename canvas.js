const Canvas = class {
  constructor(canvas) {
    this.canvas = canvas
    this.width = 300
    this.height = 150
    this.scale = 1
   
    this.ctx = canvas.getContext('2d')
    this.ctx.lineJoin = 'round'
  }
  setSize(width, height, scale) {
    if (this.width !== width || this.height !== height || this.scale !== scale) {
      this.width = width
      this.height = height
      this.scale = scale
      
      let cWidth = Math.ceil(width * scale)
      let cHeight = Math.ceil(height * scale)
      this.canvas.width = cWidth
      this.canvas.height = cHeight
      this.canvas.style.width = `${cWidth / scale}px`
      this.canvas.style.height = `${cHeight / scale}px`

      this.ctx.lineJoin = 'round'
    }
    return width / height
  }
  setViewport(x, y, width, height) {
    let sx = this.width * this.scale / width
    let sy = this.height * this.scale / height
    this.ctx.setTransform(sx, 0, 0, sy, -x * sx, -y * sy)
  }
  circle(x, y, radius, fill = null, stroke = null, border = 0) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    if (stroke != null) {
      this.ctx.lineWidth = border
      this.ctx.strokeStyle = stroke
      this.ctx.stroke()
    }
    if (fill != null) {
      this.ctx.fillStyle = fill
      this.ctx.fill()
    }
  }
  rect(x, y, width, height, angle, fill = null, stroke = null, border = 0) {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.translate(x, y)
    this.ctx.rotate(angle)
    this.ctx.rect(0, 0, width, height)
    if (stroke != null) {
      this.ctx.lineWidth = border
      this.ctx.strokeStyle = stroke
      this.ctx.stroke()
    }
    if (fill != null) {
      this.ctx.fillStyle = fill
      this.ctx.fill()
    }
    this.ctx.restore()
  }
  box(x, y, width, height, angle, fill = null, stroke = null, border = 0, alpha = 1) {
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    this.ctx.beginPath()
    this.ctx.translate(x, y)
    this.ctx.rotate(angle)
    this.ctx.rect(width * -0.5, height * -0.5, width, height)
    if (stroke != null) {
      this.ctx.lineWidth = border
      this.ctx.strokeStyle = stroke
      this.ctx.stroke()
    }
    if (fill != null) {
      this.ctx.fillStyle = fill
      this.ctx.fill()
    }
    this.ctx.restore()
  }
  polygon(sides, size, x, y, fill = null, stroke = null, border = 0) {
    this.ctx.beginPath()
    this.ctx.moveTo (x + size, y + size * 0)
    for (let i = 1; i <= sides; i++)
      this.ctx.lineTo(x + size * Math.cos(i * 2 * Math.PI / sides), y + size * Math.sin(i * 2 * Math.PI / sides))
    this.ctx.closePath() 
    if (stroke != null) {
      this.ctx.lineWidth = border
      this.ctx.strokeStyle = stroke
      this.ctx.stroke()
    }
    if (fill != null) {
      this.ctx.fillStyle = fill
      this.ctx.fill()
    }
  }
  text(x, y, size, text) {
    this.ctx.font = `bold ${size}px Ubuntu`
    this.ctx.textAlign = 'center'
    this.ctx.lineWidth = size * 0.35
    this.ctx.strokeStyle = '#3a3a3a'
    this.ctx.fillStyle = '#f6f6f6'
    this.ctx.beginPath()
    this.ctx.strokeText(text, x, y)
    this.ctx.fillText(text, x, y)
  }
}

export default Canvas
