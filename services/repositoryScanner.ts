import { fetchRepoFileTree, fetchFileContent } from './githubService';
import { RepoFileTree } from '../types';

export interface ScannedFile {
  path: string;
  content: string;
}

/**
 * List of critical architectural, configuration, and security files typically responsible
 * for the "Wall" (e.g., build failures, CORS issues, Firebase rule blocks).
 */
const CRITICAL_FILE_CONFIG_PATTERNS = [
  // Firebase & Database
  /^firebase\.json$/i,
  /^firestore\.rules$/i,
  /^database\.rules\.json$/i,
  /^storage\.rules$/i,
  
  // Package & Environment
  /^package\.json$/i,
  /^\.env.*\.example$/i,
  /^tsconfig\.json$/i,
  /^vite\.config\.(ts|js)$/i,
  
  // Security & Auth typically found in these standard paths
  /src\/.*(auth|security|middleware).*\.(ts|tsx|js|jsx)$/i,
  /services\/firebase\.(ts|js)$/i
];

/**
 * Wall-Breaker specific logic mapping. Checks the user's prompt text to see if it
 * requires scanning specific domain files that aren't globally critical but are conditionally vital.
 */
function extractDynamicPatternsFromPrompt(prompt: string): RegExp[] {
  const patterns: RegExp[] = [];
  const normalizedPrompt = prompt.toLowerCase();

  // If issue is styling/UI related
  if (normalizedPrompt.includes('css') || normalizedPrompt.includes('tailwind') || normalizedPrompt.includes('style')) {
    patterns.push(/tailwind\.config\.(js|ts)$/i);
    patterns.push(/postcss\.config\.(js|ts)$/i);
    patterns.push(/index\.css$/i);
  }

  // If issue is routing related
  if (normalizedPrompt.includes('route') || normalizedPrompt.includes('navigation') || normalizedPrompt.includes('404')) {
    patterns.push(/App\.(tsx|jsx)$/i);
    patterns.push(/router\.(ts|js|tsx|jsx)$/i);
    patterns.push(/main\.(tsx|jsx)$/i);
  }

  return patterns;
}

/**
 * Master Read capability for the Pro Tier. Scans the remote Github repository for both
 * standard critical files (the "Wall") and dynamically identified files based on the prompt.
 */
export async function scanRepositoryForContext(
  owner: string, 
  repo: string, 
  prompt: string,
  maxFilesToFetch: number = 8 // Prevent insane payload sizes to the LLM
): Promise<ScannedFile[]> {
  
  try {
    const tree: RepoFileTree[] = await fetchRepoFileTree(owner, repo);
    
    const dynamicPatterns = extractDynamicPatternsFromPrompt(prompt);
    const allTargetPatterns = [...CRITICAL_FILE_CONFIG_PATTERNS, ...dynamicPatterns];

    // Identify which files in the repository tree match our target patterns
    const filesToFetch = tree.filter((fileNode) => {
      // Must be a blob (file) not a tree (directory)
      if (fileNode.type !== 'blob') return false;
      
      // Security/Performance: Reject any files over 50KB to protect the AI context limit
      if (fileNode.size && fileNode.size > 50000) return false;
      
      // Also grab anything explicitly named in the prompt without a regex
      // e.g. "Why is DevStudio.tsx breaking?"
      const fileNameMatch = prompt.includes(fileNode.path.split('/').pop() || '');
      
      const patternMatch = allTargetPatterns.some(pattern => pattern.test(fileNode.path));
      
      return fileNameMatch || patternMatch;
    }).slice(0, maxFilesToFetch);

    // Fetch the raw text contents of all identified files in parallel
    const scannedFiles: ScannedFile[] = await Promise.all(
      filesToFetch.map(async (fileNode) => {
        // Fallback to fetchFileContent with proper auth handling. 
        // For private repos, we should fetch via the GitHub API blob URL, which inherently uses the authenticated token 
        // unlike raw.githubusercontent.com which 404s without params.
        const blobApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${fileNode.sha}`;
        
        try {
          const content = await fetchFileContent(blobApiUrl);
          return { path: fileNode.path, content };
        } catch (err) {
          console.warn(`Failed to read file ${fileNode.path} for Master Read context`, err);
          return { path: fileNode.path, content: `// ERR: Could not fetch file from GitHub raw URL.` };
        }
      })
    );

    return scannedFiles.filter(item => !item.content.startsWith('// ERR:'));

  } catch (error) {
    console.error('Repository scanner failed (Wall-Breaker mode):', error);
    throw new Error('Wall-Breaker context injection failed. Could not analyze repository structure.');
  }
}
