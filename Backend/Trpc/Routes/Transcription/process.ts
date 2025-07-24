import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import type { TranscriptionRequest, TranscriptionResponse } from "@/types/shared";

const processInputSchema = z.object({
  imageBase64: z.string(),
});

export default publicProcedure
  .input(processInputSchema)
  .mutation(async ({ input, ctx }): Promise<TranscriptionResponse> => {
    try {
      // Create a system prompt for the OCR task
      const systemPrompt = `You are an expert OCR system specialized in handwriting recognition.
      Your task is to accurately transcribe handwritten text from images.
      
      Guidelines:
      1. Transcribe ALL text visible in the image, preserving the original structure
      2. Maintain paragraph breaks and formatting where visible
      3. If text is unclear, make your best guess but don't add [?] or similar markers
      4. Don't describe the image or add any commentary
      5. If you can't read something at all, use ... as a placeholder
      6. Preserve bullet points, numbering, and other formatting elements
      7. For mathematical equations, use standard notation
      8. Return ONLY the transcribed text, nothing else
      
      IMPORTANT: Focus solely on text transcription. Do not analyze, summarize, or comment on the content.`;

      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please transcribe all the handwritten text in this image accurately."
            },
            {
              type: "image",
              image: input.imageBase64
            }
          ]
        }
      ];

      // Make a single API call without complex retry logic
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError: unknown) {
        console.error('JSON parsing error:', jsonError);
        const errorMsg = jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error';
        throw new Error(`Failed to parse API response: ${errorMsg}`);
      }
      
      // Validate the response
      if (!data.completion || data.completion.trim().length < 5) {
        throw new Error("Received empty or invalid response from OCR API");
      }
      
      return {
        text: data.completion,
        confidence: 85,
        language: "en",
        processingTime: Date.now()
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Provide a fallback response for development
      if (__DEV__) {
        console.log("Using fallback response due to API error in development", errorMessage);
        return {
          text: "This is mock transcription data because we couldn't connect to the OCR service.\n\nIn a real app, this would be the result of processing your handwritten image through an OCR service.\n\nYou can still edit this text manually and test the app's features.",
          confidence: 0,
          language: "en",
          processingTime: Date.now(),
          fallbackUsed: true,
          error: errorMessage
        };
      }
      
      throw new Error(`Failed to process handwriting: ${errorMessage}`);
    }
  });
