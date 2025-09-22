import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './tutorial.css';
import Rachel from '../assets/rachel.png';

const tutorialSteps = [
  {
    content: [
      "Welcome to My Lyfe in five! I'm Rachel, and I'll guide you through everything you will need to know. You'll learn how to manage your money, track your health goals, and plan for your future!",
      "We'll create life scenarios, set up your financial tools, and check your health progress.",
      "You can always come back to this guide if you need a refresher."
    ]
  },
  {
    content: [
      "Let's start with Life Scenarios. These help you plan for different situations - maybe you're a college student, working professional, or planning for a big change.",
      "Each scenario lets you manage separate financial plans and health tracking. This way, you can explore different paths and see what works best.",
      "Click on me to start setting up your first scenario."
    ]
  },
  {
    content: [
      "Once you've created a life scenario, you'll have access to two main tools: Finance and Health.",
      "The Finance section helps you track income, expenses, and savings goals. You can set budgets and watch your progress over time.",
      "The Health section lets you monitor exercise, nutrition, and wellness goals specific to each life scenario."
    ]
  }
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigate('/front');
  };

  const handleSkip = () => {
    navigate('/front');
  };

  return (
    <div className="tutorial-root">
      <div className="tutorial-overlay" />
      <div className="rachel-container">
        <img src={Rachel} alt="Rachel" className="rachel-image" />
      </div>
      <main className="tutorial-card">
        <h1 className="tutorial-title">Tutorial</h1>
        <button className="skip-button" onClick={handleSkip}>
          skip tutorial
        </button>
        <div className="tutorial-content">
          {tutorialSteps[currentStep].content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="tutorial-navigation">
          <div className="tutorial-nav-buttons">
            {currentStep > 0 && (
              <button className="back-button" onClick={handleBack}>
                Back
              </button>
            )}
            {currentStep < tutorialSteps.length - 1 ? (
              <button className="next-button" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="next-button" onClick={handleFinish}>
                Finish
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
