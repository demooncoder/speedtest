import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/speedtest';

export const speedTestApi = {
  // Health check
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  // Generate test ID
  generateTestId: async () => {
    const response = await axios.get(`${API_BASE_URL}/generate-test-id`);
    return response.data.testId;
  },

  // Download test - returns ArrayBuffer
  downloadTest: async (size = 10, testId) => {
    const startTime = performance.now();
    const response = await axios.get(`${API_BASE_URL}/download`, {
      params: { size, testId },
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        // Progress tracking
        const loaded = progressEvent.loaded;
        const total = progressEvent.total || size * 1024 * 1024;
        console.log(`Downloaded: ${loaded} / ${total} bytes`);
      }
    });
    const endTime = performance.now();
    const durationSeconds = (endTime - startTime) / 1000;
    const fileSizeMB = response.data.byteLength / (1024 * 1024);
    const speedMbps = (fileSizeMB * 8) / durationSeconds;

    return {
      speed: speedMbps,
      size: fileSizeMB,
      duration: durationSeconds,
      data: response.data
    };
  },

  // Upload test
  uploadTest: async (file, testId, uploadTime) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId);
    formData.append('uploadTime', uploadTime);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Ping test
  pingTest: async (testId) => {
    const response = await axios.get(`${API_BASE_URL}/ping`, {
      params: { testId }
    });
    return response.data;
  },

  // Simple ping for latency measurement
  pingSimple: async () => {
    const startTime = performance.now();
    const response = await axios.get(`${API_BASE_URL}/ping-simple`);
    const endTime = performance.now();
    return {
      latency: endTime - startTime,
      serverTime: response.data.timestamp
    };
  }
};
