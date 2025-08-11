import { MemoryStats } from './interfaces/types';
import { DEFAULT_MEMORY_MAX_SIZE, DEFAULT_MEMORY_WARNING_THRESHOLD } from './constants';

export class MemoryManager {
  private maxSize: number;
  private warningThreshold: number;
  private allocatedMemory: Map<string, number> = new Map();
  private warnings: string[] = [];

  constructor(maxSize: number = DEFAULT_MEMORY_MAX_SIZE, warningThreshold: number = DEFAULT_MEMORY_WARNING_THRESHOLD) {
    this.maxSize = maxSize;
    this.warningThreshold = warningThreshold;
  }

  allocate(id: string, size: number): boolean {
    const currentUsage = this.getTotalUsage();
    
    if (currentUsage + size > this.maxSize) {
      this.warnings.push(`Memory allocation failed for ${id}: would exceed max size`);
      return false;
    }

    this.allocatedMemory.set(id, size);
    
    const newUsage = currentUsage + size;
    if (newUsage > this.maxSize * this.warningThreshold) {
      this.warnings.push(`Memory usage warning: ${Math.round(newUsage / this.maxSize * 100)}% of max`);
    }

    return true;
  }

  deallocate(id: string): void {
    this.allocatedMemory.delete(id);
  }

  getTotalUsage(): number {
    return Array.from(this.allocatedMemory.values()).reduce((sum, size) => sum + size, 0);
  }

  getStats(): MemoryStats {
    const used = this.getTotalUsage();
    return {
      used,
      available: this.maxSize - used,
      threshold: this.maxSize * this.warningThreshold,
      warnings: [...this.warnings]
    };
  }

  clearWarnings(): void {
    this.warnings = [];
  }

  estimateObjectSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  }
}
