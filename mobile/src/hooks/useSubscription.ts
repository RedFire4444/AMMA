import { useState, useEffect, useCallback } from 'react';
import {
  subscriptionService,
  SubscriptionStatus,
} from '../services/subscription.service';

interface UseSubscriptionReturn {
  isPremium: boolean;
  planType: SubscriptionStatus['planType'];
  expiresAt: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    planType: 'free',
    status: 'none',
    expiresAt: null,
    isPremium: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionService.getStatus();
      setStatus(data);
    } catch {
      // Default to free if fetch fails
      setStatus({
        planType: 'free',
        status: 'none',
        expiresAt: null,
        isPremium: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isPremium: status.isPremium,
    planType: status.planType,
    expiresAt: status.expiresAt,
    isLoading,
    refresh,
  };
};
