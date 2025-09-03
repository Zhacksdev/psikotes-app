// Question Type
export type QuestionType = "DISC" | "CAAS" | "Fast Accuracy";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  mediaUrl?: string;
  category: string;
  options?: { [key: string]: string };
  answer?: string;
}

let dummyQuestions: Question[] = [
  {
    id: "1",
    type: "DISC",
    text: "Saya suka mengambil kendali ketika bekerja dalam tim",
    category: "Kepemimpinan",
    options: { D: "Dominance", I: "Influence", S: "Steadiness", C: "Compliance" },
  },
  {
    id: "2",
    type: "CAAS",
    text: "Saya menikmati bertemu orang baru dalam acara sosial",
    category: "Sosial",
    options: { A: "Sangat Setuju", B: "Setuju", C: "Netral", D: "Tidak Setuju" },
    answer: "A",
  },
  {
    id: "3",
    type: "Fast Accuracy",
    text: "Saya selalu memeriksa ulang pekerjaan saya untuk memastikan keakuratannya",
    category: "Konsentrasi",
    options: { True: "Benar", False: "Salah" },
    answer: "True",
  },
];

export async function getQuestions(type?: QuestionType, search?: string) {
  return dummyQuestions.filter(q =>
    (!type || q.type === type) &&
    (!search || q.text.toLowerCase().includes(search.toLowerCase()))
  );
}

export async function addQuestion(question: Omit<Question, "id">) {
  const newQ = { ...question, id: Date.now().toString() };
  dummyQuestions.push(newQ);
  return newQ;
}

export async function updateQuestion(id: string, data: Partial<Question>) {
  const idx = dummyQuestions.findIndex(q => q.id === id);
  if (idx !== -1) dummyQuestions[idx] = { ...dummyQuestions[idx], ...data };
  return dummyQuestions[idx];
}

export async function deleteQuestion(id: string) {
  dummyQuestions = dummyQuestions.filter(q => q.id !== id);
  return true;
}
