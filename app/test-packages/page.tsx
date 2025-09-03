"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import TestTable from "./components/package-table";
import { StepperCreate } from "./components/stepper";
import CreateNewTest from "./stepper/create-package/create-package";
import ManageQuestions from "./stepper/manage-question/manage-question";
import PublishTestPage from "./stepper/review-packages/review-package";
import { IconKey } from "@/lib/icon-mapping";
import { QuestionType } from "./stepper/manage-question/service/manage-question-service";

type StepData = {
  testId: string; // ✅ tambah
  testName: string;
  icon: IconKey;
  targetPosition: string;
  allowedTypes: QuestionType[];
};

export default function TestManagementPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);

  // Default data kosong
  const [stepData, setStepData] = useState<StepData>({
    testId: "",
    testName: "",
    icon: "square-code",
    targetPosition: "",
    allowedTypes: ["DISC", "CAAS", "Fast Accuracy"],
  });

  // Handler untuk mulai stepper dari awal
  function handleAddNewTest() {
    setActiveStep(0);
    setShowStepper(true);
  }

  // Handler ke step berikutnya
  function handleNext() {
    setActiveStep((prev) => (prev !== null ? prev + 1 : 1));
  }

  function handleBack() {
    if (activeStep === 0 || activeStep === null) {
      setShowStepper(false); // Kembali ke test table
      setActiveStep(null);
    } else {
      setActiveStep((prev) => (prev ? prev - 1 : 0));
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-white">
        <Topbar />
        <main className="flex-1 px-8 pt-2 pb-8">
          {showStepper ? (
            <>
              <StepperCreate activeStep={activeStep ?? 0} />
              {/* Step 1: Create New Test */}
              {activeStep === 0 && (
                <CreateNewTest
                  onNext={(data) => {
                    setStepData({
                      testId: Date.now().toString(), // ✅ generate id unik
                      testName: data.testName,
                      icon: data.icon,
                      targetPosition: data.targetPosition,
                      allowedTypes: data.selectedTypes,
                    });
                    handleNext();
                  }}
                  onBack={handleBack}
                />
              )}
              {/* Step 2: Manage Questions */}
              {activeStep === 1 && (
                <ManageQuestions
                  testId={stepData.testId} // ✅ tambahin ini
                  testName={stepData.testName}
                  testIcon={stepData.icon}
                  targetPosition={stepData.targetPosition}
                  allowedTypes={stepData.allowedTypes}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {/* Step 4: Publish Test */}
              {activeStep === 2 && (
                <PublishTestPage
                  testName={stepData.testName}
                  testIcon={stepData.icon}
                  targetPosition={stepData.targetPosition}
                  allowedTypes={stepData.allowedTypes}
                  onBack={handleBack}
                  onPublishSuccess={() => {
                    setShowStepper(false);
                    setActiveStep(null);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <TitleBar onAddTest={handleAddNewTest} />
              <TestTable />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
