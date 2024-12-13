<template>
  <div class="video-stream">
    <div v-if="streamType === 'canvas'" ref="canvasContainer">
      <canvas ref="videoCanvas" :width="width" :height="height"></canvas>
    </div>
    <video v-else-if="streamType === 'video'" ref="videoElement" :width="width" :height="height" autoplay playsinline></video>

    <div class="controls">
      <button @click="startStream">开始预览</button>
      <button @click="stopStream">停止预览</button>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import JSMpeg from "@cycjimmy/jsmpeg-player";

export default {
  data() {
    return {
      socket: null,
      player: null,
      width: 640,
      height: 480,
      streamType: "canvas", // 'canvas' 或 'video'
      streaming: false,
      frameBuffer: [],
      mediaSource: null,
      sourceBuffer: null,
    };
  },

  mounted() {
    this.socket = io();
    this.setupSocketListeners();
  },

  beforeDestroy() {
    this.stopStream();
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  methods: {
    setupSocketListeners() {
      this.socket.on("video-frame", this.handleVideoFrame);
    },

    startStream() {
      if (this.streaming) return;
      this.streaming = true;

      // 发送开始流请求到服务器
      this.socket.emit("start-stream", {
        width: this.width,
        height: this.height,
      });

      if (this.streamType === "video") {
        this.setupMediaSource();
      }
    },

    stopStream() {
      if (!this.streaming) return;
      this.streaming = false;

      // 发送停止流请求到服务器
      this.socket.emit("stop-stream");
    },

    handleVideoFrame(frame) {
      if (!this.streaming) return;

      if (this.streamType === "canvas") {
        this.drawFrame(frame);
      } else {
        this.appendVideoChunk(frame);
      }
    },

    drawFrame(frame) {
      // 在 canvas 上绘制视频帧
      const canvas = this.$refs.videoCanvas;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, this.width, this.height);
      };
      img.src = `data:image/jpeg;base64,${frame.data}`;
    },

    setupMediaSource() {
      const video = this.$refs.videoElement;
      this.mediaSource = new MediaSource();
      video.src = URL.createObjectURL(this.mediaSource);

      this.mediaSource.addEventListener("sourceopen", () => {
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
        this.sourceBuffer.addEventListener("updateend", this.handleSourceBufferUpdateEnd);
      });
    },

    appendVideoChunk(frame) {
      if (!this.sourceBuffer || this.sourceBuffer.updating) {
        this.frameBuffer.push(frame);
        return;
      }

      const data = Uint8Array.from(atob(frame.data), (c) => c.charCodeAt(0));
      this.sourceBuffer.appendBuffer(data);
    },

    handleSourceBufferUpdateEnd() {
      if (this.frameBuffer.length > 0 && !this.sourceBuffer.updating) {
        const frame = this.frameBuffer.shift();
        this.appendVideoChunk(frame);
      }
    },
  },
};
</script>

<style scoped>
.video-stream {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
