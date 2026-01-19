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
  /**
   * Sends a general HR or data-related question to the AI.
   * The backend uses RAG to answer based on your database.
   */
  async ask(question: string): Promise<string> {
    // Note: Ensure your axios/api instance is configured to handle string responses
    const response = await api.post("/api/ai/ask", { question });
    return typeof response === 'string' ? response : response.data;
  },

  /**
   * Uploads a PDF CV to the AI Resume Parser.
   * Uses multipart/form-data to send the file to Spring Boot.
   */
  async processCv(file: File): Promise<AiResponse> {
    const formData = new FormData();
    formData.append("file", file); // Key must match @RequestParam("file") in Java

    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://drop-pick-production.up.railway.app";

    const response = await fetch(`${baseUrl}/api/ai/process-cv`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to process CV");
    }

    return response.json();
  }
};