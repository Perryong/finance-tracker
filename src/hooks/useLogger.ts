import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

/**
 * React hook for component-level logging
 */
export function useLogger(componentName: string) {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    // Log component mount
    logger.debug('COMPONENT_LIFECYCLE', `${componentName} mounted`, {
      component: componentName,
      mountTime: mountTime.current
    });

    return () => {
      // Log component unmount
      const lifespan = Date.now() - mountTime.current;
      logger.debug('COMPONENT_LIFECYCLE', `${componentName} unmounted`, {
        component: componentName,
        lifespanMs: lifespan,
        totalRenders: renderCount.current
      });
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 1) {
      logger.debug('COMPONENT_LIFECYCLE', `${componentName} re-rendered`, {
        component: componentName,
        renderCount: renderCount.current
      });
    }
  });

  return {
    logUserAction: (action: string, metadata?: Record<string, any>) => {
      logger.logUserAction(`${componentName}: ${action}`, {
        component: componentName,
        ...metadata
      });
    },
    logError: (action: string, error: string, metadata?: Record<string, any>) => {
      logger.error('COMPONENT_ERROR', `${componentName}: ${action}`, error, {
        component: componentName,
        ...metadata
      });
    },
    logWarning: (action: string, warning: string, metadata?: Record<string, any>) => {
      logger.warning('COMPONENT_WARNING', `${componentName}: ${action}`, warning, {
        component: componentName,
        ...metadata
      });
    },
    logInfo: (action: string, metadata?: Record<string, any>) => {
      logger.info('COMPONENT_INFO', `${componentName}: ${action}`, {
        component: componentName,
        ...metadata
      });
    }
  };
}

// Example usage in a component:
/*
function TransactionForm() {
  const { logUserAction, logError, logInfo } = useLogger('TransactionForm');

  const handleSubmit = async (data) => {
    try {
      logInfo('Form submission started', { formData: data });
      
      const result = await submitTransaction(data);
      
      logUserAction('Transaction created', {
        transactionId: result.id,
        amount: data.amount,
        category: data.category
      });
    } catch (error) {
      logError('Form submission failed', error.message, { formData: data });
    }
  };

  return (
    // Component JSX
  );
}
*/