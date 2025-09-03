// src/app/users/[id]/components/CandidateTestPage.tsx
"use client";
import React from "react";
import { VerificationDialog } from "./verification-dialog";
import { ReminderPage } from "./reminder-page";
import { QuizPage } from "./quiz-page";
import { FinishedDialog } from "./finished-dialog";
import { CompletionDialog } from "./completion-dialog";
import { TopBarTest } from "./top-bar"; // <--- IMPORT TOPBAR
import { useCandidateTest } from "../hooks/use-candidate-test";

export default function CandidateTestPage() {
  const {
    step,
    candidate,
    tests,
    currentTest,
    questions,
    timer,
    verify,
    startQuiz,
    finishTest,
    nextTest,
  } = useCandidateTest();

  function handleContactHRD() {
    alert("Hubungi HRD diklik. (Ganti dengan aksi asli)");
  }
  function handleDownload() {
    alert("Unduh Sertifikat diklik. (Ganti dengan aksi asli)");
  }

  const lastTest = tests[tests.length - 1];
  const testId = lastTest ? lastTest.id : "-";
  const dateObj = new Date();
  const dateStr = dateObj.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });

  // --- TAMBAHKAN TOPBAR HANYA DI STEP YANG BUKAN LOGIN ---
  const showTopBar =
    step !== "login" && candidate && (currentTest || step === "completed");

  return (
    <>
      {/* TOPBAR MUNCUL KECUALI SAAT LOGIN */}
      {showTopBar && (
        <TopBarTest
          testTitle={currentTest?.name ?? lastTest?.name ?? "-"}
          testType={candidate?.position}
          candidateName={candidate?.name ?? "-"}
          candidateRole="Candidate"
        />
      )}

      {step === "login" && <VerificationDialog onVerify={verify} />}
      {step === "reminder" && candidate && (
        <ReminderPage candidate={candidate} tests={tests} onStart={startQuiz} />
      )}
      {step === "quiz" && currentTest && (
        <QuizPage
          questions={questions}
          test={currentTest}
          timer={timer}
          onFinish={finishTest}
          onExpire={nextTest}
        />
      )}
      {step === "finished" && currentTest && (
        <FinishedDialog
          test={currentTest}
          onNext={nextTest}
          isLast={!tests[currentTest.index + 1]}
        />
      )}
      {step === "completed" && (
        <CompletionDialog
          onContact={handleContactHRD}
          onDownload={handleDownload}
          testId={testId}
          date={dateStr}
        />
      )}
    </>
  );
}
