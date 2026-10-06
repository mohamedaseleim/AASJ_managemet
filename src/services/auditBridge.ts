import type { ActivityLogItem } from '../types/journal';

export type AuditInput = Omit<ActivityLogItem, 'id' | 'timestamp'>;

type AuditSink = (log: AuditInput) => void;

let sink: AuditSink | null = null;

/**
 * Registers the active audit sink (usually from JournalContext).
 * Call this once when JournalContext mounts.
 */
export const registerAuditSink = (fn: AuditSink) => {
  sink = fn;
};

/**
 * Optional cleanup if provider unmounts/reloads.
 */
export const clearAuditSink = () => {
  sink = null;
};

/**
 * Write an audit event through the registered sink.
 * Safe no-op if sink is not registered yet.
 */
export const audit = (log: AuditInput) => {
  try {
    sink?.(log);
  } catch (e) {
    console.error('[auditBridge] failed to write audit log', e);
  }
};

/**
 * Helper to check if sink is ready.
 */
export const isAuditReady = () => !!sink;
