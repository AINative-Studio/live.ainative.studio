# Performance Testing Guide

## Overview

This document describes the performance testing strategy for AINative Studio Live, a streaming and chat-heavy platform. Performance is critical for user experience, especially for real-time chat and video streaming.

## Test Categories

### 1. WebSocket Performance Tests
**Location**: `lib/__tests__/performance/websocket-performance.test.ts`

Tests WebSocket connection handling, message throughput, and concurrent connections.

**Key Metrics**:
- Connection establishment: < 2 seconds
- Concurrent connections: 50+ simultaneously
- Reconnection time: < 5 seconds
- Message throughput: 1000 messages in < 5 seconds
- Bi-directional throughput: 500 messages/sec
- Memory leak detection: < 100KB per connection cycle

**Test Coverage**:
- Connection performance (establishment, concurrent, reconnection)
- Message throughput (send/receive, bi-directional)
- Memory and resource management
- Load testing (burst connections, sustained load)
- Error recovery performance

### 2. Chat Load Tests
**Location**: `hooks/__tests__/performance/chat-load.test.ts`

Tests multiple concurrent users and message broadcasting performance.

**Key Metrics**:
- Concurrent users: 100+ simultaneously
- Message broadcast: 500 viewers in < 5 seconds
- Message burst: 50 users × 20 messages in < 10 seconds
- Rate limiting: 5 messages per second per user
- History loading: 1000 messages in < 2 seconds
- Memory usage: < 50MB for continuous messaging

**Test Coverage**:
- Multiple concurrent users (100+)
- Message broadcasting (500+ viewers)
- Message burst handling
- Rate limiting enforcement
- Chat history performance
- Memory usage under load
- Stress testing (1000+ active chatters)

### 3. Streaming Performance Tests
**Location**: `components/__tests__/performance/streaming-performance.test.tsx`

Tests video encoding, bandwidth monitoring, and browser streaming performance.

**Key Metrics**:
- Stream initialization: < 2 seconds
- Quality switching: < 1 second per switch
- Bitrates:
  - 720p: 2500 kbps
  - 1080p: 4500 kbps
  - 1440p: 8000 kbps
- Resource cleanup: All tracks stopped on unmount
- Memory leaks: < 10MB per start/stop cycle

**Test Coverage**:
- Video encoding performance (720p, 1080p, 1440p)
- Bandwidth and bitrate management
- Resource management (cleanup, device switching)
- Multi-stream performance
- Error recovery performance

### 4. Performance Benchmarks
**Location**: `lib/__tests__/performance/benchmark.test.ts`

Measures and tracks performance metrics for critical components.

**Key Benchmarks**:
- Message processing: > 10,000 ops/sec
- Message filtering/sorting: > 50 ops/sec
- WebSocket serialization: > 50,000 ops/sec
- Component rendering: < 5s for 100 renders
- Data structure operations: > 100,000 ops/sec
- String processing: > 1,000 ops/sec

**Benchmark Categories**:
- Message processing (add, filter, sort, dedupe)
- WebSocket operations (creation, serialization)
- React component rendering
- Data structures (Set, Map, Array)
- String processing (truncation, emoji detection, URL detection)

## Running Performance Tests

### Run All Performance Tests

```bash
npm run test:performance
```

### Run Specific Test Suites

```bash
# WebSocket performance only
npm test -- lib/__tests__/performance/websocket-performance.test.ts

# Chat load tests only
npm test -- hooks/__tests__/performance/chat-load.test.ts

# Streaming performance only
npm test -- components/__tests__/performance/streaming-performance.test.tsx

# Benchmarks only
npm test -- lib/__tests__/performance/benchmark.test.ts
```

### Run with Coverage

```bash
npm run test:performance:coverage
```

### Run with Memory Profiling

```bash
# Enable garbage collection visibility
node --expose-gc ./node_modules/.bin/jest --testPathPattern=performance
```

## Performance Targets

### Response Time Targets

| Operation | Target | Critical Threshold |
|-----------|--------|-------------------|
| WebSocket connection | < 2s | < 5s |
| Message send | < 100ms | < 500ms |
| Message receive | < 100ms | < 500ms |
| Stream initialization | < 2s | < 5s |
| Quality switch | < 1s | < 3s |

### Throughput Targets

| Operation | Target | Critical Threshold |
|-----------|--------|-------------------|
| Messages/sec (per user) | 5 | 10 |
| Concurrent users | 1000 | 500 |
| Broadcast speed | 500 viewers/sec | 100 viewers/sec |

### Resource Targets

| Resource | Target | Critical Threshold |
|----------|--------|-------------------|
| Memory per connection | < 1MB | < 5MB |
| Memory leak per cycle | < 100KB | < 1MB |
| CPU per stream | < 10% | < 25% |

## Load Testing Scenarios

### Scenario 1: Normal Load
- **Users**: 100 concurrent viewers
- **Chat activity**: 10 messages/sec
- **Stream quality**: Mix of 720p and 1080p
- **Duration**: 10 minutes
- **Expected**: All metrics within target range

### Scenario 2: High Load
- **Users**: 500 concurrent viewers
- **Chat activity**: 50 messages/sec
- **Stream quality**: Mix of 1080p and 1440p
- **Duration**: 10 minutes
- **Expected**: All metrics within critical threshold

### Scenario 3: Stress Test
- **Users**: 1000 concurrent viewers
- **Chat activity**: 100 messages/sec
- **Stream quality**: All 1080p
- **Duration**: 5 minutes
- **Expected**: System remains stable, may hit critical thresholds

### Scenario 4: Spike Test
- **Users**: 0 → 500 → 0 (rapid)
- **Chat activity**: Burst of 1000 messages
- **Duration**: 2 minutes
- **Expected**: Quick recovery, no memory leaks

## Monitoring and Profiling

### Enable Performance Monitoring

```bash
# Run tests with detailed timing
npm test -- --verbose performance

# Run with memory profiling
node --expose-gc --inspect ./node_modules/.bin/jest --testPathPattern=performance

# Generate performance report
npm run test:performance:report
```

### Chrome DevTools Profiling

For browser-based performance testing:

1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Run the application with test load
5. Stop recording and analyze:
   - Frame rate (should be 60fps)
   - CPU usage (should be < 50%)
   - Memory allocation (check for leaks)

### Memory Leak Detection

```bash
# Run with heap snapshots
node --expose-gc --heap-prof ./node_modules/.bin/jest --testPathPattern=performance

# Analyze heap dump
# Use Chrome DevTools Memory tab to compare snapshots
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run performance tests
        run: npm run test:performance
      - name: Generate report
        run: npm run test:performance:report
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: performance-report
          path: performance-report.html
```

## Performance Regression Detection

Track key metrics over time to detect performance regressions:

1. **Baseline Establishment**: Run tests on known-good commit
2. **Regular Measurement**: Run tests on every PR
3. **Comparison**: Compare against baseline
4. **Alert Thresholds**:
   - Warning: > 10% slower than baseline
   - Failure: > 25% slower than baseline

## Troubleshooting

### Common Performance Issues

#### 1. Slow WebSocket Connections
- **Symptom**: Connections take > 5 seconds
- **Causes**: Network latency, server overload, DNS issues
- **Solutions**: Check network, verify server health, use connection pooling

#### 2. High Memory Usage
- **Symptom**: Memory usage keeps growing
- **Causes**: Event listener leaks, unclosed connections, large message buffers
- **Solutions**: Clean up listeners, close connections, implement message limits

#### 3. Slow Message Delivery
- **Symptom**: Messages take > 1 second to appear
- **Causes**: Serialization overhead, network congestion, rate limiting
- **Solutions**: Optimize message format, batch messages, adjust rate limits

#### 4. Video Encoding Issues
- **Symptom**: Frame drops, stuttering
- **Causes**: High bitrate, CPU overload, browser limitations
- **Solutions**: Reduce quality, optimize encoding settings, check hardware acceleration

### Debugging Commands

```bash
# Check for memory leaks
node --expose-gc --inspect ./node_modules/.bin/jest --testPathPattern=performance

# Profile CPU usage
node --prof ./node_modules/.bin/jest --testPathPattern=performance

# Run specific test with debugging
DEBUG=* npm test -- lib/__tests__/performance/websocket-performance.test.ts
```

## Best Practices

### 1. Test Early and Often
- Run performance tests in development
- Include in CI/CD pipeline
- Test before major releases

### 2. Set Realistic Targets
- Base targets on real-world usage
- Consider 95th percentile, not average
- Account for peak load scenarios

### 3. Monitor Production
- Use real user monitoring (RUM)
- Track key performance indicators (KPIs)
- Set up alerts for degradation

### 4. Optimize Incrementally
- Identify bottlenecks first
- Measure impact of changes
- Don't over-optimize prematurely

### 5. Document Changes
- Record performance improvements
- Document optimization techniques
- Share learnings with team

## Resources

- [WebSocket Performance Best Practices](https://www.ably.io/topic/websocket-performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Performance Metrics](https://web.dev/vitals/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

## Contact

For questions or issues related to performance testing, contact the development team or file an issue on GitHub.

---

**Last Updated**: 2026-01-14
**Status**: Active
