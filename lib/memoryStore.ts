export type Store = {
  [id: string]: any[];
};

const globalStore: Store = {};

export function createInstance(id: string, data: any[]) {
  globalStore[id] = data;
}

export function getAllInstances(){
    return globalStore;
}

export function getInstance(id: string) {
  return globalStore[id] || null;
}

export function deleteInstance(id: string) {
  delete globalStore[id];
}
