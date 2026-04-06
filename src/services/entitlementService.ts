import { createServiceClient } from '../lib/supabase';
import { PAKETE, PlanKey, FeatureKey, planHasFeature, getFeatureLimit } from '../lib/pricing';

const supabase = createServiceClient();

export interface EntitlementResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

export async function checkEntitlement(
  workspaceId: string,
  featureKey: FeatureKey
): Promise<EntitlementResult> {
  // 1. Check DB override
  const { data: ent } = await supabase
    .from('entitlements')
    .select('is_active, current_usage, monthly_limit')
    .eq('workspace_id', workspaceId)
    .eq('feature_key', featureKey)
    .schema('billing')
    .single();

  if (ent) {
    if (!ent.is_active) return { allowed: false, reason: 'feature_disabled' };
    if (ent.monthly_limit > 0 && ent.current_usage >= ent.monthly_limit) {
      return { allowed: false, reason: 'limit_reached', currentUsage: ent.current_usage, limit: ent.monthly_limit };
    }
    return { allowed: true, currentUsage: ent.current_usage, limit: ent.monthly_limit };
  }

  // 2. Fallback: check plan
  const { data: ws } = await supabase
    .from('workspaces')
    .select('plan_key')
    .eq('id', workspaceId)
    .schema('core')
    .single();

  if (!ws) return { allowed: false, reason: 'workspace_not_found' };

  const planKey = ws.plan_key as PlanKey;
  if (!planHasFeature(planKey, featureKey)) {
    return { allowed: false, reason: 'not_in_plan' };
  }

  const limit = getFeatureLimit(planKey, featureKey);
  return { allowed: true, limit: limit || undefined };
}

export async function incrementUsage(
  workspaceId: string,
  featureKey: FeatureKey,
  amount = 1
): Promise<{ newUsage: number; limitReached: boolean }> {
  const { data, error } = await supabase.rpc('increment_usage', {
    p_workspace_id: workspaceId,
    p_feature_key: featureKey,
    p_amount: amount,
  });

  if (error || !data?.[0]) return { newUsage: 0, limitReached: true };
  return { newUsage: data[0].new_usage, limitReached: data[0].limit_reached };
}

export async function logAuditEvent(
  workspaceId: string,
  actorId: string,
  eventType: string,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase
      .from('events')
      .insert({ workspace_id: workspaceId, actor_id: actorId, event_type: eventType, description, metadata })
      .schema('audit');
  } catch {}
}

export async function guardFeature(opts: {
  workspaceId: string;
  actorId: string;
  featureKey: FeatureKey;
  auditDescription?: string;
  auditMetadata?: Record<string, unknown>;
}): Promise<void> {
  const result = await checkEntitlement(opts.workspaceId, opts.featureKey);
  if (!result.allowed) {
    await logAuditEvent(opts.workspaceId, opts.actorId, 'FEATURE_DENIED', opts.featureKey, { reason: result.reason });
    throw new Error(result.reason || 'not_allowed');
  }
  await incrementUsage(opts.workspaceId, opts.featureKey);
  await logAuditEvent(opts.workspaceId, opts.actorId, 'FEATURE_USED', opts.auditDescription || opts.featureKey, opts.auditMetadata);
}
