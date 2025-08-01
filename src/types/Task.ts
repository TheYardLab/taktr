export type Task = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  trade?: string;
  dependencies?: string;
};