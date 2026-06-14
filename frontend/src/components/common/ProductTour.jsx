import { useEffect, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export default function ProductTour() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if the user hasn't seen it yet
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Small delay to let the dashboard render
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  const steps = [
    {
      target: '#sidebar',
      content: t('Welcome to the Command Center! Use this sidebar to navigate through the modules.'),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '#railway-map',
      content: t('This is the Digital Twin Network map. Click on any rake (train) to see its live telemetry and request an AI reallocation decision.'),
      placement: 'bottom',
    },
    {
      target: '.sustainability-bar',
      content: t('Track our live sustainability impact here, including revenue saved and CO2 reduced.'),
      placement: 'bottom',
    },
    {
      target: '#nav-fleet-triage',
      content: t('Sort and manage the health of your entire fleet here.'),
      placement: 'right',
    },
    {
      target: '#nav-track-health',
      content: t('Run predictive machine learning diagnostics on our tracks.'),
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
