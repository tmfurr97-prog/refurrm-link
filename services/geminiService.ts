/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * REMASTERED: Implements BFF pattern via Firebase Cloud Functions.
 * Prevents Client-Side API Key exposure and allows for server-side sanitization.
 */
import { getFunctions, httpsCallable } from 'firebase/functions';
import DOMPurify from 'dompurify';

interface GeminiResponse {
  content: string;
  usage: { promptTokens: number; candidatesTokens: number };
}

export const analyzeContent = async (prompt: string, context: string): Promise<string> => {
  const functions = getFunctions();
  const callGemini = httpsCallable<{ prompt: string; context: string }, GeminiResponse>(
    functions, 
    'analyzeWithGemini'
  );

  try {
    // Prompt and context must NOT be HTML-sanitized here, as this breaks code syntax (e.g. <T>, <=).
    // XSS protection should be handled on the UI render side instead.
    const result = await callGemini({
      prompt: prompt,
      context: context
    });
    
    return result.data.content;
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw new Error('Failed to process AI request. Check backend logs.');
  }
};

export const parseMarkdownToHTML = (markdown: string) => {
  // Logic moved here to ensure consistent sanitization of AI output
  return DOMPurify.sanitize(markdown);
};