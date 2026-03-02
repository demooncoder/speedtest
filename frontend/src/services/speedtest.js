// Backend-based Speed Test Service
// All tests go through backend API

const BACKEND_URL = 'http://localhost:8080/api/speedtest';

export const realSpeedTest = {
  // Test download speed from backend
  testDownloadSpeed: async (sizeInMB = 10, onProgress) => {
    try {
      const testId = Date.now().toString();
      const url = `${BACKEND_URL}/download?size=${sizeInMB}&testId=${testId}`;

      const startTime = performance.now();
      let lastProgressTime = startTime;
      let lastLoadedBytes = 0;

      const response = await fetch(url);
      const reader = response.body.getReader();
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        receivedBytes += value.length;

        // Calculate current speed for progress updates
        const currentTime = performance.now();
        const timeDiff = (currentTime - lastProgressTime) / 1000;

        if (timeDiff >= 0.1) { // Update every 100ms
          const bytesDiff = receivedBytes - lastLoadedBytes;
          const currentSpeedMbps = (bytesDiff * 8) / (timeDiff * 1024 * 1024);

          if (onProgress) {
            onProgress({
              loaded: receivedBytes,
              total: contentLength,
              speed: currentSpeedMbps,
              progress: contentLength > 0 ? (receivedBytes / contentLength) * 100 : 0
            });
          }

          lastProgressTime = currentTime;
          lastLoadedBytes = receivedBytes;
        }
      }

      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const speedMbps = (receivedBytes * 8) / (durationSeconds * 1024 * 1024);

      return {
        speed: speedMbps,
        bytes: receivedBytes,
        duration: durationSeconds
      };
    } catch (error) {
      console.error('Download test error:', error);
      throw error;
    }
  },

  // Test upload speed to backend
  testUploadSpeed: async (sizeInMB = 5, onProgress) => {
    try {
      // Generate random data
      const sizeInBytes = sizeInMB * 1024 * 1024;
      const data = new Uint8Array(sizeInBytes);
      for (let i = 0; i < sizeInBytes; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }

      const blob = new Blob([data]);
      const testId = Date.now().toString();
      const startTime = performance.now();

      // Upload to backend
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', blob, 'test-upload.bin');
          formData.append('testId', testId);
          formData.append('uploadTime', '1000');
          return formData;
        })(),
      });

      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const speedMbps = (sizeInBytes * 8) / (durationSeconds * 1024 * 1024);

      return {
        speed: speedMbps,
        bytes: sizeInBytes,
        duration: durationSeconds
      };
    } catch (error) {
      console.error('Upload test error:', error);
      throw error;
    }
  },

  // Test ping/latency to backend server
  testPing: async (samples = 5) => {
    const results = [];

    for (let i = 0; i < samples; i++) {
      try {
        const startTime = performance.now();

        await fetch(`${BACKEND_URL}/ping-simple`, {
          method: 'GET',
          cache: 'no-cache'
        });

        const endTime = performance.now();
        const latency = endTime - startTime;

        results.push(latency);
      } catch (error) {
        console.warn(`Ping failed:`, error);
      }

      // Small delay between pings
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate average and jitter
    const avgPing = results.reduce((a, b) => a + b, 0) / results.length;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - avgPing, 2), 0) / results.length;
    const jitter = Math.sqrt(variance);

    return {
      ping: avgPing,
      jitter: jitter,
      samples: results
    };
  },

  // Multi-threaded download test from backend (parallel downloads)
  testDownloadMultiThreaded: async (numThreads = 6, onProgress) => {
    const downloads = [];
    let totalBytes = 0;
    let startTime = performance.now();
    const testId = Date.now().toString();

    // Start multiple parallel downloads from backend
    for (let i = 0; i < numThreads; i++) {
      const sizeInMB = 10; // 10MB each thread
      const url = `${BACKEND_URL}/download?size=${sizeInMB}&testId=${testId}-${i}`;

      const downloadPromise = fetch(url).then(async (response) => {
        const reader = response.body.getReader();
        let receivedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedBytes += value.length;
          totalBytes += value.length;

          // Update progress
          const currentTime = performance.now();
          const duration = (currentTime - startTime) / 1000;
          const currentSpeed = (totalBytes * 8) / (duration * 1024 * 1024);

          if (onProgress && duration > 0.1) {
            onProgress({
              speed: currentSpeed,
              bytes: totalBytes,
              duration: duration
            });
          }
        }

        return receivedBytes;
      });

      downloads.push(downloadPromise);
    }

    // Wait for all downloads to complete
    const results = await Promise.all(downloads);
    const endTime = performance.now();

    const totalDuration = (endTime - startTime) / 1000;
    const finalSpeed = (totalBytes * 8) / (totalDuration * 1024 * 1024);

    return {
      speed: finalSpeed,
      threads: numThreads,
      bytes: totalBytes,
      duration: totalDuration
    };
  },

  // Real upload test with actual file upload to backend
  testRealUploadSpeed: async (sizeInMB = 10, onProgress) => {
    try {
      // Generate random data
      const sizeInBytes = sizeInMB * 1024 * 1024;
      const data = new Uint8Array(sizeInBytes);
      for (let i = 0; i < sizeInBytes; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }

      const blob = new Blob([data]);
      const startTime = performance.now();
      const testId = Date.now().toString();

      // Track progress if callback provided
      let lastProgressTime = startTime;

      // Upload with progress tracking using XMLHttpRequest for better progress monitoring
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const currentTime = performance.now();
            const timeDiff = (currentTime - lastProgressTime) / 1000;

            if (timeDiff >= 0.1) { // Update every 100ms
              const duration = (currentTime - startTime) / 1000;
              const currentSpeedMbps = (e.loaded * 8) / (duration * 1024 * 1024);

              onProgress({
                speed: currentSpeedMbps,
                loaded: e.loaded,
                total: e.total,
                progress: (e.loaded / e.total) * 100
              });

              lastProgressTime = currentTime;
            }
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        const formData = new FormData();
        formData.append('file', blob, 'upload-test.bin');
        formData.append('testId', testId);
        formData.append('uploadTime', '1000'); // Placeholder, actual time calculated on frontend

        xhr.open('POST', `${BACKEND_URL}/upload`);
        xhr.send(formData);
      });

      await uploadPromise;

      const endTime = performance.now();
      const uploadTimeMs = Math.round(endTime - startTime);
      const duration = uploadTimeMs / 1000;
      const speedMbps = (sizeInBytes * 8) / (duration * 1024 * 1024);

      console.log(`Upload completed: ${speedMbps.toFixed(2)} Mbps in ${duration.toFixed(2)}s`);

      return {
        speed: speedMbps,
        bytes: sizeInBytes,
        duration: duration
      };
    } catch (error) {
      console.error('Upload test failed:', error);
      return null;
    }
  }
};
