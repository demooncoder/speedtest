import React, { useState, useEffect } from 'react';
import SpeedGauge from './components/SpeedGauge';
import MetricCard from './components/MetricCard';
import { speedTestApi } from './services/api';
import { websocketService } from './services/websocket';

function App() {
  const [testId, setTestId] = useState(null);
  const [testing, setTesting] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [jitter, setJitter] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Click "Start Test" to begin');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to WebSocket on component mount
    websocketService.connect(
      () => console.log('WebSocket connected successfully'),
      (error) => console.error('WebSocket connection error:', error)
    );

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const generateRandomFile = (sizeMB) => {
    const bytes = sizeMB * 1024 * 1024;
    const buffer = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return new Blob([buffer]);
  };

  const runPingTest = async (testId) => {
    try {
      setStatusMessage('🔍 Measuring ping and jitter...');
      setProgress(10);

      const pingResults = [];

      // Perform multiple ping tests
      for (let i = 0; i < 10; i++) {
        const result = await speedTestApi.pingSimple();
        pingResults.push(result.latency);
        setProgress(10 + (i + 1) * 3);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate average ping
      const avgPing = pingResults.reduce((a, b) => a + b, 0) / pingResults.length;

      // Calculate jitter (standard deviation)
      const variance = pingResults.reduce((sum, val) => sum + Math.pow(val - avgPing, 2), 0) / pingResults.length;
      const calculatedJitter = Math.sqrt(variance);

      setPing(avgPing);
      setJitter(calculatedJitter);
      setProgress(40);

      return { ping: avgPing, jitter: calculatedJitter };
    } catch (error) {
      console.error('Ping test error:', error);
      throw error;
    }
  };

  const runDownloadTest = async (testId) => {
    try {
      setStatusMessage('⬇️ Testing download speed...');
      setProgress(40);

      const size = 10; // 10 MB
      const result = await speedTestApi.downloadTest(size, testId);

      setDownloadSpeed(result.speed);
      setCurrentSpeed(result.speed);
      setProgress(70);

      console.log(`Download: ${result.speed.toFixed(2)} Mbps`);
      return result.speed;
    } catch (error) {
      console.error('Download test error:', error);
      throw error;
    }
  };

  const runUploadTest = async (testId) => {
    try {
      setStatusMessage('⬆️ Testing upload speed...');
      setProgress(70);

      const size = 5; // 5 MB
      const file = generateRandomFile(size);

      const startTime = performance.now();

      // Create a Blob and File for upload
      const uploadFile = new File([file], 'test-upload.bin', { type: 'application/octet-stream' });

      const endTime = performance.now();
      const uploadTime = endTime - startTime;

      const result = await speedTestApi.uploadTest(uploadFile, testId, uploadTime);

      // Calculate upload speed
      const durationSeconds = uploadTime / 1000;
      const speedMbps = (size * 8) / durationSeconds;

      setUploadSpeed(speedMbps);
      setCurrentSpeed(speedMbps);
      setProgress(100);

      console.log(`Upload: ${speedMbps.toFixed(2)} Mbps`);
      return speedMbps;
    } catch (error) {
      console.error('Upload test error:', error);
      throw error;
    }
  };

  const startSpeedTest = async () => {
    try {
      setTesting(true);
      setError(null);
      setProgress(0);
      setCurrentSpeed(0);
      setDownloadSpeed(null);
      setUploadSpeed(null);
      setPing(null);
      setJitter(null);

      // Generate test ID
      const newTestId = await speedTestApi.generateTestId();
      setTestId(newTestId);

      setStatusMessage('🚀 Starting speed test...');

      // Subscribe to WebSocket updates for this test
      if (websocketService.isConnected()) {
        websocketService.subscribe(newTestId, (data) => {
          console.log('WebSocket update:', data);
          if (data.currentSpeed) {
            setCurrentSpeed(data.currentSpeed);
          }
          if (data.progressPercent) {
            setProgress(data.progressPercent);
          }
        });
      }

      // Run tests sequentially
      await runPingTest(newTestId);
      await new Promise(resolve => setTimeout(resolve, 500));

      await runDownloadTest(newTestId);
      await new Promise(resolve => setTimeout(resolve, 500));

      await runUploadTest(newTestId);

      setStatusMessage('✅ Speed test completed!');
      setProgress(100);
      setCurrentSpeed(0);

      // Unsubscribe from WebSocket
      if (websocketService.isConnected()) {
        websocketService.unsubscribe(newTestId);
      }

    } catch (error) {
      console.error('Speed test error:', error);
      setError('Failed to complete speed test. Please try again.');
      setStatusMessage('❌ Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>⚡ SpeedTest Pro</h1>
        <p>Real Time Internet Speed Measurement System</p>
      </header>

      <div className="speed-test-container">
        <SpeedGauge
          speed={currentSpeed}
          label={testing ? 'Testing...' : 'Ready'}
        />

        <div className="speed-metrics">
          <MetricCard
            label="Download"
            value={downloadSpeed}
            unit="Mbps"
            type="download"
          />
          <MetricCard
            label="Upload"
            value={uploadSpeed}
            unit="Mbps"
            type="upload"
          />
          <MetricCard
            label="Ping"
            value={ping}
            unit="ms"
            type="ping"
          />
          <MetricCard
            label="Jitter"
            value={jitter}
            unit="ms"
            type="ping"
          />
        </div>

        {testing && (
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <button
          className="test-button"
          onClick={startSpeedTest}
          disabled={testing}
        >
          {testing ? 'Testing...' : 'Start Test'}
        </button>

        <div className={`status-message ${testing ? 'testing' : ''} ${error ? 'error' : ''}`}>
          {error || statusMessage}
        </div>
      </div>

      <footer className="footer">
        <p>Powered by Spring Boot & React | Built with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
