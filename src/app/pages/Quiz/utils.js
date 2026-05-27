import { shuffleArray } from "@/utils/array";

export const POS_KOREAN = ["명사", "동사", "형용사", "부사", "전치사", "접속사", "대명사"];

/**
 * 영어 품사 약어를 한국어 품사로 매핑합니다.
 * @param {string} posStr 
 * @returns {string}
 */
export const toKoreanPOS = (posStr) => {
  if (!posStr) return "명사"; // 기본값
  const cleanPos = posStr.trim().toLowerCase().replace(/\.$/, "");
  const map = {
    n: "명사",
    v: "동사",
    a: "형용사",
    ad: "부사",
    prep: "전치사",
    conj: "접속사",
    pron: "대명사",
    int: "감탄사",
    adj: "형용사",
  };
  return map[cleanPos] || posStr;
};

/**
 * 스펠링/예문 퀴즈를 위한 오답 단어 목록을 생성합니다.
 * @param {string} answerWord 
 * @param {Array} allWords 
 * @returns {Array<string>}
 */
export const getWrongWords = (answerWord, allWords) => {
  const wrongs = allWords
    .filter((w) => w.word !== answerWord)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((w) => w.word);

  while (wrongs.length < 3) {
    wrongs.push("---");
  }
  return wrongs;
};

/**
 * 품사 퀴즈를 위한 한국어 오답 품사 목록을 생성합니다.
 * @param {string} answerPOS 
 * @returns {Array<string>}
 */
export const getWrongPOS = (answerPOS) => {
  const answerKo = toKoreanPOS(answerPOS);
  const filtered = POS_KOREAN.filter((pos) => pos !== answerKo);
  const shuffled = shuffleArray([...filtered]);
  return shuffled.slice(0, 3);
};
