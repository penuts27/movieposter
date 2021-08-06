const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const dataPannel = document.querySelector('.data-pannel')

const movies = JSON.parse(window.localStorage.getItem('favoriteMovies')) || []

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    // title,image
    rawHTML += `
        <div class='col-sm-3'>
            <div class='card'>
                <img src=${POSTER_URL}${item.image} class='card-img-top' alt='movie poster'>
                <div class='card-body'>
                    <h5 class='card-title'>${item.title}</h5>
                </div>
                <div class='card-footer'>
                    <button type='button' class='btn btn-primary btn-show-movie' data-bs-toggle='modal' data-bs-target='#movieModal' data-id=${item.id}>More</button>
                    <button type='button' class='btn btn-danger btn-remove-favorite' data-id=${item.id}>X</button> 
                    </div>
                </div>
        </div>
        `
  })

  dataPannel.innerHTML = rawHTML
}
function showMovieModal(id) {
  const movieTitle = document.getElementById('movie-modal-title')
  const movieImg = document.getElementById('movie-modal-img')
  const movieDate = document.getElementById('movie-modal-date')
  const movieDescription = document.getElementById('movie-modal-description')
  window.axios.get(INDEX_URL + id).then(response => {
    console.log(response)
    movieTitle.innerText = response.data.results.title
    movieImg.innerHTML = `<img src=${POSTER_URL + response.data.results.image} alt='movie-poster'><>`
    movieDate.innerText = 'Release at : ' + response.data.results.release_date
    movieDescription.innerText = response.data.results.description
  })
}
function removeFromFavorite(id) {
  const index = movies.findIndex(obj => obj.id === id)
  movies.splice(index, 1)
  renderMovieList(movies)
  window.localStorage.setItem('favoriteMovies', JSON.stringify(movies))
}

dataPannel.addEventListener('click', function onPannelClick(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  }
  if (e.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(e.target.dataset.id))
  }
})

renderMovieList(movies)
