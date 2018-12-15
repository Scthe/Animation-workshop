import entries from 'lodash-es/entries'; // Object.entries not visible in TS

// based on https://github.com/sindresorhus/class-names (MIT)
// but in TS

type ClazzType = string | object;

export const classnames = (...args: ClazzType[]) => {
  const ret = new Set();

  for (const item of args) {
    if (typeof item === 'string' && item.length > 0) {
      ret.add(item);

    } else if (typeof item === 'object' && item !== null) {
      for (const [key, value] of entries(item)) {
        if (value) {
          ret.add(key);
        }
      }
    }
  }

  return [...ret].join(' ');
};
