const express = require('express')
const router = express.Router()
const ApiKeyTMDB = '8b3e4cee4754a035bb9ad2a02fd1e7f3'
const request = require('request')


router.route('/randomFilm').get(function(req, res){

	function TMDBApiCall(apiUrl,callback){
		request(apiUrl, { json: true }, (err, res, body) => {
			if (err) { return console.log(err) }
			return callback(body)
		})
	}
	let apiUrl = 'https://api.themoviedb.org/3/movie/latest?api_key='+ApiKeyTMDB+'&language=en-US'
	TMDBApiCall(apiUrl, function(response){
		console.log('currentMaxFilmId: '+response.id)
		let randomFilmId = Math.floor((Math.random() * response.id) + 0)
		console.log('randomFilmId: '+randomFilmId)
		console.log('https://api.themoviedb.org/3/movie/'+randomFilmId+'?api_key='+ApiKeyTMDB+'&language=en-US&language=en-US')

		TMDBApiCall('https://api.themoviedb.org/3/movie/'+randomFilmId+'?api_key='+ApiKeyTMDB+'&language=en-US&language=en-US', function(response){
			//all film information
			console.log('Title: '+response.original_title)
			if(response.original_title && response.overview && response.poster_path){
				console.log('has title, description and poster')
			}
			res.render('randomFilm', {
				pageName: 'Random Films', 
				filmTitle: response.original_title,
				description: response.overview,
				posterUrl: 'http://image.tmdb.org/t/p/w300'+response.poster_path
			})
		})
	})
})

module.exports = router