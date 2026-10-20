import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  checkUserMembership,
  claimVipProductDownload,
  getLocalTestVip,
  setLocalTestVip,
  type MembershipStatus,
} from '@/services/membership';
import type { MembershipPlanId } from '@/data/membershipPlans';

interface MembershipContextValue {
  status: MembershipStatus;
  isVip: boolean;
  loading: boolean;
  testPlan: MembershipPlanId | null;
  setTestPlan: (plan: MembershipPlanId | null) => void;
  claimDownload: (product: { id: string; name: string }) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshMembership: () => Promise<void>;
}

const defaultStatus: MembershipStatus = {
  isVip: false,
  planId: null,
  planName: null,
  expiresAt: null,
  isLifetime: false,
  source: 'none',
};

const MembershipContext = createContext<MembershipContextValue | null>(null);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useCustomerAuth();
  const [status, setStatus] = useState<MembershipStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);
  const [testPlan, setTestPlanState] = useState<MembershipPlanId | null>(getLocalTestVip());

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    try {
      const res = await checkUserMembership(session?.user.id, session?.user.email ?? profile?.email);
      setStatus(res);
    } catch (err) {
      console.error('Error fetching membership status:', err);
      setStatus(defaultStatus);
    } finally {
      setLoading(false);
    }
  }, [session?.user.id, session?.user.email, profile?.email]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership, testPlan]);

  const setTestPlan = useCallback((plan: MembershipPlanId | null) => {
    setLocalTestVip(plan);
    setTestPlanState(plan);
  }, []);

  const claimDownload = useCallback(
    async (product: { id: string; name: string }) => {
      const customerName = profile?.full_name || session?.user.user_metadata?.full_name || session?.user.email || 'VIP Member';
      const customerEmail = session?.user.email || profile?.email || 'vip@bdbeginner.com';
      const customerPhone = profile?.phone || '01700000000';
      const userId = session?.user.id;

      return claimVipProductDownload(product, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        userId,
      });
    },
    [profile, session]
  );

  const value = useMemo(
    () => ({
      status,
      isVip: status.isVip,
      loading,
      testPlan,
      setTestPlan,
      claimDownload,
      refreshMembership: fetchMembership,
    }),
    [status, loading, testPlan, setTestPlan, claimDownload, fetchMembership]
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
