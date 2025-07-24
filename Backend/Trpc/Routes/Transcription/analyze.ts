import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const analyzeInputSchema = z.object({
  imageBase64: z.string().optional(),
  text: z.string(),
});

export default publicProcedure
  .input(analyzeInputSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      // Create a system prompt for the analysis task
      const systemPrompt = `You are an expert at analyzing handwritten text.
      Your task is to provide insights about the given text.
      
      Please analyze the text for:
      1. Main topics or themes
      2. Key points
      3. Sentiment (positive, negative, neutral)
      4. Formality level
      5. Any notable patterns or characteristics
      
      Return your analysis in a structured format.`;

      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: input.imageBase64 
            ? [
                {
                  type: "text",
                  text: `Please analyze this text: "${input.text}"`
                },
                {
                  type: "image",
                  image: input.imageBase64
                }
              ]
            : `Please analyze this text: "${input.text}"`
        }
      ];

      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
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
      
      // Parse the analysis into a structured format
      const analysisText = data.completion;
      
      // Extract topics, sentiment, etc. from the analysis text
      // This is a simplified version - in a real app, you'd use more robust parsing
      const topics = extractTopics(analysisText);
      const sentiment = extractSentiment(analysisText);
      const formality = extractFormality(analysisText);
      const keyPoints = extractKeyPoints(analysisText);
      
      return {
        analysis: analysisText,
        topics,
        sentiment,
        formality,
        keyPoints,
        wordCount: input.text.split(/\s+/).filter(Boolean).length,
        characterCount: input.text.length,
        processingTime: Date.now()
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Provide a fallback response for development
      if (__DEV__) {
        console.log("Using fallback response due to API error in development:", errorMessage);
        return {
          analysis: "Unable to perform detailed analysis due to API connection issues.",
          topics: ["Topic analysis unavailable"],
          sentiment: "neutral",
          formality: "medium",
          keyPoints: ["Key points extraction unavailable"],
          wordCount: input.text.split(/\s+/).filter(Boolean).length,
          characterCount: input.text.length,
          processingTime: Date.now(),
          fallbackUsed: true,
          error: errorMessage
        };
      }
      
      throw new Error(`Failed to analyze text: ${errorMessage}`);
    }
  });

// Helper functions to extract information from the analysis text
function extractTopics(text: string): string[] {
  // Simple extraction based on keywords
  const topicsSection = text.match(/topics?|themes?|subject|about/i);
  if (!topicsSection) return ["No clear topics identified"];
  
  // Find sentences that might contain topics
  const sentences = text.split(/[.!?]/).filter(s => 
    s.toLowerCase().includes("topic") || 
    s.toLowerCase().includes("theme") || 
    s.toLowerCase().includes("about") ||
    s.toLowerCase().includes("subject")
  );
  
  if (sentences.length === 0) return ["No clear topics identified"];
  
  // Extract potential topics from these sentences
  const topics = sentences.map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 3);
  
  return topics.length > 0 ? topics : ["No clear topics identified"];
}

function extractSentiment(text: string): string {
  // Simple sentiment extraction
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("positive sentiment") || 
      lowerText.includes("optimistic") || 
      lowerText.includes("upbeat") ||
      lowerText.includes("happy")) {
    return "positive";
  }
  
  if (lowerText.includes("negative sentiment") || 
      lowerText.includes("pessimistic") || 
      lowerText.includes("critical") ||
      lowerText.includes("sad") ||
      lowerText.includes("angry")) {
    return "negative";
  }
  
  if (lowerText.includes("neutral sentiment") || 
      lowerText.includes("balanced") || 
      lowerText.includes("objective")) {
    return "neutral";
  }
  
  if (lowerText.includes("mixed sentiment") || 
      lowerText.includes("both positive and negative")) {
    return "mixed";
  }
  
  return "neutral"; // Default
}

function extractFormality(text: string): string {
  // Simple formality extraction
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("formal") || 
      lowerText.includes("academic") || 
      lowerText.includes("professional")) {
    return "high";
  }
  
  if (lowerText.includes("informal") || 
      lowerText.includes("casual") || 
      lowerText.includes("conversational")) {
    return "low";
  }
  
  if (lowerText.includes("semi-formal") || 
      lowerText.includes("moderately formal")) {
    return "medium";
  }
  
  return "medium"; // Default
}

function extractKeyPoints(text: string): string[] {
  // Simple key points extraction
  const keyPointsSection = text.match(/key points|main points|important points|highlights/i);
  if (!keyPointsSection) {
    // If no explicit key points section, try to extract sentences with important markers
    const sentences = text.split(/[.!?]/).filter(Boolean).map(s => s.trim());
    const keyPointCandidates = sentences.filter(s => 
      s.toLowerCase().includes("important") || 
      s.toLowerCase().includes("significant") || 
      s.toLowerCase().includes("notable") ||
      s.toLowerCase().includes("key")
    );
    
    if (keyPointCandidates.length > 0) {
      return keyPointCandidates.slice(0, 3);
    }
    
    // If still no candidates, just take the first few sentences
    return sentences.slice(0, Math.min(3, sentences.length));
  }
  
  // Find bullet points or numbered lists
  const bulletPoints = text.match(/[•\-*]\s+[^•\-*]+/g);
  if (bulletPoints && bulletPoints.length > 0) {
    return bulletPoints.map(bp => bp.replace(/^[•\-*]\s+/, '').trim()).slice(0, 5);
  }
  
  // Find numbered points
  const numberedPoints = text.match(/\d+\.\s+[^\d\.]+/g);
  if (numberedPoints && numberedPoints.length > 0) {
    return numberedPoints.map(np => np.replace(/^\d+\.\s+/, '').trim()).slice(0, 5);
  }
  
  // If no structured points, extract sentences near key point markers
  const sentences = text.split(/[.!?]/).filter(Boolean).map(s => s.trim());
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].toLowerCase().includes("key point") || 
        sentences[i].toLowerCase().includes("main point")) {
      // Return this sentence and the next few
      return sentences.slice(i, Math.min(i + 3, sentences.length));
    }
  }
  
  return ["No specific key points identified"];
        }
