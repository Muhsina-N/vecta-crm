export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ')
    return res.status(400).json({ message })
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' })
  if (err.code === 11000) return res.status(400).json({ message: 'That email is already registered' })
  console.error(err)
  res.status(500).json({ message: 'Server error' })
}
