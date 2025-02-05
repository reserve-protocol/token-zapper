import { ethers } from 'ethers'
import { makeCustomRouterSimulator } from '../../src.ts'
import { makeCallManySimulator } from '../../src.ts/configuration/ChainConfiguration'

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
    if (this.websocket.readyState === 0) {
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
export const getProvider = (url: string, throttle: number = Infinity) => {
  if (url.startsWith('ws')) {
    if (!isFinite(throttle)) {
      return new ethers.providers.WebSocketProvider(url)
    }
    return new OurProvider(url)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

export const getSimulator = (
  url: string,
  type: string,
  whales: Record<string, string>
) => {
  console.log(`Using ${type} simulator. Url=${url}`)
  if (type === 'simulator') {
    return makeCustomRouterSimulator(url, whales)
  }
  if (type === 'callmany') {
    return makeCallManySimulator(url, whales)
  }
  throw new Error(`Unknown simulator type: ${type}`)
}
