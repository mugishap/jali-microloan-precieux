class ServerResponse {
    success: boolean
    message: string
    data: any
    status: number

    constructor(success: boolean, message: string, data: any, status: number) {
        this.success = success
        this.message = message
        this.data = data
        this.status = status
    }

    static success(message: string, data?: any | null, status: number = 200) {
        return new ServerResponse(true, message, data, status)
    }

    static error(message: string, data?: any | null, status: number = 500) {
        return new ServerResponse(false, message, data, status)
    }

}

export default ServerResponse