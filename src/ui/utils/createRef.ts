export const createRef = () => {
  const setter: any = (r: any) => {
    setter.current = r;
  };
  return setter;
};
