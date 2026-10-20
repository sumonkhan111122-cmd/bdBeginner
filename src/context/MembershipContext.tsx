import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  checkUserMembership,
  claimVipProductDownload,
  getDailyDownloadQuota,
  getLocalTestVip,
  setLocalTestVip,
  type MembershipStatus,
} from '@/services/membership';
import type { MembershipPlanId } from '@/data/membershipPlans';

export interface DailyDownloadQuota {
  limit: number | null;
  used: number;
  remaining: number | null;
}

interface MembershipContextValue {
  status: MembershipStatus;
  isVip: boolean;
  loading: boolean;
  dailyQuota: DailyDownloadQuota;
  testPlan: MembershipPlanId | null;
  setTestPlan: (plan: MembershipPlanId | null) => void;
  claimDownload: (product: { id: string; name: string; slug?: string }) => Promise<{ success: boolean; url?: string; error?: string }>;
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

const defaultQuota: DailyDownloadQuota = {
  limit: null,
  used: 0,
  remaining: null,
};

const MembershipContext = createContext<MembershipContextValue | null>(null);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useCustomerAuth();
  const [status, setStatus] = useState<MembershipStatus>(defaultStatus);
  const [dailyQuota, setDailyQuota] = useState<DailyDownloadQuota>(defaultQuota);
  const [loading, setLoading] = useState(true);

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    try {
      const uId = session?.user.id;
      const uEmail = session?.user.email ?? profile?.email;
      const res = await checkUserMembership(uId, uEmail);
      setStatus(res);

      if (res.isVip && res.planId) {
        const quota = await getDailyDownloadQuota(uId, uEmail, res.planId);
        setDailyQuota(quota);
      } else {
        setDailyQuota(defaultQuota);
      }
    } catch (err) {
      console.error('Error fetching membership status:', err);
      setStatus(defaultStatus);
      setDailyQuota(defaultQuota);
    } finally {
      setLoading(false);
    }
  }, [session?.user.id, session?.user.email, profile?.email]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const setTestPlan = useCallback((_plan: MembershipPlanId | null) => {
    // Disabled for security
  }, []);

  const claimDownload = useCallback(
    async (product: { id: string; name: string; slug?: string }) => {
      const customerName = profile?.full_name || session?.user.user_metadata?.full_name || session?.user.email || 'VIP Member';
      const customerEmail = session?.user.email || profile?.email || 'vip@bdbeginner.com';
      const customerPhone = profile?.phone || '01700000000';
      const userId = session?.user.id;

      const result = await claimVipProductDownload(product, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        userId,
      });

      if (result.success && status.planId) {
        const updatedQuota = await getDailyDownloadQuota(userId, customerEmail, status.planId);
        setDailyQuota(updatedQuota);
      }

      return result;
    },
    [profile, session, status.planId]
  );

  const value = useMemo(
    () => ({
      status,
      isVip: status.isVip,
      loading,
      dailyQuota,
      testPlan: null,
      setTestPlan,
      claimDownload,
      refreshMembership: fetchMembership,
    }),
    [status, loading, dailyQuota, setTestPlan, claimDownload, fetchMembership]
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
