import { ethers } from 'ethers'

class OurProvider extends ethers.providers.WebSocketProvider {
  private NextId = 0
  private requestsSent = 0
  private intervalId: NodeJS.Timeout | null = null
  constructor(url: string) {
    super(url)

    this.intervalId = setInterval(() => {
      this.requestsSent = 0
    }, 1000)
  }

  async destroy(): Promise<void> {
    // Wait until we have connected before trying to disconnect
    if (this.websocket.readyState === WebSocket.CONNECTING) {
      await new Promise((resolve) => {
        this.websocket.onopen = function () {
          resolve(true)
        }

        this.websocket.onerror = function () {
          resolve(false)
        }
      })
    }

    // Hangup
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
    this.websocket.close(1000)
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  send(method: string, params?: Array<any>) {
    return new Promise(async (resolve, reject) => {
      if (this.requestsSent > 500) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      this.requestsSent++
      const rid = this.NextId++

      function callback(error: Error, result: any) {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      }

      const payload = JSON.stringify({
        method: method,
        params: params,
        id: rid,
        jsonrpc: '2.0',
      })

      this.emit('debug', {
        action: 'request',
        request: JSON.parse(payload),
        provider: this,
      })
      const k = rid.toString()

      if (this._requests[k]) {
        throw new Error('request already exists')
      }

      this._requests[k] = { callback, payload }

      if (this._wsReady) {
        this.websocket.send(payload)
      }
    })
  }
}
export const getProvider = (url: string, throttle: boolean = true) => {
  if (url.startsWith('ws')) {
    if (throttle == false) {
      return new ethers.providers.WebSocketProvider(url)
    }
    return new OurProvider(url)
  }
  return new ethers.providers.JsonRpcProvider(url)
}
