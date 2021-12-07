const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'Music_Player';
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Bước qua nhau',
            singer: 'Vũ',
            path: './assets/music/Song1.mp3',
            image: './assets/pictures/Song1.jpg'
        },
        {
            name: 'LONELY',
            singer: 'QNT & Razts',
            path: './assets/music/Song2.mp3',
            image: './assets/pictures/Song2.jpg'
        },
        {
            name: 'Có hẹn với thanh xuân',
            singer: 'Monstar',
            path: './assets/music/Song3.mp3',
            image: './assets/pictures/Song3.jpg'
        },
        {
            name: 'Cưới thôi',
            singer: 'Masew & BRay',
            path: './assets/music/Song4.mp3',
            image: './assets/pictures/Song4.jpg'
        },
        {
            name: 'Hello Bitches',
            singer: 'CL',
            path: './assets/music/Song5.mp3',
            image: './assets/pictures/Song5.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= ${index}>
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
        });
        playlist.innerHTML = htmls.join('\n');
    },

    handleEvents: function() {
        let cdWidth = cd.offsetWidth;
        let _this = this;

        //cd animation:
        let cdAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity // loop bnhieu lan
        });
        cdAnimate.pause();

        //Xử lý thu phóng cd:
        document.onscroll = function() {
            let scrollTop = window.scrollY;
            // console.log(document.documentElement.scrollTop);
            let newcdWidth = cdWidth - scrollTop;
            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
            cd.style.opacity = newcdWidth / cdWidth;
        };

        //Play-Pause song:
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        };
        
        //Khi play song thì lắng nghe 2 sự kiện:
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdAnimate.play();
        };
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdAnimate.pause();
        };

        //Tiến độ bài hát (lắng nghe sk):
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        };

        //Tua bài hát: 
        progress.onchange = function(e) {
            let seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        };

        //Next song: 
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandom();
            }
            else {
                _this.nextSong();
            }
            audio.play();
            _this.render();  //Active song.
            _this.scrollToActiveSong();
        };

        //Prev song: 
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandom();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        //Random song: 
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom); //true thi add, false thi xoa
        };

        //Next song when ended: 
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            }
            else {
                nextBtn.click();  //Giong viec tu bam nut next
            }
        };

        //Repeat song: 
        repeatBtn.onclick = function() {
            _this.isRepeat = ! _this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        //Scrool view into active song: 

        //Click vao playlist:
        playlist.onclick = function(e) { 
            let songElement = e.target.closest('.song:not(.active)'); 
            if(songElement && !e.target.closest('.option')) {
                //Dkien 2 co the dua vao trong lam 1 dkien khac,cho Th song dc select co the chon option
                //Click song:
                if(songElement) {
                    _this.currentIndex = Number(songElement.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                };
            };
        };
    },

    //Next:
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        };
        this.loadCurrentSong();
    },

    //Prev:
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        };
        this.loadCurrentSong();
    },

    //Random:
    playRandom: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    //scrollToActiveSong:
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 300)
    },

    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function() {
        //Gán cấu hình từ config vào app:
        this.loadConfig();
        //Định nghĩa thuộc tính cho obj
        this.defineProperties();
        //Lắng nghe và xử lý sự kiện
        this.handleEvents();
        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng:
        this.loadCurrentSong();
        //Render playlist UI:
        this.render();

        //Hiển thị trạng thái ban đầu của 2 nút repeat và random:
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
};
app.start();

