import { api } from "./api";

export interface AiResponse {
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  department?: string;
  skills?: string;
  answer?: string;
}

export const aiService = {
  // AI 
  async ask(question: string): Promise<string> {
    // Backend  String 
    return api.post<string>("/api/ai/ask", { question });
  },

  // CV එකක් upload  (AI Resume Parser)
  async processCv(file: File): Promise<AiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    // fetch  FormData 
    const token = localStorage.getItem("token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://drop-pick-production.up.railway.app"}/api/ai/process-cv`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error("Failed to process CV");
    return response.json();
  }
};