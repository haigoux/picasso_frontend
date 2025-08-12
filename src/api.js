export class API{
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    
    async fetchData(endpoint) {
        try {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
        } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
        }
    }
    
    async postData(endpoint, data) {
        try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
        } catch (error) {
        console.error('Error posting data:', error);
        throw error;
        }
    }

    getThumbnail(path) {
        return `${this.baseURL}/video-thumbnail?path=${encodeURIComponent(path)}`;
    }

    getPictureThumbnail(path) {
        return `${this.baseURL}/picture-thumbnail?path=${encodeURIComponent(path)}`;
    }

    deleteVideo(path) {
        return this.fetchData(`delete-video?path=${encodeURIComponent(path)}`);
    }

    deletePicture(path) {
        return this.fetchData(`delete-picture?path=${encodeURIComponent(path)}`);
    }

    getVideoDownloadLink(path) {
        return `${this.baseURL}/download-video?path=${encodeURIComponent(path)}`;
    }

    updateFPS(fps) {
        return this.fetchData(`update-fps?new_fps=${fps}`);
    }

    async test() {
        try {
            const response = await fetch(`${this.baseURL}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error testing API:', error);
            throw error;
        }
    }
}