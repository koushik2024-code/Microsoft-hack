import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as db from './db/sqlite';
import * as hindsight from './services/hindsight';
import { Incident } from './types';
import { v4 as uuidv4 } from 'uuid';

const NAMESPACE = 'incident_mind_memory';

// Realistic seed incidents based on real-world production scenarios
const seedIncidents: Omit<Incident, 'id'>[] = [
  {
    title: 'PostgreSQL connection pool exhaustion causing API timeouts',
    severity: 'critical',
    service: 'Database',
    status: 'resolved',
    description: 'Production API endpoints returning 504 Gateway Timeout. Database connection pool maxed at 100 connections. Slow queries from the reporting module are holding connections open for 30+ seconds.',
    errorLog: 'ERROR: remaining connection slots are reserved for non-replication superuser connections\nFATAL: too many connections for role "app_user"\npg_pool: no free connections, waiting... timeout after 30000ms',
    rootCause: 'Unoptimized reporting queries running full table scans on the orders table (12M rows) without proper indexes. Combined with a connection pool size of 100 that was not increased after traffic grew 3x.',
    resolution: 'Added composite index on orders(created_at, status, customer_id). Increased connection pool to 200. Added query timeout of 10s for reporting queries. Moved heavy reports to read replica.',
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Redis cluster failover triggered OOM kills across payment service pods',
    severity: 'critical',
    service: 'Cache',
    status: 'resolved',
    description: 'Redis sentinel triggered failover during peak traffic. Payment service pods started OOM-killing as session data flooded into memory when Redis was temporarily unavailable. 23% of payment transactions failed for 12 minutes.',
    errorLog: 'redis.exceptions.ConnectionError: Error while reading from socket\nKubernetes OOMKilled: Container payment-service exceeded memory limit 2Gi\nCircuit breaker OPEN for redis-primary after 5 consecutive failures',
    rootCause: 'Payment service cached session data in local memory when Redis was unreachable (fallback behavior). Pod memory limit of 2Gi was insufficient for the fallback cache size during peak traffic (estimated 800k sessions).',
    resolution: 'Increased pod memory limit to 4Gi. Added bounded local cache with LRU eviction (max 50k entries). Implemented graceful degradation: reject new sessions instead of caching when Redis is down. Added Redis cluster health monitoring to PagerDuty.',
    resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Authentication service returning 401 for valid JWT tokens',
    severity: 'high',
    service: 'Auth',
    status: 'resolved',
    description: 'Users reporting random logouts. Auth service rejecting valid JWT tokens intermittently. Affects approximately 15% of authenticated requests. No recent deployments to auth service.',
    errorLog: 'jwt.exceptions.InvalidSignatureError: Signature verification failed\nToken issued_at: 2024-01-15T10:30:00Z, current_key_id: key-2024-01-16\nJWKS endpoint returning inconsistent key sets across replicas',
    rootCause: 'Automatic key rotation ran at midnight but only 2 of 4 auth service pods picked up the new JWKS. Pods with stale keys rejected tokens signed with the new key, and pods with new keys rejected tokens signed with the old key.',
    resolution: 'Fixed JWKS cache refresh to use pub/sub notification instead of polling. Added key overlap period of 24h during rotation. Deployed rolling restart procedure for key rotation events. Added monitoring for JWKS key consistency across pods.',
    resolvedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'CDN cache invalidation storm after deployment',
    severity: 'medium',
    service: 'CDN',
    status: 'resolved',
    description: 'After deploying frontend v2.14.0, CDN cache was purged globally. Origin servers hit with 50x normal traffic. Response times spiked to 8 seconds. Static assets loading slowly for users worldwide.',
    errorLog: 'CloudFront: Origin 5xx error rate exceeded 10% threshold\nALB: HealthyHostCount dropped from 8 to 3\nOrigin server CPU: 98% utilization across all instances',
    rootCause: 'Deployment script performed a full CDN cache purge instead of path-specific invalidation. All static assets (JS, CSS, images) were re-requested from origin simultaneously across all edge locations.',
    resolution: 'Changed deployment to use path-specific cache invalidation (only /static/js/* and /static/css/*). Added cache-warming step after invalidation. Increased origin auto-scaling min instances from 4 to 8 during deployments. Added deployment runbook with CDN impact assessment.',
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Stripe webhook processing backlog causing duplicate charges',
    severity: 'high',
    service: 'Payments',
    status: 'resolved',
    description: 'Stripe webhooks backing up in queue. Webhook processing latency exceeded 30 minutes. Some customers charged twice for the same order due to retry logic treating timed-out requests as failures.',
    errorLog: 'stripe.error.WebhookSignatureVerificationError: Timestamp outside tolerance\nSQS Queue: ApproximateAgeOfOldestMessage: 1847 seconds\nDuplicate charge detected: order_id=ORD-2024-78432, amount=$149.99, count=2',
    rootCause: 'A database migration added a new index on the payments table, which locked the table for 8 minutes during peak webhook processing. Backed-up webhooks exceeded Stripe signature timestamp tolerance (300s), causing re-deliveries and duplicate processing.',
    resolution: 'Added idempotency key tracking table to prevent duplicate charge processing. Switched to online index creation (CREATE INDEX CONCURRENTLY). Added webhook deduplication using Stripe event IDs. Set up dead letter queue for failed webhooks with manual review process.',
    resolvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Kubernetes node pressure evicting critical pods',
    severity: 'high',
    service: 'API',
    status: 'resolved',
    description: 'Three API pods evicted from node due to disk pressure. Remaining pods unable to handle full traffic. Health checks failing on surviving pods due to increased load. Auto-scaler slow to spin up replacements.',
    errorLog: 'Warning  Evicted  pod/api-server-7b8d4f6c9-x2k1m  The node was low on resource: ephemeral-storage\nWarning  FailedScheduling  0/6 nodes are available: 3 Insufficient cpu, 3 node(s) had disk pressure\nReadiness probe failed: HTTP probe failed with statuscode: 503',
    rootCause: 'Application log files growing unbounded on ephemeral storage. Each pod generating ~2GB/day of debug logs that were not being rotated. Combined with container image size of 1.5GB, exceeded the 10GB ephemeral storage limit.',
    resolution: 'Added log rotation with max 500MB per pod. Switched to structured JSON logging piped to external collector (Fluentd). Increased ephemeral storage limit to 20GB. Reduced container image size to 400MB using multi-stage builds. Added disk pressure alerts at 70% threshold.',
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Open incidents for demo
  {
    title: 'Elasticsearch indexing latency spike — search results stale by 15 minutes',
    severity: 'medium',
    service: 'API',
    status: 'investigating',
    description: 'Search index refresh interval increased from 1s to 15 min. Users reporting search results not showing recently created items. Elasticsearch cluster yellow status with 2 relocating shards.',
    errorLog: 'es_rejected_execution_exception: rejected execution of coordinating operation\nCluster health: yellow, relocating_shards: 2, pending_tasks: 847\nIndex refresh took 14832ms (threshold: 1000ms)',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    title: 'Memory leak in notification service — RSS growing 50MB/hour',
    severity: 'high',
    service: 'API',
    status: 'open',
    description: 'Notification service RSS memory growing linearly at ~50MB/hour. Currently at 3.2GB after 48 hours. Pod restarts every ~40 hours when hitting 4GB limit. WebSocket connections not being cleaned up after client disconnects.',
    errorLog: 'process.memoryUsage(): rss=3.2GB, heapUsed=2.8GB, heapTotal=3.1GB, external=120MB\nActive WebSocket connections: 12,847 (expected: ~3,000)\nEvent listeners on "disconnect": 45,231 (leak detected)',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log('🌱 Seeding IncidentMind with realistic incident data...\n');

  for (const incidentData of seedIncidents) {
    const incident: Incident = {
      ...incidentData,
      id: uuidv4(),
    };

    db.createIncident(incident);
    console.log(`  ✅ Created: ${incident.title.substring(0, 60)}...`);

    // Store in Hindsight memory
    const memoryContent = `Incident: ${incident.title}. Service: ${incident.service}. Severity: ${incident.severity}. Description: ${incident.description}`;
    await hindsight.retain(NAMESPACE, memoryContent, {
      type: 'incident_reported',
      incidentId: incident.id,
      service: incident.service,
      severity: incident.severity,
    });

    // If resolved, also store the resolution
    if (incident.status === 'resolved' && incident.rootCause && incident.resolution) {
      const resolutionMemory = `Resolved incident: ${incident.title}. Root Cause: ${incident.rootCause}. Resolution: ${incident.resolution}`;
      await hindsight.retain(NAMESPACE, resolutionMemory, {
        type: 'incident_resolved',
        incidentId: incident.id,
        service: incident.service,
        severity: incident.severity,
      });
      console.log(`  💾 Stored resolution memory for: ${incident.title.substring(0, 40)}...`);
    }
  }

  console.log(`\n✨ Seeded ${seedIncidents.length} incidents with memory!\n`);
}

seed().catch(console.error);
