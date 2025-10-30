import { useState } from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

interface AppTourProps {
  run: boolean;
  onComplete: () => void;
}

const AppTour = ({ run, onComplete }: AppTourProps) => {
  const [steps] = useState<Step[]>([
    {
      target: 'body',
      content: 'Bienvenido al Sistema Electoral ONPE. Este sistema permite tanto la votación pública como la administración electoral con herramientas de análisis avanzado.',
      placement: 'center',
    },
    {
      target: '[href="/"]',
      content: 'En la página principal, los ciudadanos pueden votar por sus candidatos preferidos de manera segura.',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: 'Los administradores pueden acceder a herramientas avanzadas de análisis electoral usando Pandas, NumPy, Scikit-Learn y PyTorch para procesar y modelar datos electorales.',
      placement: 'center',
      disableBeacon: true,
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(215 100% 32%)',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: 'hsl(215 100% 32%)',
        },
        buttonBack: {
          color: 'hsl(215 100% 32%)',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
};

export default AppTour;
