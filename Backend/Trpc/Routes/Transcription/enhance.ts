import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import type { TranscriptionRequest, EnhancementResponse } from "@/types/shared";

const enhanceInputSchema = z.object({
  imageBase64: z.string(),
  text: z.string(),
  type: z.enum(["basic", "numbers", "smart", "completion", "complex-words"]),
});

export default publicProcedure
  .input(enhanceInputSchema)
  .mutation(async ({ input, ctx }): Promise<EnhancementResponse> => {
    try {
      let systemPrompt = "";
      
      switch (input.type) {
        case "basic":
          systemPrompt = "You are an expert at enhancing handwritten English text transcriptions. " +
           "Focus specifically on: " +
           "1. Fixing basic spelling errors " +
           "2. Correcting simple grammatical mistakes " +
           "3. Ensuring proper capitalization " +
           "4. Fixing basic punctuation " +
           "5. Maintaining the original meaning " +
           
           "Return the text with these basic improvements only. " +
           
           "IMPORTANT: Keep your changes minimal and focused on clarity rather than style. " +
           "Do not add or remove content, just fix obvious errors.";
          break;
          
        case "numbers":
          systemPrompt = "You are an expert at analyzing handwritten numbers and mathematical expressions in English. " +
           "Focus specifically on: " +
           "1. Identifying and correcting unclear numbers " +
           "2. Verifying mathematical operations " +
           "3. Ensuring numerical consistency " +
           "4. Maintaining proper decimal places and units " +
           "5. Checking for mathematical errors " +
           
           "Return the text with corrected numbers only. " +
           
           "IMPORTANT: If you can't see any numbers in the image or text, still try to improve the text in other ways " +
           "such as fixing formatting or clarifying ambiguous text.";
          break;
          
        case "completion":
          systemPrompt = "You are an expert at completing missing words and letters in handwritten English text. " +
           "Focus specifically on: " +
           "1. Identifying incomplete words or sentences " +
           "2. Filling in missing letters within words " +
           "3. Adding missing words where sentences are incomplete " +
           "4. Ensuring grammatical completeness " +
           "5. Maintaining the original meaning and context " +
           "6. Marking your additions with [brackets] so they can be identified " +
           
           "Return the completed text with missing words and letters filled in. " +
           "IMPORTANT: Put all your additions in [square brackets] so they can be easily identified. " +
           
           "If the text appears complete already, look for subtle gaps in meaning or logic and suggest small improvements.";
          break;
          
        case "complex-words":
          systemPrompt = "You are an expert at clarifying complex terminology and technical words in handwritten English text. " +
           "Focus specifically on: " +
           "1. Identifying technical terms, jargon, or complex words " +
           "2. Verifying the spelling and usage of these terms " +
           "3. Providing clarification for ambiguous technical terms " +
           "4. Ensuring consistency in terminology " +
           "5. Maintaining the original meaning while improving clarity " +
           
           "Return the text with clarified complex terminology. " +
           
           "IMPORTANT: If you need to add clarifications, put them in [square brackets]. " +
           "Focus only on complex or technical terms - don't modify simple everyday words.";
          break;
          
        case "smart":
        default:
          systemPrompt = "You are an expert at enhancing handwritten English text transcriptions. " +
           "Analyze both the image and text to: " +
           "1. Improve clarity while preserving original meaning " +
           "2. Fix grammatical errors " +
           "3. Ensure proper punctuation " +
           "4. Maintain natural language flow " +
           "5. Resolve ambiguities using context " +
           "6. Verify technical terms and proper nouns " +
           "7. Complete any missing words or letters " +
           
           "Return the enhanced text while staying true to the original content. " +
           
           "IMPORTANT: Even if the handwriting is very messy or the transcription seems poor, " +
           "do your best to extract meaning and improve it. Focus on making the text more readable " +
           "and coherent while preserving the original intent.";
          break;
      }

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
              text: input.type === "completion" 
                ? "Please complete this transcribed English text by filling in missing words and letters: \"" + input.text + "\""
                : input.type === "numbers"
                  ? "Please analyze and correct any numbers in this transcribed text: \"" + input.text + "\""
                  : input.type === "complex-words"
                    ? "Please clarify any complex or technical terms in this transcribed text: \"" + input.text + "\""
                    : input.type === "basic"
                      ? "Please make basic improvements to this transcribed text (spelling, grammar, punctuation): \"" + input.text + "\""
                      : "Please enhance this transcribed English text while preserving its meaning: \"" + input.text + "\""
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
        throw new Error("Received empty or invalid response from enhancement API");
      }
      
      // For completion type, extract the additions (text in square brackets)
      let changes = [];
      if (input.type === "completion" || input.type === "complex-words") {
        const regex = /\[(.*?)\]/g;
        let match;
        const additions = [];
        
        while ((match = regex.exec(data.completion)) !== null) {
          additions.push({
            addition: match[0],
            text: match[1]
          });
        }
        
        changes = additions.map(addition => ({
          original: "",
          enhanced: addition.text,
          reason: input.type === "completion" 
            ? "Missing word or letter completed" 
            : "Complex term clarified"
        }));
      } else {
        changes = [
          {
            original: input.text,
            enhanced: data.completion,
            reason: input.type === "numbers" 
              ? "Numbers clarified and verified"
              : input.type === "basic"
                ? "Basic text improvements applied"
                : "Text enhanced with improved clarity and context"
          }
        ];
      }
      
      return {
        text: data.completion,
        confidence: input.type === "smart" ? 90 : input.type === "numbers" ? 85 : input.type === "basic" ? 95 : 80,
        changes
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Provide a fallback enhancement if possible
      if (input.text) {
        console.log("Using fallback enhancement due to API error:", errorMessage);
        
        let enhancedText = input.text;
        
        // Apply some basic enhancements based on the type
        if (input.type === "completion") {
          // Add some placeholder completions
          enhancedText = enhancedText.replace(/(\w+)\.{3}/g, "$1[...]");
        } else if (input.type === "numbers") {
          // No specific fallback for numbers
        } else if (input.type === "basic") {
          // For basic enhancement, apply simple fixes
          enhancedText = enhancedText
            .replace(/\s+/g, " ")
            .replace(/\s+\./g, ".")
            .replace(/\s+,/g, ",")
            .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
            .trim();
        } else if (input.type === "complex-words") {
          // No specific fallback for complex words
        } else {
          // For smart enhancement, just clean up some common issues
          enhancedText = enhancedText
            .replace(/\s+/g, " ")
            .replace(/\s+\./g, ".")
            .replace(/\s+,/g, ",")
            .trim();
        }
        
        return {
          text: enhancedText,
          confidence: 50, // Low confidence for fallback
          fallbackUsed: true,
          error: errorMessage,
          changes: [{
            original: input.text,
            enhanced: enhancedText,
            reason: "Fallback enhancement applied due to API error"
          }]
        };
      }
      
      throw new Error(`Failed to enhance text: ${errorMessage}`);
    }
  });
