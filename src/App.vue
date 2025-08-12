<script setup>

</script>

<template>
    <div class="viewfinder" @click="fullscreenView">
        <img ref="video" src="http://localhost:8000/stream" autoplay></img>
    </div>
    <div class="status-message">
        <h1>
            STATUS
        </h1>
        <span>
            {{ status_message }} {{ recording ? durationString : '' }}
        </span>
        <span v-if="videoPath" class="video-path">
            {{ videoPath }}
        </span>
    </div>
    <div class="controls">
        <button @click="startCapture" v-if="!recording">
            <img src="@/assets/record.png" />
        </button>
        <button @click="stopCapture" class="recording" v-else>
            <img src="@/assets/stop.png" />
        </button>
        <button @click="takePicture">
            <img src="@/assets/camera.png" />
        </button>
        <button @click="reloadCamera">
            <img src="@/assets/reload.png" />
        </button>
        <span>FPS:</span>
        <input type="number" v-model="_userFPS" min="1" max="60" @change="updateFPS" />
    </div>
    <div class="browser">
        <div class="selector">
            <button @click="_selected_tab = 'videos';getVideos()" :class="{ selected: _selected_tab === 'videos' }">
                Videos
            </button>
            <button @click="_selected_tab = 'photos';getPhotos()" :class="{ selected: _selected_tab === 'photos' }">
                Photos
            </button>
        </div>
        <div class="item-viewer" v-if="_selected_tab === 'videos'">
            <div class="video-item" v-for="video in video_files" :key="video.id">
                <img :src="_thumbnail(video)" alt="Video Thumbnail" />
                <div class="info">
                    <span>{{ video.split('/').pop() }}</span>
                    <div class="buttons">
                        <button @click="downloadVideo(video)">
                            Download
                        </button>
                        <button @click="deleteVideo(video)">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="item-viewer" v-if="_selected_tab === 'photos'">
            <div class="video-item" v-for="photo in picture_files" :key="photo.id">
                <img :src="_thumbnailPicture(photo)" alt="Photo Thumbnail" />
                <div class="info">
                    <span>{{ photo.split('/').pop() }}</span>
                    <div class="buttons">
                        <button @click="downloadVideo(photo)">
                            Download
                        </button>
                        <button @click="deletePicture(photo)">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {

    },
    data() {
        return {
            recording: false,
            status_message: 'LOADING...',
            videoPath: null, // This can be used to store the path of the recorded video if needed
            recordingStartTime: null, // Optional: to track when the recording started
            durationString: '',
            _userFPS: 30, // Default FPS for the video stream
            _selected_tab: 'videos', // Default selected tab
            video_files: [], // Array to hold video files if needed
            picture_files: [] // Array to hold picture files if needed
        };
    },
    methods: {
        getDurationString(){
            if (!this.recordingStartTime) return '';
            const elapsed = new Date().getTime() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            return `(${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds})`;
        },
        _thumbnail(path){
            // apiurl/video-thumbnail?path=path(urlencoded)
            return this.$api.getThumbnail(path);
        },
        _thumbnailPicture(path){
            // apiurl/picture-thumbnail?path=path(urlencoded)
            return this.$api.getPictureThumbnail(path);
        },
        startCapture() {
            this.status_message = 'PLEASE WAIT...';
            this.$api.fetchData('start-recording').then(response => {
                console.log('Capture started:', response);
                this.recording = true;
                this.status_message = 'CAPTURE STARTED';
                this.videoPath = response.video_path || null; // Store the video path if available
                this.recordingStartTime = new Date().getTime(); // Record the start time of the capture

            }).catch(error => {
                console.error('Failed to start capture:', error);
                this.status_message = 'ERROR STARTING CAPTURE';
            });
            
        },
        takePicture() {
            this.status_message = 'TAKING PICTURE...';
            this.$api.fetchData('take-picture').then(response => {
                console.log('Picture taken:', response);
                this.status_message = 'PICTURE TAKEN';
            }).catch(error => {
                console.error('Failed to take picture:', error);
                this.status_message = 'ERROR TAKING PICTURE';
            });
        },
        downloadVideo(videoPath) {
            // Implement the logic to download the video file
            // This could be a simple link click or an API call to fetch the video file
            const link = document.createElement('a');
            link.href = this.$api.getVideoDownloadLink(videoPath);
            link.download = videoPath.split('/').pop(); // Use the file name from the path
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        stopCapture() {
            this.status_message = 'PLEASE WAIT...';
            this.videoPath = null; // Clear the video path when stopping capture
            this.$api.fetchData('stop-recording').then(response => {
                console.log('Capture stopped:', response);
                this.recording = false;
                this.status_message = 'CAPTURE STOPPED';

            }).catch(error => {
                console.error('Failed to stop capture:', error);
                this.status_message = 'ERROR STOPPING CAPTURE';
            });
        },
        reloadCamera() {
            this.status_message = 'RELOADING CAMERA...';
            const videoElement = this.$refs.video;
            this.$api.fetchData('reload-camera').then(response => {
                console.log('Camera reloaded:', response);
                videoElement.src = 'http://localhost:8000/stream'; // Reload the video stream
                this.status_message = 'CAMERA RELOADED';
            }).catch(error => {
                console.error('Failed to reload camera:', error);
                this.status_message = 'ERROR RELOADING CAMERA';
            });
        },
        getCameraData(){
            this.$api.fetchData('').then(response => {
                this.status_message = 'READY'
                if (response.camera_recording){
                    this.recording = true;
                    this.status_message = 'RECORDING';
                }
            }).catch(error => {
                console.error('Failed to fetch camera data:', error);
                this.status_message = 'ERROR FETCHING CAMERA DATA';
            });
        },
        getVideos(){
            this.$api.fetchData('video-files').then(response => {
                this.video_files = response.video_files || [];
                if (this.video_files.length > 0) {
                    this.status_message = 'VIDEOS LOADED';
                } else {
                    this.status_message = 'NO VIDEOS FOUND';
                }
            }).catch(error => {
                console.error('Failed to fetch videos:', error);
            });
        },
        getPhotos() {
            this.$api.fetchData('picture-files').then(response => {
                this.picture_files = response.picture_files || [];
                if (this.picture_files.length > 0) {
                    this.status_message = 'PHOTOS LOADED';
                } else {
                    this.status_message = 'NO PHOTOS FOUND';
                }
            }).catch(error => {
                console.error('Failed to fetch photos:', error);
            });
        },
        deleteVideo(videoPath) {
            this.$api.deleteVideo(videoPath).then(response => {
                console.log('Video deleted:', response);
                this.getVideos(); // Refresh the video list after deletion
                this.status_message = 'VIDEO DELETED';
            }).catch(error => {
                console.error('Failed to delete video:', error);
                this.status_message = 'ERROR DELETING VIDEO';
            });
        },
        deletePicture(picturePath) {
            this.$api.deletePicture(picturePath).then(response => {
                console.log('Picture deleted:', response);
                this.getPhotos(); // Refresh the photo list after deletion
                this.status_message = 'PICTURE DELETED';
            }).catch(error => {
                console.error('Failed to delete picture:', error);
                this.status_message = 'ERROR DELETING PICTURE';
            });
        },
        fullscreenView(){
            const videoElement = this.$refs.video;
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.mozRequestFullScreen) { // Firefox
                videoElement.mozRequestFullScreen();
            } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.msRequestFullscreen) { // IE/Edge
                videoElement.msRequestFullscreen();
            }
        },
        updateFPS() {
            if (this._userFPS < 1 || this._userFPS > 60) {
                console.error('FPS must be between 1 and 60');
                return;
            }
            this.$api.updateFPS(this._userFPS).then(response => {
                console.log('FPS updated:', response);
            }).catch(error => {
                console.error('Failed to update FPS:', error);
            });
        }
    },
    mounted() {
        this.getCameraData();
        setInterval(() => {
            if (this.recording) {
                this.durationString = this.getDurationString();
            }
        }, 1000); // Update the duration string every second
    }
}
</script>

<style lang='scss' scoped>
.viewfinder {
    border: 2px dashed #ccc;
    position: relative;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    img {
        object-fit: cover;
        width: 100%;

    }
}


.status-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 12px;
    h1{
        margin: 0;
        color: white;
        font-family: "Rubik", sans-serif;
        font-size: 16px;
    }

    span {
        color: #ccc;
        font-family: "Rubik", sans-serif;
        font-size: 14px;
        margin-top: 4px;
    }

    .video-path {
        color: #aaa;
        font-size: 12px;
        margin-top: 2px;
    }

}

.controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-top: 12px;
    gap: 10px;

    span{
        color: white;
        font-family: 'Rubik', sans-serif;
        font-size: 16px;
    }

    input[type="number"] {
        width: 60px;
        padding: 5px;
        border-radius: 4px;
        font-family: 'Rubik', sans-serif;
        font-size: 16px;
        color: #ffffff;
        background-color: #343c4979;
        border: 1px solid #555;
        outline: none;
        // hide spinner
        -moz-appearance: textfield;
        text-align: center;

        &:focus {
            border-color: #3a4755;
        }

    }

    button {
        all: unset;
        padding: 5px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        
        gap: 4px;
        cursor: pointer;
        background-color: #29303888;
        font-size: 20px;
        color: white;
        font-weight: 500;
        font-family: 'rubik', sans-serif;
        &.recording{
            animation: blinkingRed 1s infinite;
            background-color: #833e3eaa;
        }
        img {
            width: 25px !important;
            height: 25px !important;
        }
    }
}

.browser{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 2rem;
    height: 100%;
    overflow: hidden;

    .selector{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        button {
            all: unset;
            padding: 10px 20px;
            background-color: #29303888;
            color: white;
            border-radius: 4px;
            font-family: 'Rubik', sans-serif;
            cursor: pointer;
            font-size: 16px;
            
            font-family: 'Rubik', sans-serif;


            &.selected {
                background-color: #3a4755;
            }
            &:hover {
                background-color: #3a4755;
            }
        }
    }

    .item-viewer {
        display: flex;
        flex-direction: column;
        
        gap: 10px;
        margin-top: 10px;
        width: 100%;
        overflow-y: auto;
        .video-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            
            background-color: #2c3644;
            border-radius: 8px;
            gap: 10px;
            padding: 5px;

            img {
                width: 100px;
                border-radius: 4px;
                object-fit: cover;
            }

            span {
                margin-top: 5px;
                color: #ccc;
                font-family: 'Rubik', sans-serif;
                font-size: 14px;
                text-align: center;
            }

            .info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                flex-grow: 1;
                .buttons {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 10px;
                    margin-top: 5px;
    
                    button {
                        all: unset;
                        padding: 5px 10px;
                        background-color: #3a4755;
                        color: white;
                        border-radius: 4px;
                        font-family: 'Rubik', sans-serif;
                        cursor: pointer;
    
                        &:hover {
                            background-color: #4a5568;
                        }
                    }
                }
            }

        }
    }
}
@keyframes blinkingRed {
    0% { background-color: #833e3eaa; }
    50% { background-color: #d15757aa; }
    100% { background-color: #833e3eaa; }
}
</style>