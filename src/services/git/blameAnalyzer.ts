import { execSync } from 'child_process';
import type { BlameInfo } from '../../models/types.js';

export class BlameAnalyzer {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  analyzeBlame(filePath: string, maxLines: number = 50): BlameInfo[] {
    try {
      const output = execSync(`git blame --line-porcelain ${filePath}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
      });

      const lines = output.split('\n');
      const blameInfos: BlameInfo[] = [];
      let currentInfo: Partial<BlameInfo> = {};

      for (const line of lines) {
        if (line.startsWith('author ')) {
          currentInfo.author = line.slice(7);
        } else if (line.startsWith('summary ')) {
          currentInfo.summary = line.slice(8);
        } else if (/^\t/.test(line) && currentInfo.author) {
          currentInfo.line = blameInfos.length + 1;
          if (currentInfo.summary) {
            blameInfos.push(currentInfo as BlameInfo);
          }
          currentInfo = {};
          if (blameInfos.length >= maxLines) break;
        }
      }

      return blameInfos;
    } catch {
      return [];
    }
  }

  getChangedFilesBlame(staged: boolean = false): Map<string, BlameInfo[]> {
    const files = this.getChangedFiles(staged);
    const blameMap = new Map<string, BlameInfo[]>();

    for (const file of files) {
      const blameInfos = this.analyzeBlame(file);
      if (blameInfos.length > 0) {
        blameMap.set(file, blameInfos);
      }
    }

    return blameMap;
  }

  private getChangedFiles(staged: boolean): string[] {
    const flag = staged ? '--cached' : '';
    const output = execSync(`git diff ${flag} --name-only`, {
      cwd: this.cwd,
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  }
}