const FILTER_SET = {
  default: {
    label: "A-Z",
    callback: (words) => {
      return [...words].sort((a, b) => a.word.localeCompare(b.word, "en", { sensitivity: "base" }));
    },
  },
  complete: {
    label: "암기완료",
    callback: (words) => {
      return words.filter((word) => word.done);
    },
  },
  incomplete: {
    label: "미완료",
    callback: (words) => {
      return words.filter((word) => !word.done);
    },
  },
};

const FILTER_TYPE = Object.keys(FILTER_SET);

export { FILTER_SET, FILTER_TYPE };
