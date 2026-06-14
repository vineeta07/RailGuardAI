import { useEffect, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

import { useAuth } from '../../hooks/useAuth';

export default function ProductTour() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Only run the tour if this specific user hasn't seen it yet
    const key = `hasSeenTour_${user.email}`;
    const hasSeenTour = localStorage.getItem(key);
    if (!hasSeenTour) {
      // Small delay to let the dashboard render
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`hasSeenTour_${user.email}`, 'true');
      }
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const steps = isMobile ? [
    {
      target: '.mobile-menu-btn',
      content: t('Welcome! Tap this menu icon to navigate through the modules.'),
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.kpi-grid',
      content: t('Track live sustainability impact here, including revenue saved and CO2 reduced.'),
      placement: 'bottom',
    },
    {
      target: '.triage-feed',
      content: t('Keep an eye on the Active Triage feed for real-time critical alerts from the fleet.'),
      placement: 'top',
    }
  ] : [
    {
      target: '#sidebar',
      content: t('Welcome to the Command Center! Use this sidebar to navigate through the modules.'),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '.kpi-grid',
      content: t('Track our live sustainability impact here, including revenue saved and CO2 reduced.'),
      placement: 'bottom',
    },
    {
      target: '#nav-track-health',
      content: t('To use the ML Predictors, navigate to the Track Health page. You can input sensor readings to instantly predict failure probabilities!'),
      placement: 'right',
    },
    {
      target: '#nav-fleet-triage',
      content: t('Sort and manage the health of your entire fleet here. It pulls data directly from our PostgreSQL database.'),
      placement: 'right',
    },
    {
      target: '#nav-forward-vision',
      content: t('Monitor the live YOLOv11 obstacle detection feed to prevent collisions.'),
      placement: 'right',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'var(--accent)',
          backgroundColor: theme === 'dark' ? 'var(--bg-surface)' : '#ffffff',
          textColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
          arrowColor: theme === 'dark' ? 'var(--bg-surface)' : '#ffffff',
          overlayColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
        },
      }}
    />
  );
}
