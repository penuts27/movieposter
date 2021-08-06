// GLOBAL
const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const dataPannel = document.querySelector('.data-pannel')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('movie-search-input')
const paginator = document.getElementById('paginatior')
const socialMode = document.getElementById('social-mode')

const movies = [] // 用來儲存全部的movie資料
let filerMovies = [] // 用來儲存經過搜尋所得到的資料
const MOVIES_PER_PAGE = 12 // 單謝顯示資料數量
let mode = 'gallery' // 用來辨識要使用清單模式還是格子模式
let currentPage = 1 // 記錄當前頁數
// INIT
window.axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderGalleryView(getMovieByPage(1))
    renderPaginator(movies.length, 1)
  })
  .catch((error) => {
    console.log(error)
  })
// FUNTION
function renderListView(data) {
  dataPannel.innerHTML = ''
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
        <div class="card rounded-0 border-end-0 border-start-0">
         <div class="card-body d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">${item.title}</h5>
          <div class="button-group">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movieModal" data-id=${item.id}>More</button>
              <button type="button" class="btn btn-success btn-favorite" data-id=${item.id}>+</button> 
          </div>
          </div> 
        </div>
      `
  })
  dataPannel.innerHTML = rawHTML
}
function renderGalleryView(data) {
  dataPannel.innerHTML = ''
  let rawHTML = ''
  data.forEach((item) => {
    // title,image
    rawHTML += `
          <div class="col-sm-3">
            <div class="card mb-4">
              <img src=${POSTER_URL}${item.image} class="card-img-top" alt="movie poster">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                  <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movieModal" data-id=${item.id}>More</button>
                  <button type="button" class="btn btn-success btn-favorite" data-id=${item.id}>+</button> 
                </div>
            </div>
        </div>
        `
  })
  dataPannel.innerHTML = rawHTML
}
// 換頁 搜尋皆偵測模並傳入currentPage後渲染畫面
function viewCheck() {
  if (mode === 'gallery') {
    renderGalleryView(getMovieByPage(currentPage))
  } else {
    renderListView(getMovieByPage(currentPage))
  }
}
function renderPaginator(length) {
  const pageLength = Math.ceil(length / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let i = 0; i < pageLength; i++) {
    rawHTML += `
    <li class='page-item'><a class='page-link' href='#' data-page='${i + 1}'>${i + 1
      }</a></li>
    `
    paginator.innerHTML = rawHTML
  }
  paginator.children[currentPage - 1].classList.add('active')
}
function showMovieModal(id) {
  const movieTitle = document.getElementById('movie-modal-title')
  const movieImg = document.getElementById('movie-modal-img')
  const movieDate = document.getElementById('movie-modal-date')
  const movieDescription = document.getElementById('movie-modal-description')
  window.axios.get(INDEX_URL + id).then((response) => {
    movieTitle.innerText = response.data.results.title
    movieImg.innerHTML = `<img src=${POSTER_URL + response.data.results.image
      } alt='movie-poster'><>`
    movieDate.innerText = 'Release at : ' + response.data.results.release_date
    movieDescription.innerText = response.data.results.description
  })
}
function getMovieByPage(page) {
  const data = filerMovies.length ? filerMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const endIndex = page * MOVIES_PER_PAGE - 1
  console.log('data', startIndex, endIndex + 1)
  return data.slice(startIndex, endIndex + 1)
}
function addToFavorite(id) {
  // 建立清單儲存喜愛資料
  const list = JSON.parse(window.localStorage.getItem('favoriteMovies')) || []
  // 取出所選電影資料
  const slectedMovied = movies.find((obj) => obj.id === id)
  // 除錯：若已加入則提示
  if (list.some((obj) => obj.id === id)) {
    window.alert('已加入過收藏清單')
  } else {
    // 將所選存進資料再存入localstorage
    list.push(slectedMovied)
    const stringigyData = JSON.stringify(list)
    window.localStorage.setItem('favoriteMovies', stringigyData)
  }
}

// LISTEN
dataPannel.addEventListener('click', function onPannelClick(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(e.target.dataset.id)
  }
  if (e.target.matches('.btn-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
  // clear browser default refresh
  e.preventDefault()
  const keywords = searchInput.value.trim().toLowerCase()
  filerMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keywords)
  })
  if (filerMovies.length === 0) {
    window.alert('查無資料')
  }
  currentPage = 1 // 原本頁面為某頁,搜尋過後強制轉為第一頁,須放置在viewcheck前面否則getMovieByPage會切到原本的頁面導致沒有畫面
  viewCheck()
  renderPaginator(filerMovies.length)
})
paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  currentPage = Number(e.target.dataset.page)
  viewCheck()
  renderPaginator(movies.length, currentPage)
})

socialMode.addEventListener('click', function onTranslateModeClicked(e) {
  const gallery = document.querySelector('.card-mode')
  const list = document.querySelector('.list-mode')
  if (e.target.matches('.card-mode')) {
    mode = 'gallery'
    viewCheck()
    list.classList.remove('active')
    e.target.classList.add('active')
  }
  if (e.target.matches('.list-mode')) {
    mode = 'list'
    viewCheck()
    gallery.classList.remove('active')
    e.target.classList.add('active')
  }
})
