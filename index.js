const BASE_URL = 'https://movie-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/movies/'
const Poster_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const SearchForm = document.querySelector('#search-form')
const SearchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

SearchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = SearchInput.value.trim().toLowerCase()


  if (!keyword.length) {
    return alert('請輸入關鍵字！')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


function renderMovieList(data) {

  let rawHTML = ''

  data.forEach(item => {

    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img class="card-img-top"
            src="${Poster_URL + item.image}"
            alt="Movie poster">
          <div class ="card-body">
          <h5 class ="card-title">${item.title}</h5>
          </div>
          <div class ="card-footer">
          <button class ="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
          <button class ="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
          </div>
        </div>
      </div>
    </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  // page 1 >> 顯示 0-11 部
  // page 2 >> 顯示 12-23 部
  // page 3 >> 顯示 24-35 部
  //...
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const ModalTitle = document.querySelector('#movie-modal-title')
  const ModalImage = document.querySelector('#movie-modal-image')
  const ModalDate = document.querySelector('#movie-modal-date')
  const ModalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(Index_URL + id)
    .then(response => {
      const data = response.data.results
      ModalTitle.innerText = data.title
      ModalDate.innerText = 'Release Date:' + data.release_date
      ModalDescription.innerText = data.description
      ModalImage.innerHTML = `
      <img src="${Poster_URL + data.image}" alt="movie-poster" class="img-fluid">
      `


    })
    .catch((err) => console.log(err))
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))

  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

axios
  .get(Index_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))