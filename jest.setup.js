// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = MockWebSocket.OPEN
    this._sentMessages = []

    // Simulate connection opening asynchronously
    setTimeout(() => {
      if (this.onopen) {
        this.onopen()
      }
    }, 0)
  }

  send(data) {
    if (this.readyState === MockWebSocket.OPEN) {
      this._sentMessages.push(data)
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      setTimeout(() => {
        this.onclose()
      }, 0)
    }
  }

  addEventListener(event, handler) {
    if (event === 'open') this.onopen = handler
    if (event === 'close') this.onclose = handler
    if (event === 'message') this.onmessage = handler
    if (event === 'error') this.onerror = handler
  }

  removeEventListener(event, handler) {
    if (event === 'open' && this.onopen === handler) this.onopen = null
    if (event === 'close' && this.onclose === handler) this.onclose = null
    if (event === 'message' && this.onmessage === handler) this.onmessage = null
    if (event === 'error' && this.onerror === handler) this.onerror = null
  }

  // Helper methods for testing
  _triggerMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(message) })
    }
  }

  _triggerError(error) {
    if (this.onerror) {
      this.onerror(error)
    }
  }
}

// WebSocket constants
MockWebSocket.CONNECTING = 0
MockWebSocket.OPEN = 1
MockWebSocket.CLOSING = 2
MockWebSocket.CLOSED = 3

global.WebSocket = MockWebSocket

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  disconnect() {
    return null
  }

  observe() {
    return null
  }

  takeRecords() {
    return []
  }

  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}

  disconnect() {
    return null
  }

  observe() {
    return null
  }

  unobserve() {
    return null
  }
}

// Mock pointer capture methods for JSDOM
if (typeof Element !== 'undefined') {
  if (typeof Element.prototype.hasPointerCapture === 'undefined') {
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}
  }
}

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Error enumerating devices') ||
       args[0].includes('Error starting preview'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
