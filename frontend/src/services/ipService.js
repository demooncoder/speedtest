// Service to fetch user's real IP, ISP, and location information

export const ipService = {
  // Fetch user's IP and location info
  getUserInfo: async () => {
    try {
      // Using ipapi.co free API (no key required)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      return {
        ip: data.ip || 'Unknown',
        isp: data.org || 'Unknown ISP',
        city: data.city || 'Unknown',
        region: data.region || '',
        country: data.country_name || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Failed to fetch IP info:', error);

      // Fallback: Try ipify for just IP
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();

        return {
          ip: ipData.ip || 'Unknown',
          isp: 'Your ISP',
          city: 'Unknown',
          region: '',
          country: 'Unknown',
          latitude: null,
          longitude: null
        };
      } catch (fallbackError) {
        console.error('Fallback IP fetch also failed:', fallbackError);
        return {
          ip: 'Unable to detect',
          isp: 'Unknown ISP',
          city: 'Unknown',
          region: '',
          country: 'Unknown',
          latitude: null,
          longitude: null
        };
      }
    }
  },

  // Get Cloudflare CDN server IP (approximation based on location)
  getServerIP: async () => {
    try {
      // Fetch from Cloudflare's trace endpoint
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const text = await response.text();

      // Parse the response
      const lines = text.split('\n');
      const serverIP = lines.find(line => line.startsWith('ip='))?.split('=')[1];

      return serverIP || '162.159.200.1';
    } catch (error) {
      console.error('Failed to fetch server IP:', error);
      return '162.159.200.1'; // Default Cloudflare IP
    }
  },

  // Format location string
  formatLocation: (city, region, country) => {
    const parts = [city, region, country].filter(Boolean);
    return parts.join(', ') || 'Detecting location...';
  }
};
