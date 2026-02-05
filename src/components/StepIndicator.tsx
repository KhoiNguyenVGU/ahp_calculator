'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`step-indicator ${
                index < currentStep
                  ? 'step-completed'
                  : index === currentStep
                  ? 'step-active'
                  : 'step-inactive'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span
              className={`text-xs mt-1 ${
                index === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-2 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
