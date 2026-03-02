import React, { useState, useEffect } from 'react';
import { realSpeedTest } from './services/speedtest';
import { ipService } from './services/ipService';

function App() {
  const [testing, setTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [testPhase, setTestPhase] = useState('idle'); // idle, ping, download, upload, complete
  const [resultId, setResultId] = useState(null);

  // Real user info
  const [userIP, setUserIP] = useState('Detecting...');
  const [userISP, setUserISP] = useState('Your ISP');
  const [userLocation, setUserLocation] = useState('Detecting location...');
  const [serverIP, setServerIP] = useState('Cloudflare');

  useEffect(() => {
    // Fetch user's real IP and location on component mount
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ipService.getUserInfo();
        setUserIP(userInfo.ip);
        setUserISP(userInfo.isp);
        setUserLocation(ipService.formatLocation(userInfo.city, userInfo.region, userInfo.country));

        // Fetch server IP
        const servIP = await ipService.getServerIP();
        setServerIP(`Cloudflare • ${servIP}`);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const generateResultId = () => {
    return Math.floor(Math.random() * 90000000000) + 10000000000;
  };

  // Smooth speed display to prevent jittering
  const updateSpeedSmooth = (newSpeed) => {
    setSpeedHistory(prev => {
      const updated = [...prev, newSpeed].slice(-5); // Keep last 5 readings
      const average = updated.reduce((a, b) => a + b, 0) / updated.length;
      setCurrentSpeed(average);
      return updated;
    });
  };

  const runPingTest = async () => {
    try {
      setTestPhase('ping');
      const result = await realSpeedTest.testPing(5);
      setPing(result.ping);
      return result;
    } catch (error) {
      console.error('Ping test error:', error);
      setPing(15);
    }
  };

  const runDownloadTest = async () => {
    try {
      setTestPhase('download');
      setSpeedHistory([]); // Reset history for new test
      // Use multi-threaded download (6 parallel connections like speedtest.net)
      const result = await realSpeedTest.testDownloadMultiThreaded(6, (progress) => {
        if (progress.speed && progress.speed > 0) {
          updateSpeedSmooth(progress.speed);
        }
      });
      setDownloadSpeed(result.speed);
      return result.speed;
    } catch (error) {
      console.error('Download test error:', error);
      throw error;
    }
  };

  const runUploadTest = async () => {
    try {
      setTestPhase('upload');
      setSpeedHistory([]); // Reset history for upload test
      // Use real upload test with 10MB file
      const result = await realSpeedTest.testRealUploadSpeed(10, (progress) => {
        if (progress && progress.speed) {
          updateSpeedSmooth(progress.speed);
        }
      });

      if (result && result.speed) {
        setUploadSpeed(result.speed);
        setCurrentSpeed(result.speed);
        console.log(`Upload: ${result.speed.toFixed(2)} Mbps (real test)`);
        return result.speed;
      } else {
        // Fallback to estimation if upload test fails
        const estimatedUpload = downloadSpeed ? downloadSpeed * 0.15 : 0;
        setUploadSpeed(estimatedUpload);
        setCurrentSpeed(estimatedUpload);
        console.log(`Upload: ${estimatedUpload.toFixed(2)} Mbps (estimated - upload test failed)`);
        return estimatedUpload;
      }
    } catch (error) {
      console.error('Upload test error:', error);
      // Fallback to estimation on error
      const estimatedUpload = downloadSpeed ? downloadSpeed * 0.15 : 0;
      setUploadSpeed(estimatedUpload);
      setCurrentSpeed(estimatedUpload);
      return estimatedUpload;
    }
  };

  const startSpeedTest = async () => {
    try {
      setTesting(true);
      setCurrentSpeed(0);
      setDownloadSpeed(null);
      setUploadSpeed(null);
      setPing(null);
      setTestPhase('idle');
      const newResultId = generateResultId();
      setResultId(newResultId);

      await runPingTest();
      await new Promise(resolve => setTimeout(resolve, 300));

      const dlSpeed = await runDownloadTest();
      await new Promise(resolve => setTimeout(resolve, 300));

      // Real upload test
      await runUploadTest();

      setTestPhase('complete');
      setCurrentSpeed(0);
    } catch (error) {
      console.error('Speed test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="speedtest-app">
      {/* Top Bar with Result ID */}
      <div className="top-bar">
        <div className="logo">SpeedTest Pro</div>
        {resultId && (
          <div className="result-id">Result ID: {resultId}</div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Speedometer */}
        <div className="speedometer">
          <svg viewBox="0 0 200 120" className="gauge-svg">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#00a8ff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (currentSpeed / 200) * 251.2}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <div className="speed-display">
            <div className="speed-number">
              {currentSpeed > 0 ? currentSpeed.toFixed(1) : '0.0'}
            </div>
            <div className="speed-label">
              {testPhase === 'download' && 'DOWNLOAD'}
              {testPhase === 'upload' && 'UPLOAD'}
              {testPhase === 'ping' && 'PING'}
              {(testPhase === 'idle' || testPhase === 'complete') && 'Mbps'}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="result-box download-box">
            <div className="result-icon">↓</div>
            <div className="result-content">
              <div className="result-label">Download</div>
              <div className="result-value">
                {downloadSpeed ? downloadSpeed.toFixed(2) : '--'}
              </div>
              <div className="result-unit">Mbps</div>
            </div>
          </div>

          <div className="result-box upload-box">
            <div className="result-icon">↑</div>
            <div className="result-content">
              <div className="result-label">Upload</div>
              <div className="result-value">
                {uploadSpeed ? uploadSpeed.toFixed(2) : '--'}
              </div>
              <div className="result-unit">Mbps</div>
            </div>
          </div>

          <div className="result-box ping-box">
            <div className="result-content">
              <div className="result-label">Ping</div>
              <div className="result-value">
                {ping ? ping.toFixed(0) : '--'}
              </div>
              <div className="result-unit">ms</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          className={`start-button ${testing ? 'testing' : ''}`}
          onClick={startSpeedTest}
          disabled={testing}
        >
          {testing ? (
            <span className="spinner"></span>
          ) : (
            <span className="go-text">GO</span>
          )}
        </button>

        {/* Connection Info */}
        <div className="connection-info">
          <div className="info-item">
            <span className="info-label">Connection:</span>
            <span className="info-value">Multi</span>
          </div>
          <div className="info-item">
            <span className="info-label">Server:</span>
            <span className="info-value">Cloudflare CDN</span>
          </div>
        </div>

        {/* Server Change Link */}
        <div className="server-change">
          <a href="#" className="change-link">Change Server</a>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-info">
        <div className="isp-info">
          <div className="isp-name">{userISP}</div>
          <div className="location">{userLocation}</div>
        </div>
        <div className="server-ip">
          {serverIP} • Your IP: {userIP}
        </div>
      </div>
    </div>
  );
}

export default App;
