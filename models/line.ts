export interface Line {
  id: string;
  name: string;
  parentId: string;
  level: number;
  ancestors: string[];
}