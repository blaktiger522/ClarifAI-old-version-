import { router } from "@/backend/trpc/create-context";
import hiProcedure from "@/backend/trpc/routes/example/hi/route";
import processHandwriting from "@/backend/trpc/routes/transcription/process";
import enhanceTranscription from "@/backend/trpc/routes/transcription/enhance";
import analyzeTranscription from "@/backend/trpc/routes/transcription/analyze";

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  transcription: router({
    process: processHandwriting,
    enhance: enhanceTranscription,
    analyze: analyzeTranscription,
  }),
});

export type AppRouter = typeof appRouter;
