import { useEffect, useState } from "react";
import { createNewTest } from "../service/create-package-service";

// Available test types
export const TEST_TYPES = [
  { label: "DISC", value: "DISC", icon: "briefcase" },
  { label: "CAAS", value: "CAAS", icon: "graduation-cap" },
  { label: "Fast Accuracy", value: "Fast Accuracy", icon: "users" },
];

export const TEMPLATES = [
  {
    label: "Manager",
    sequence: ["DISC", "CAAS"],
  },
  {
    label: "Fresh Graduate",
    sequence: ["CAAS", "Fast Accuracy"],
  },
  {
    label: "Staff",
    sequence: ["DISC", "Fast Accuracy"],
  },
];

const POSITION_TEMPLATE_MAP: Record<string, string> = {
  Managerial: "Manager",
  "Fresh Graduates": "Fresh Graduate",
  Staff: "Staff",
};

export function useCreateNewTestForm() {
  const [icon, setIcon] = useState<"square-code" | "graduation-cap" | "user-search">("square-code");
  const [testName, setTestName] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [accessType, setAccessType] = useState("public");
  // Default pakai string[], di page kita filter ke QuestionType[]
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const label = POSITION_TEMPLATE_MAP[targetPosition];
    if (label) {
      const template = TEMPLATES.find((t) => t.label === label);
      if (template) {
        setSelectedTypes(template.sequence);
        setSelectedTemplate(label);
      }
    }
  }, [targetPosition]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setSelectedTemplate(null);
  };

  const applyTemplate = (label: string) => {
    const template = TEMPLATES.find((t) => t.label === label);
    if (template) {
      setSelectedTypes(template.sequence);
      setSelectedTemplate(label);
    }
  };

  const handleSubmit = async (options?: { overrideTargetPosition?: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        icon,
        testName,
        targetPosition: options?.overrideTargetPosition ?? targetPosition,
        accessType,
        sequence: selectedTypes,
        template: selectedTemplate,
      };
      await createNewTest(payload);
      setSuccess(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Failed to create test");
      } else {
        setError("Failed to create test");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    icon,
    setIcon,
    testName,
    setTestName,
    targetPosition,
    setTargetPosition,
    accessType,
    setAccessType,
    selectedTypes,
    setSelectedTypes,
    selectedTemplate,
    setSelectedTemplate,
    handleTypeToggle,
    applyTemplate,
    handleSubmit,
    loading,
    error,
    success,
    setSuccess,
  };
}
