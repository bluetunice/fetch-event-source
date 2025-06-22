# @buletu/fetch-event-source - 基于 Fetch 的 EventSource 实现

## 简介

`@buletu/fetch-event-source` 是一个用于通过 Fetch API 实现 EventSource（服务器发送事件）的 JavaScript 类。它允许你以一种简单的方式与支持 SSE（Server-Sent Events）的服务器进行通信，接收实时更新的数据。该类提供了事件监听、自动重连等功能，方便开发者快速构建基于实时数据交互的应用程序，例如 AI 助手等场景。

## 安装

你可以通过 npm 安装此库（假设你已将其发布到 npm 或从本地路径安装）：

```bash
npm install @buletu/fetch-event-source
```

或者，如果你是直接在浏览器中使用，可以通过以下方式引入：

```html
<script src="path/to/dist/fetch-event-source.js"></script>
```

## 使用方法

### 基本用法

1. **引入库**

    - 如果使用 npm 安装，在项目中引入：
    ```javascript
    import { FetchEventSource } from '@buletu/fetch-event-source';
    ```
    - 如果是直接在浏览器中使用，通过 `<script>` 标签引入后，可以直接使用 `FetchEventSource`。

2. **创建实例并连接**

    创建一个 `FetchEventSource` 实例，并指定目标 URL 和可选的配置选项。然后调用 `connect` 方法建立连接。

    ```javascript
    const eventSource = new FetchEventSource('https://example.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({
        key: 'value'
      }),
      retryInterval: 5000 // 自定义重连间隔时间，单位为毫秒，默认为 3000
    });

    eventSource.connect();
    ```

3. **监听事件**

    通过 `addEventListener` 方法为特定事件添加监听器。当服务器发送事件时，相应的监听器会被触发。

    ```javascript
    eventSource.addEventListener('message', (event) => {
      console.log('接收到消息事件：', event);
      console.log('事件数据：', event.data);
    });

    eventSource.addEventListener('open', () => {
      console.log('连接已打开');
    });

    eventSource.addEventListener('error', (err) => {
      console.error('发生错误：', err);
    });

    eventSource.addEventListener('close', () => {
      console.log('连接已关闭');
    });
    ```

4. **关闭连接**

    当不再需要接收事件时，可以通过调用 `close` 方法关闭连接。

    ```javascript
    eventSource.close();
    ```

### 自定义事件处理

除了默认的 `message`、`open`、`error` 和 `close` 事件外，你还可以监听服务器发送的自定义事件类型。只需在服务器端发送带有自定义事件类型的事件，然后在客户端为该事件类型添加监听器即可。

例如，服务器发送以下事件：

```
event: custom-event
data: {"key":"value"}
```

客户端可以这样监听：

```javascript
eventSource.addEventListener('custom-event', (event) => {
  console.log('接收到自定义事件：', event);
});
```

### 自动重连机制

`FetchEventSource` 提供了自动重连功能。如果连接意外中断，它会在指定的重连间隔时间后尝试重新建立连接。你可以通过 `retryInterval` 选项自定义重连间隔时间。

## 示例代码

以下是一个完整的示例，展示了如何使用 `FetchEventSource` 与服务器进行通信并处理事件：

```javascript
import { FetchEventSource } from '@buletu/fetch-event-source';

const eventSource = new FetchEventSource('https://example.com/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream'
  },
  body: JSON.stringify({
    key: 'value'
  }),
  retryInterval: 5000 // 自定义重连间隔时间
});

eventSource.addEventListener('message', (event) => {
  console.log('接收到消息事件：', event);
});

eventSource.addEventListener('open', () => {
  console.log('连接已打开');
});

eventSource.addEventListener('error', (err) => {
  console.error('发生错误：', err);
});

eventSource.addEventListener('close', () => {
  console.log('连接已关闭');
});

eventSource.connect();

// 在适当的时候关闭连接
// eventSource.close();
```

## 注意事项

- 确保服务器支持 SSE 并正确配置了响应头，例如 `Content-Type: text/event-stream`。
- 根据实际需求合理设置 `retryInterval`，避免过短的重连间隔导致频繁请求服务器。
- 在浏览器环境中使用时，需要注意跨域问题，确保服务器允许跨域请求。

## 贡献

欢迎贡献代码或提出改进建议！你可以通过提交 issue 或 pull request 参与项目。

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

希望这个教程对你有帮助！如果有任何问题或需要进一步的说明，请随时告诉我。