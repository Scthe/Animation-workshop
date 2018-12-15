// https://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-reading-files

export const processTextFileUpload = (evt: Event): Promise<string> => {
  const files = (evt.target as any).files as FileList;
  const file = files[0];
  if (!file.type.match('.json')) {
    return undefined;
  }

  let promiseResolve: Function;
  const promise = new Promise<string>((res: Function) => {
    promiseResolve = res;
  });

  const reader = new FileReader();
  reader.onload = (e: ProgressEvent) => {
    promiseResolve((e.target as any).result);
  };
  reader.readAsText(file);

  return promise;
};
