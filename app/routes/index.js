const movieRoute = require('./movie-route');

module.exports = function initRoutes(app) {
      app.use(movieRoute);
}
