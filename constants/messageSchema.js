export class Chat{
    constructor(user1, user2, archived, messages ) {
        this.users = [user1, user2],
        this.archived = archived,
        this.messages = messages,
        this.createdAt = new Date().toISOString()
    }
}

export class Message{
    constructor(senderId, type, payload, id, reply) {
        this.id = id
        this.senderId = senderId
        this.timestamp = new Date().toISOString()
        this.type = type
        this.text = this.type === 'text' ? payload : ''
        this.image = this.type === 'image' ? { url: payload.url, text: payload.text } : ''
        this.video = this.type === 'video' ? { url: payload.url, text: payload.text} : ''
        this.audio = this.type === 'audio' ? payload : ''
        this.seen = false
        this.reply = reply ?? 'Empty'
        
    }
}
