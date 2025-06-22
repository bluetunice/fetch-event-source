export class FetchEventSource {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify({}),
      ...options
    };

    this.eventHandlers = {};
    this.retryInterval = options.retryInterval || 3000;
    this.isConnected = false;
    this.controller = null;
    this.lastEventId = "";
  }

  addEventListener(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(
        (h) => h !== handler
      );
    }
  }

  async connect() {
    this.controller = new AbortController();
    const signal = this.controller.signal;

    try {
      const response = await fetch(this.url, {
        ...this.options,
        signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE连接失败: ${response.status}`);
      }

      this.isConnected = true;
      this.emit("open");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (this.isConnected) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r\n|\n|\r/);
        buffer = events.pop() || "";

        events.forEach((eventData) => this.parseEvent(eventData));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        this.emit("error", err);
        this.scheduleReconnect();
      }
    } finally {
      if (this.isConnected) {
        this.isConnected = false;
        this.emit("close");
      }
    }
  }

  parseEvent(eventData) {
    const lines = eventData;
    const event = {
      type: "message",
      data: lines,
      id: lines,
      retry: this.retryInterval
    };

    if (event.data) {
      this.emit(event.type, event);
    }
  }

  emit(type, event = {}) {
    if (this.eventHandlers[type]) {
      this.eventHandlers[type].forEach((handler) => handler(event));
    }

    // 如果是message事件，并且没有特定的处理器，则调用默认的message处理器
    if (type === "message" && !this.eventHandlers[type]) {
      if (this.eventHandlers["message"]) {
        this.eventHandlers["message"].forEach((handler) => handler(event));
      }
    }
  }

  scheduleReconnect() {
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.retryInterval);
  }

  close() {
    this.isConnected = false;
    if (this.controller) {
      this.controller.abort();
    }
  }
}
