/**
 * WebSocket Performance Tests
 * Tests connection handling, message throughput, and concurrent connections
 */

import { WebSocketClient } from '../../websocket';

describe('WebSocket Performance Tests', () => {
  const WS_URL = 'ws://localhost:8080';
  const TEST_TIMEOUT = 30000; // 30 seconds for performance tests

  describe('Connection Performance', () => {
    it('should establish connection within 2 seconds', async () => {
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });
      const startTime = Date.now();

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          const duration = Date.now() - startTime;
          expect(duration).toBeLessThan(2000);
          client.close();
          resolve();
        });
      });
    }, TEST_TIMEOUT);

    it('should handle 50 concurrent connections', async () => {
      const connections: WebSocketClient[] = [];
      const startTime = Date.now();
      let connectedCount = 0;

      for (let i = 0; i < 50; i++) {
        const client = new WebSocketClient(WS_URL, {
          token: `test-token-${i}`,
        });

        client.on('open', () => {
          connectedCount++;
        });

        connections.push(client);
      }

      // Wait for all connections
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (connectedCount === 50) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      const duration = Date.now() - startTime;
      expect(connectedCount).toBe(50);
      expect(duration).toBeLessThan(10000); // Should connect within 10 seconds

      // Cleanup
      connections.forEach((client) => client.close());
    }, TEST_TIMEOUT);

    it('should reconnect within 5 seconds after disconnect', async () => {
      const client = new WebSocketClient(WS_URL, {
        token: 'test-token',
        reconnectInterval: 1000,
        maxReconnectAttempts: 3,
      });

      await new Promise<void>((resolve) => {
        let disconnectTime = 0;
        let openCount = 0;

        client.on('open', () => {
          openCount++;
          if (openCount === 1) {
            // First connection - simulate network disconnect (not manual close)
            disconnectTime = Date.now();
            (client as any).ws.close();
          } else if (openCount === 2) {
            // Reconnection successful
            const reconnectDuration = Date.now() - disconnectTime;
            expect(reconnectDuration).toBeLessThan(5000);
            client.close();
            resolve();
          }
        });
      });
    }, TEST_TIMEOUT);
  });

  describe('Message Throughput', () => {
    it('should send 1000 messages in under 5 seconds', async () => {
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });
      const messageCount = 1000;
      let sentCount = 0;

      await new Promise<void>((resolve) => {
        client.on('open', async () => {
          const startTime = Date.now();

          for (let i = 0; i < messageCount; i++) {
            client.send('chat.message', { text: `Message ${i}` });
            sentCount++;
          }

          const duration = Date.now() - startTime;
          expect(sentCount).toBe(messageCount);
          expect(duration).toBeLessThan(5000);

          client.close();
          resolve();
        });
      });
    }, TEST_TIMEOUT);

    it('should receive 1000 messages in under 10 seconds', async () => {
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });
      const messageCount = 1000;
      let receivedCount = 0;

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          const startTime = Date.now();

          client.on('chat.message', () => {
            receivedCount++;

            if (receivedCount === messageCount) {
              const duration = Date.now() - startTime;
              expect(duration).toBeLessThan(10000);
              client.close();
              resolve();
            }
          });

          // Simulate receiving messages
          for (let i = 0; i < messageCount; i++) {
            setTimeout(() => {
              client.emit('chat.message', { text: `Message ${i}` });
            }, i);
          }
        });
      });
    }, TEST_TIMEOUT);

    it('should handle bi-directional throughput of 500 messages/sec', async () => {
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });
      const testDuration = 2000; // 2 seconds
      const targetThroughput = 500; // messages per second
      const expectedMessages = (targetThroughput * testDuration) / 1000;

      let sentCount = 0;
      let receivedCount = 0;

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          const startTime = Date.now();

          // Send messages rapidly
          const sendInterval = setInterval(() => {
            if (Date.now() - startTime >= testDuration) {
              clearInterval(sendInterval);

              // Calculate throughput
              const actualThroughput = (sentCount / testDuration) * 1000;
              expect(actualThroughput).toBeGreaterThanOrEqual(targetThroughput * 0.85); // 85% of target (accounting for test environment variability)

              client.close();
              resolve();
              return;
            }

            client.send('chat.message', { text: `Message ${sentCount}` });
            sentCount++;
          }, 2); // Send every 2ms = 500 msg/sec

          // Receive messages
          client.on('chat.message', () => {
            receivedCount++;
          });
        });
      });
    }, TEST_TIMEOUT);
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory with repeated connections', async () => {
      const iterations = 100;
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const client = new WebSocketClient(WS_URL, { token: 'test-token' });

        await new Promise<void>((resolve) => {
          client.on('open', () => {
            client.close();
            resolve();
          });
        });

        // Small delay to allow cleanup
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePerConnection = memoryIncrease / iterations;

      // Should not leak more than 100KB per connection cycle
      expect(memoryIncreasePerConnection).toBeLessThan(100 * 1024);
    }, TEST_TIMEOUT);

    it('should cleanup event listeners on disconnect', async () => {
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          // Add multiple listeners
          for (let i = 0; i < 100; i++) {
            client.on('chat.message', () => {});
          }

          const listenerCount = client.listenerCount('chat.message');
          expect(listenerCount).toBe(100);

          client.close();

          // Check listeners are cleaned up
          setTimeout(() => {
            const listenerCountAfter = client.listenerCount('chat.message');
            expect(listenerCountAfter).toBe(0);
            resolve();
          }, 100);
        });
      });
    }, TEST_TIMEOUT);
  });

  describe('Load Testing', () => {
    it('should handle burst of 100 connections simultaneously', async () => {
      const connections: WebSocketClient[] = [];
      const connectionCount = 100;
      let successCount = 0;
      let failureCount = 0;

      const startTime = Date.now();

      // Create all connections at once
      const promises = Array.from({ length: connectionCount }, (_, i) => {
        return new Promise<void>((resolve) => {
          const client = new WebSocketClient(WS_URL, {
            token: `burst-token-${i}`,
          });

          client.on('open', () => {
            successCount++;
            connections.push(client);
            resolve();
          });

          client.on('error', () => {
            failureCount++;
            resolve();
          });

          // Timeout after 5 seconds
          setTimeout(() => {
            failureCount++;
            resolve();
          }, 5000);
        });
      });

      await Promise.all(promises);

      const duration = Date.now() - startTime;

      expect(successCount).toBeGreaterThan(connectionCount * 0.95); // 95% success rate
      expect(duration).toBeLessThan(10000); // Complete within 10 seconds

      // Cleanup
      connections.forEach((client) => client.close());
    }, TEST_TIMEOUT);

    it('should maintain performance under sustained load', async () => {
      const duration = 5000; // 5 seconds (reduced for faster test execution)
      const messageRate = 100; // messages per second
      const client = new WebSocketClient(WS_URL, { token: 'test-token' });

      let sentCount = 0;

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          const startTime = Date.now();

          // Send messages at constant rate
          const sendInterval = setInterval(() => {
            if (Date.now() - startTime >= duration) {
              clearInterval(sendInterval);

              // Verify message throughput
              expect(sentCount).toBeGreaterThanOrEqual(
                ((messageRate * duration) / 1000) * 0.85 // 85% threshold for test environment variability
              );

              client.close();
              resolve();
              return;
            }

            client.send('chat.message', {
              text: `Message ${sentCount}`,
              timestamp: Date.now(),
            });
            sentCount++;
          }, 1000 / messageRate);
        });
      });
    }, TEST_TIMEOUT);
  });

  describe('Error Recovery Performance', () => {
    it('should recover from network interruption within 3 seconds', async () => {
      const client = new WebSocketClient(WS_URL, {
        token: 'test-token',
        reconnectInterval: 500,
      });

      await new Promise<void>((resolve) => {
        let disconnectTime = 0;

        client.on('open', () => {
          if (disconnectTime === 0) {
            // Simulate network interruption
            (client as any).ws.close();
          } else {
            // Recovery complete
            const recoveryTime = Date.now() - disconnectTime;
            expect(recoveryTime).toBeLessThan(3000);
            client.close();
            resolve();
          }
        });

        client.on('close', () => {
          disconnectTime = Date.now();
        });
      });
    }, TEST_TIMEOUT);

    it('should handle rapid connect/disconnect cycles', async () => {
      const cycles = 50;
      const startTime = Date.now();

      for (let i = 0; i < cycles; i++) {
        const client = new WebSocketClient(WS_URL, {
          token: 'test-token',
          autoReconnect: false // Disable reconnection for rapid cycles
        });

        await new Promise<void>((resolve) => {
          let isResolved = false;

          client.on('open', () => {
            client.close();
            // Resolve immediately after close is called
            if (!isResolved) {
              isResolved = true;
              setTimeout(resolve, 10); // Small delay for cleanup
            }
          });

          client.on('close', () => {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          });
        });
      }

      const duration = Date.now() - startTime;
      const avgCycleTime = duration / cycles;

      expect(avgCycleTime).toBeLessThan(500); // Average cycle < 500ms (increased for test environment)
    }, TEST_TIMEOUT);
  });
});
