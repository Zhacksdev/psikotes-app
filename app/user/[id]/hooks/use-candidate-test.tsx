// src/app/users/[id]/hooks/useCandidate.ts
import { useState } from "react";
import candidateService from "../services/candidate-service";
import quizService from "../services/quiz-service";
import { Candidate, TestInfo } from "../components/reminder-page";
import { Question } from "../components/question-card";
import { Test } from "../components/finished-dialog";

export function useCandidateTest() {
  const [step, setStep] = useState<
    "login" | "reminder" | "quiz" | "finished" | "completed"
  >("login");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timer, setTimer] = useState<number>(0);

  const verify = async (nik: string) => {
    const data = await candidateService.verifyCandidate(nik);
    setCandidate(data);
    const t = await candidateService.getTests(nik);
    setTests(t);
    setStep("reminder");
  };

  const startQuiz = async () => {
    if (tests.length === 0) return;
    const first = tests[0];
    const initTest: Test = {
      ...first,
      index: 0,
      total: tests.length,
    };
    setCurrentTest(initTest);
    setQuestions(await quizService.getQuestions(first.id));
    setTimer(first.duration * 60);
    setStep("quiz");
  };

  const finishTest = () => {
    setStep("finished");
  };

  const nextTest = async () => {
    if (!currentTest) return;
    const nextIndex = currentTest.index + 1;
    if (nextIndex < tests.length) {
      const info = tests[nextIndex];
      const next: Test = {
        ...info,
        index: nextIndex,
        total: tests.length,
      };
      setCurrentTest(next);
      setQuestions(await quizService.getQuestions(next.id));
      setTimer(info.duration * 60);
      setStep("quiz");
    } else {
      setStep("completed");
    }
  };

  const reset = () => {
    setStep("login");
    setCandidate(null);
    setTests([]);
    setCurrentTest(null);
    setQuestions([]);
    setTimer(0);
  };

  return {
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
    reset,
  };
}
