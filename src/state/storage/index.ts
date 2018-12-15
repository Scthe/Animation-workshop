export * from './autoSave';
export * from './serialize';

export const STORAGE = {
  set: (key: string, data: string) => {
    localStorage.setItem(key, data);
  },
  get: (key: string) => {
    return localStorage.getItem(key);
  },
};
