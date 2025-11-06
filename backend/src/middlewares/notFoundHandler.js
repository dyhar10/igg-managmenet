function notFoundHandler(_req, res) {
  res.status(404).json({
    message: 'Resource tidak ditemukan',
  });
}

module.exports = notFoundHandler;
