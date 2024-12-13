<template>
  <div class="video-page">
    <h1>实时视频预览</h1>
    <VideoStream />
  </div>
</template>

<script>
import VideoStream from "~/components/VideoStream.vue";

export default {
  components: {
    VideoStream,
  },
};
</script>

<style scoped>
.video-page {
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>
