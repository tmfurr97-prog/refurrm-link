import { ScannedFile, scanRepositoryForContext } from './repositoryScanner';
import { analyzeContent } from './geminiService';

export interface AskAIOptions {
  prompt: string;
  tier: 'standard' | 'pro';
  currentFileContext?: ScannedFile;
  githubRepoMetadata?: { owner: string; repo: string }; // Required for Pro tier Wall-Breaker scanning
}

export interface AskAIResult {
  response: string;
  filesScanned: string[];
}

/**
 * Executes the Ask AI (Forensic Chat) Interrogation.
 * Acts as the bridge between the React UI, the Repository Scanner, and the LLM via Firebase.
 * Strictly enforces the "Full-File Overwrite" standard in its system prompt.
 */
export async function interrogateCodebase(options: AskAIOptions): Promise<AskAIResult> {
  const { prompt, tier, currentFileContext, githubRepoMetadata } = options;
  
  let filesToFeed: ScannedFile[] = [];
  let filesScanned: string[] = [];

  // 1. Context Gathering (Tier-Based)
  if (tier === 'pro' && githubRepoMetadata) {
    try {
      // PRO: "Wall-Breaker" Master Read capability
      filesToFeed = await scanRepositoryForContext(
        githubRepoMetadata.owner,
        githubRepoMetadata.repo,
        prompt
      );
      
      // If there's a specific focused file in the UI that the scanner didn't pick up, ensure it's included
      if (currentFileContext && !filesToFeed.some(f => f.path === currentFileContext.path)) {
        filesToFeed.unshift(currentFileContext);
      }
    } catch (error) {
      console.warn("Pro tier repository scan failed, falling back to standard context.", error);
      if (currentFileContext) filesToFeed.push(currentFileContext);
    }
  } else {
    // STANDARD: Only access the single focused file
    if (currentFileContext) {
      filesToFeed.push(currentFileContext);
    }
  }

  // Record which files were actually embedded for forensic UI proof
  filesScanned = filesToFeed.map(f => f.path);

  // 2. Format Context Injection
  const stringifiedContext = filesToFeed.length > 0 
    ? `=== REPOSITORY FILE CONTEXT ===\nHere are the exact, raw contents of the relevant files from the user's project repository:\n\n` + 
      filesToFeed.map(f => `--- START FILE: ${f.path} ---\n${f.content}\n--- END FILE: ${f.path} ---`).join('\n\n')
    : `=== REPOSITORY FILE CONTEXT ===\nNo specific file context provided or available.`;

  // 3. The Enforcer Prompt ("Full-File Overwrite" Standard)
  const strictSystemDirective = `
You are the "Forensic Code Interrogator" AI. 
Your objective is to cross-reference configuration files and source code to identify mismatches, bugs, or "Walls" (like strict Firebase rules or CORS).

### CRITICAL DIRECTIVE: The "Full-File Overwrite" Standard
1. Identify the File: Clearly state which file needs replacing.
2. The "Golden Copy": DO NOT provide "snippets" or "diffs". You MUST provide a single, continuous markdown code block containing the ENTIRE file content.
3. Zero Guesswork: Include all original necessary imports, types, and unchanged logic alongside your fix. Never use placeholder comments like "// ... existing code ...".

USER'S ISSUE / QUESTION:
"${prompt}"
`;

  // 4. Dispatch to Gemini BFF (Backend for Frontend via Firebase)
  try {
    const rawResponse = await analyzeContent(strictSystemDirective, stringifiedContext);
    
    return {
      response: rawResponse,
      filesScanned
    };
  } catch (error) {
    console.error("Forensic Interrogation failed:", error);
    throw new Error("Failed to communicate with the Forensic Code Interrogator. Check your network or Firebase backend.");
  }
}
