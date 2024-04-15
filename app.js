// 1. Render song
// 2. Scroll top
// 3. Play / pause / Seek 
// 4. CD rotate 
// 5. Next / Prev 
// 6. Random
// 7. Next / Repeat when ended 
// 8. active song
// 9. scroll active song into view
// 10. play song when click
const PLAYER_STORAGE_KEY = 'TRUONG-PLAYER'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false, 
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name:'Bạn đời',
        singer:'Karik',
        path:'./assets/music/song1.mp3',
        image:'./assets/img/song1.jpg',
    },
    {
        name:'Chúng ta của tương lai',
        singer:'Sơn Tùng MTP',
        path:'./assets/music/song2.mp3',
        image:'./assets/img/song2.jpg',
    },
    {
        name:'Rồi ta sẽ ngắm pháo hoa cùng nhau',
        singer:'O.Lew',
        path:'./assets/music/song3.mp3',
        image:'./assets/img/song3.jpg',
    },
    {
        name:'Nhắn nhủ',
        singer:'RonBoogz',
        path:'./assets/music/song4.mp3',
        image:'./assets/img/song4.jpg',
    },
    {
        name:'Từng là',
        singer:'Vũ Cát Tường',
        path:'./assets/music/song5.mp3',
        image:'./assets/img/song5.jpg',
    }],
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
        
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return`
                <div class="song  ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div> 
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvent: function(){
        _this = this
        const cdWidth = cd.offsetWidth
        // Xử lí phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY||document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0; 
            cd.style.opacity = newCdWidth / cdWidth
        }
        // quay cd rotate
        const cdThumbAnimate = cdThumb.animate([
            {transform:'rotate(360deg'}
        ], {
            duration: 10000,
            iterations: Infinity// số lần lặp
        })
        cdThumbAnimate.pause();
        // Xử lí lặp lại bài hát
        repeatBtn.onclick = function(){
                _this.isRepeat = !_this.isRepeat
                _this.setConfig('isRepeat', _this.isRepeat)
                repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        //Xử lí khi prev btn
        prevBtn.onclick = function(){
            if (_this.isRandom){
                _this.randomSong()
            }else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        }
        // Xử lí khi click play
        playBtn.onclick = function(){
           if( _this.isPlaying){
               audio.pause()
           }else{
                audio.play()
           }
        }
        // Xử lí next btn
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.randomSong()
            }else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        }
        // Khi được played
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // Xử lí next song khi ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else {
                nextBtn.click()
            }
        }
        //Xử lí nút random song
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
            
        }
        // lắng nghe hành vi khi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode||e.target.closest('.option')){
                //khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index) // có thể getAtribute
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                //khi click vào option
                if(e.target.closest('.option')){

                }
            }

        }
        // Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function(){
            if(audio.duration > 0){
                const progressPercent = Math.floor((audio.currentTime/audio.duration)*100)
                progress.value = progressPercent
            }
            
        }
        // Xử lí khi tua 
        progress.onchange= function(e){
            const seekTime = audio.duration/100 * e.target.value
            audio.currentTime = seekTime
        }
    },
    loadCurrentSong: function(){
       
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (
            newIndex === this.currentIndex
        )
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'center'
            })
        }, 300);
    },

    start: function(){
        //cài đặt các mặc định 
        this.loadConfig()
        // Định nghĩa các thuộc tính 
        this.defineProperties()
        // lắng nghe và xử lí các sự kiện
        this.handleEvent()
        //
        this.loadCurrentSong();
        //render playlist
        this.render()
        randomBtn.classList.toggle('active', _this.isRandom)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }
}
app.start();
