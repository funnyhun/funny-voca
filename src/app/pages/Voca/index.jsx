import { Voca } from "./Voca";
import { List as VocaList } from "./List/List";
import { List as WordList } from "./Word/List/List";

const vocaChildren = [
  { index: true, element: <VocaList /> },
  { path: ":vocaId", element: <WordList /> },
];

export { Voca, vocaChildren };
