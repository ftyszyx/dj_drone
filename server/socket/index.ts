import { Server } from "socket.io";
import { createServer } from "net";
import * as protobuf from "protobufjs";

export default async function () {
  // 加载 proto 文件
  const root = await protobuf.load("proto/message.proto");
  const Message = root.lookupType("edge.proto.Message");
  const MessageType = root.lookupEnum("edge.proto.MessageType");

  // 创建 TCP 服务器
  const tcpServer = createServer((socket) => {
    console.log("Edge server connected");

    // 处理数据
    let buffer = Buffer.alloc(0);

    socket.on("data", (data) => {
      buffer = Buffer.concat([buffer, data]);

      // 处理消息
      while (buffer.length >= 4) {
        // 读取消息长度
        const messageLength = buffer.readUInt32LE(0);

        if (buffer.length >= messageLength + 4) {
          // 提取完整消息
          const messageData = buffer.slice(4, messageLength + 4);

          try {
            // 解码 protobuf 消息
            const message = Message.decode(messageData);
            handleMessage(message);
          } catch (err) {
            console.error("Failed to decode message:", err);
          }

          // 更新缓冲区
          buffer = buffer.slice(messageLength + 4);
        } else {
          break;
        }
      }
    });

    socket.on("close", () => {
      console.log("Edge server disconnected");
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });

  // 启动 TCP 服务器
  tcpServer.listen(8080, "0.0.0.0", () => {
    console.log("TCP server listening on port 8080");
  });

  // 创建 Socket.IO 服务器
  const io = new Server(this.nuxt.server.listener);

  // 存储连接的客户端
  const clients = new Set();

  // Socket.IO 连接处理
  io.on("connection", (socket) => {
    console.log("Web client connected");
    clients.add(socket);

    socket.on("disconnect", () => {
      console.log("Web client disconnected");
      clients.delete(socket);
    });
  });

  // 处理从 edge_server 接收到的消息
  function handleMessage(message: any) {
    switch (message.type) {
      case MessageType.values.DRONE_STATUS:
        handleDroneStatus(message.droneStatus);
        break;

      case MessageType.values.IMAGE_DATA:
        handleImageData(message.imageData);
        break;

      case MessageType.values.ANOMALY_REPORT:
        handleAnomalyReport(message.anomaly);
        break;

      case MessageType.values.VIDEO_STREAM:
        handleVideoFrame(message.videoFrame);
        break;
    }

    // 广播消息给所有连接的 Web 客户端
    io.emit("edge-message", {
      type: message.type,
      data: message,
    });
  }

  // 处理无人机状态
  function handleDroneStatus(status: any) {
    console.log("Received drone status:", status);
    io.emit("drone-status", status);
  }

  // 处理图像数据
  function handleImageData(imageData: any) {
    console.log("Received image data:", {
      timestamp: imageData.timestamp,
      format: imageData.format,
      size: imageData.image.length,
    });
    io.emit("image-data", imageData);
  }

  // 处理异常报告
  function handleAnomalyReport(anomaly: any) {
    console.log("Received anomaly report:", anomaly);
    io.emit("anomaly-report", anomaly);
  }

  // 处理视频帧
  function handleVideoFrame(frame: any) {
    // 将视频帧转换为可在浏览器中显示的格式
    const frameData = {
      timestamp: frame.timestamp,
      data: Buffer.from(frame.data).toString("base64"),
      format: frame.format,
      width: frame.width,
      height: frame.height,
      frameIndex: frame.frameIndex,
    };

    // 广播视频帧给所有连接的客户端
    io.emit("video-frame", frameData);
  }
}
