import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnect, onError) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new SockJS('http://localhost:8080/ws');

        this.client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('WebSocket Connected');
            this.connected = true;
            if (onConnect) onConnect();
            resolve();
          },
          onStompError: (frame) => {
            console.error('WebSocket Error:', frame);
            this.connected = false;
            if (onError) onError(frame);
            reject(frame);
          },
          onDisconnect: () => {
            console.log('WebSocket Disconnected');
            this.connected = false;
          }
        });

        this.client.activate();
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  subscribe(testId, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/speedtest/${testId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(testId, subscription);
    return subscription;
  }

  unsubscribe(testId) {
    const subscription = this.subscriptions.get(testId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(testId);
    }
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
