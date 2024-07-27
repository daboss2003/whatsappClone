export class Status{
    constructor(userID, type, payload) {
        this.userId = userID
        this.timestamp = new Date().toISOString()
        this.type = type
        this.statusText = this.type === 'text' ? { color: payload.color, text: payload.text } : ''
        this.statusImage = this.type === 'image' ? { url: payload.url, text: payload.text } : ''
        this.statusVideo = this.type === 'video' ? {url: payload.url, text: payload.text} : ''
    }
}