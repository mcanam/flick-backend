const express = require('express');
const fetch = require('node-fetch');
const movieProvider = require('@movie-web/providers');
const createError = require('../utils/error');

const API_URL = 'https://api.themoviedb.org/3/';
const API_KEY = process.env.TMDB_API_KEY;
const API_READ_KEY = process.env.TMDB_API_READ_ACCESS;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w300';

const movieRoute = express.Router();
const fetcher = movieProvider.makeStandardFetcher(fetch);

const providers = movieProvider.makeProviders({
      fetcher: fetcher,
      target: movieProvider.targets.NATIVE
});

function mapResponse(data) {
      if (!data || !('results' in data)) return [];

      return data.results.map(result => {
            return {
                  id: result.id,
                  title: result.title,
                  cover: IMAGE_URL + result.poster_path,
                  year: result.release_date.substring(0, 4)
            };
      });
};

movieRoute.get('/movie/discover', async (req, res, next) => {
      try {
            const url = API_URL + 'discover/movie';

            const options = {
                  method: 'GET',
                  headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer ' + API_READ_KEY
                  }
            };

            const response = await fetch(url, options);
            const data = await response.json();

            if (data.success == false) {
                  throw createError(400, data.status_message);
            }

            res.status(200).send({ status: 200, data: mapResponse(data) });
      }

      catch (error) { next(error) }
});

movieRoute.get('/movie/search/:title', async (req, res, next) => {
      try {
            const { title } = req.params;

            if (!title) {
                  throw createError(400, 'Missing movie title');
            }

            const url = API_URL + `search/movie?api_key=${API_KEY}&query=` + title;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success == false) {
                  throw createError(400, data.status_message);
            }
      
            res.status(200).send({ status: 200, data: mapResponse(data) });
      }

      catch (error) { next(error) }
});

movieRoute.get('/movie/watch/:id', async (req, res, next) => {
      try {
            const { id } = req.params;

            if (!id) {
                  throw createError(400, 'Missing movie id');
            }

            const media = {
                  type: 'movie',
                  tmdbId: id
            };

            const response = await providers.runAll({ media });
            const data = response ? response.stream : null;

            res.status(200).send({ status: 200, data });
      }

      catch (error) { next(error) }
});

module.exports = movieRoute;
