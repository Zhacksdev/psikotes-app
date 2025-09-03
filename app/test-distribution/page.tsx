"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopBar";
import TitleBar from "./components/title-bar";
import DistributionTable from "./components/session-table";
import { StepperCreate } from "./components/stepper";

// Stepper Steps
import AddPackageStep from "./stepper/add-packages/add-packages";
import CandidatesDistributions from "./stepper/candidate-distribution/candidate-distribution";

// Provider state global antar step
import { MakeSessionProvider } from "./hooks/use-make-session";

export default function TestDistributionPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showStepper, setShowStepper] = useState(false);

  // mulai bikin session baru
  function handleCreate() {
    setShowStepper(true);
    setActiveStep(0);
  }

  // next step
  function handleNext() {
    setActiveStep((prev) => (prev !== null ? prev + 1 : 1));
  }

  // back step
  function handleBack() {
    if (activeStep === 0) {
      setShowStepper(false);
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
            <MakeSessionProvider>
              {/* Stepper progress indicator */}
              <StepperCreate activeStep={activeStep ?? 0} />

              {/* STEP 1: pilih paket */}
              {activeStep === 0 && (
                <AddPackageStep onNext={handleNext} onCancel={handleBack} />
              )}

              {/* STEP 2 */}
              {activeStep === 1 && (
                <CandidatesDistributions
                  onBack={handleBack}
                  onNext={handleNext} // klik Send All → ke step 2 → step 3
                />
              )}

              {/* STEP 3 */}
              {activeStep === 2 && (
                <CandidatesDistributions
                  onBack={handleBack}
                  onNext={() => {
                    setShowStepper(false);
                    setActiveStep(null); // ✅ klik Finish → kembali tabel utama
                  }}
                />
              )}
            </MakeSessionProvider>
          ) : (
            <>
              {/* Default tampilan sebelum klik "Add New Test" */}
              <TitleBar onAddTest={handleCreate} />
              <DistributionTable />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
