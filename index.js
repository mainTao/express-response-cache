module.exports = maxAge => {
  let cacheUpdatedAt
  let statusCode
  let statusMessage
  let headers
  let body

  return function(req, res, next) {
    if(cacheUpdatedAt && Date.now() < cacheUpdatedAt + maxAge * 1000){
      res.writeHead(statusCode, statusMessage, headers)
      res.write(body)
      res.end()
    }
    else{
      const oldWrite = res.write
      const oldEnd = res.end

      const chunks = []

      res.write = function (chunk) {
        chunks.push(chunk)

        oldWrite.apply(res, arguments)
      }

      res.end = function (chunk) {
        if(res.statusCode < 400){
          if (chunk) {
            chunks.push(chunk)
          }

          cacheUpdatedAt = Date.now()
          statusCode = res.statusCode
          statusMessage = res.statusMessage
          headers = res._headers
          body = Buffer.concat(chunks).toString('utf8')
        }

        oldEnd.apply(res, arguments)
      }

      next()
    }
  }
}
