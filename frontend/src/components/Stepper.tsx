import React from 'react';
import styles from './Stepper.module.css';

interface StepperProps {
  steps: string[];
  subtitles?: (string | null)[];
  currentStep: number;
}

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const Stepper: React.FC<StepperProps> = ({ steps, subtitles = [], currentStep }) => {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return(
            <React.Fragment key={index}>
            <div className={`${styles.stepItem} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}>
                <div className={styles.stepCircle}>
                    {isCompleted ? <CheckIcon /> : stepNumber}
                </div>
                <div className={styles.stepInfo}>
                    <div className={styles.stepLabel}>{label}</div>
                    {/* Esta línea ahora es segura gracias a la corrección de tipos */}
                    {subtitles[index] && <div className={styles.stepSubtitle}>{subtitles[index]}</div>}
                </div>
            </div>
            {index < steps.length - 1 && <div className={`${styles.stepConnector} ${isCompleted ? styles.completed : ''}`}></div>}
            </React.Fragment>
        );
    })}
    </div>
  );
};

export default Stepper;

