// ===== Iraqi Legal Assistant - Question Engine =====
import type {
  CaseType,
  Question,
  QuestionAnswer,
  QuestionCondition,
} from "../types";
import { getQuestions } from "../settings-store";

// === Question Engine Class ===
export class QuestionEngine {
  private questions: Question[];
  private answers: QuestionAnswer[] = [];
  private caseType: CaseType = "unknown";

  constructor() {
    this.questions = getQuestions();
  }

  // === Set Case Type ===
  setCaseType(caseType: CaseType): void {
    this.caseType = caseType;
  }

  // === Get Next Question ===
  getNextQuestion(): Question | null {
    const caseQuestions = this.getCaseQuestions();

    for (const question of caseQuestions) {
      // Check if already answered
      const alreadyAnswered = this.answers.some(
        (a) => a.questionId === question.id
      );
      if (alreadyAnswered) continue;

      // Check conditions
      if (question.condition) {
        const conditionMet = this.checkCondition(question.condition);
        if (!conditionMet) continue;
      }

      // Check priority (return highest priority unanswered)
      return question;
    }

    return null; // All questions answered
  }

  // === Get All Remaining Questions ===
  getRemainingQuestions(): Question[] {
    const caseQuestions = this.getCaseQuestions();
    const remaining: Question[] = [];

    for (const question of caseQuestions) {
      // Check if already answered
      const alreadyAnswered = this.answers.some(
        (a) => a.questionId === question.id
      );
      if (alreadyAnswered) continue;

      // Check conditions
      if (question.condition) {
        const conditionMet = this.checkCondition(question.condition);
        if (!conditionMet) continue;
      }

      remaining.push(question);
    }

    return remaining;
  }

  // === Answer a Question ===
  answerQuestion(questionId: string, answer: string): void {
    // Remove existing answer for this question
    this.answers = this.answers.filter((a) => a.questionId !== questionId);

    // Add new answer
    this.answers.push({
      questionId,
      answer,
      timestamp: Date.now(),
    });
  }

  // === Get All Answers ===
  getAnswers(): QuestionAnswer[] {
    return [...this.answers];
  }

  // === Calculate Completion Percentage ===
  getCompletionPercentage(): number {
    const requiredQuestions = this.getCaseQuestions().filter(
      (q) => q.required
    );
    if (requiredQuestions.length === 0) return 100;

    const answeredRequired = requiredQuestions.filter((q) =>
      this.answers.some((a) => a.questionId === q.id)
    );

    return Math.round(
      (answeredRequired.length / requiredQuestions.length) * 100
    );
  }

  // === Reset ===
  reset(): void {
    this.answers = [];
    this.caseType = "unknown";
  }

  // === Private Helpers ===

  private getCaseQuestions(): Question[] {
    return this.questions
      .filter((q) => q.caseType === this.caseType || q.caseType === "unknown")
      .sort((a, b) => a.priority - b.priority);
  }

  private checkCondition(condition: QuestionCondition): boolean {
    const dependentAnswer = this.answers.find(
      (a) => a.questionId === condition.dependsOn
    );
    if (!dependentAnswer) return false;

    if (condition.equals !== undefined) {
      return dependentAnswer.answer === String(condition.equals);
    }

    if (condition.contains !== undefined) {
      return dependentAnswer.answer
        .toLowerCase()
        .includes(condition.contains.toLowerCase());
    }

    return true;
  }
}

// === Format Question for Display ===
export function formatQuestion(question: Question): string {
  let text = question.text;

  // Add options if available
  if (question.options && question.options.length > 0) {
    text += "\n\nالخيارات:\n";
    question.options.forEach((opt, idx) => {
      text += `${idx + 1}. ${opt.label}\n`;
    });
  }

  return text;
}

// === Get Question by ID ===
export function getQuestionById(id: string): Question | undefined {
  const questions = getQuestions();
  return questions.find((q) => q.id === id);
}
