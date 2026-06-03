import * as S from "./Quiz.styles";
import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useMaster } from "@app/hooks";
import { shuffleArray } from "@/utils/array";

import { ProgressBar } from "./ProgressBar";
import { Pannel } from "./Pannel";
import { Complete } from "./Complete";
import { Skeleton } from "@app/components";

import { SpellingQuiz } from "./types/SpellingQuiz";
import { POSQuiz } from "./types/POSQuiz";
import { SentenceQuiz } from "./types/SentenceQuiz";

const LS_KEY = "myvoca_quiz_state";

export const Quiz = () => {
  const { vocaState, statsState } = useOutletContext();
  const { updateStatus, updateVocaBulk } = vocaState;
  const { profile } = statsState;
  const { getChunk } = useMaster();

  // 로컬 퀴즈 상태 및 격리된 단어 목록 관리
  const [quizWords, setQuizWords] = useState([]);
  const [session, setSession] = useState(null);
  const [hasMistake, setHasMistake] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentVocaId = profile?.selected || "700-etc_1";

  const { words, isLoaded } = getChunk(currentVocaId);

  // 1. 최초 로딩 완료 시 혹은 청크 ID 변경 시에만 깊은 복사본 단어 목록을 딱 1회 주입 및 완전히 고정
  useEffect(() => {
    if (isLoaded && words.length > 0 && quizWords.length === 0) {
      setQuizWords(words);
    }
  }, [currentVocaId, isLoaded, words, quizWords.length]);

  // 2. 고정된 단어 데이터(quizWords)가 준비되었을 때 LocalStorage 로드 또는 신규 세션 생성
  useEffect(() => {
    if (!quizWords || quizWords.length === 0) return;

    const saved = localStorage.getItem(LS_KEY);
    let parsed = null;
    try {
      if (saved) parsed = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved quiz state", e);
    }

    // 저장된 vocaId와 현재 선택된 vocaId가 다르거나 세션이 없으면 새로 생성
    if (!parsed || parsed.vocaId !== currentVocaId) {
      const uncompleted = quizWords.filter((w) => !w.done);
      const targets = uncompleted.length > 0 ? uncompleted : quizWords;
      const targetIds = targets.map((w) => w.id);
      const initialQueue = shuffleArray([...targetIds]);

      const newSession = {
        vocaId: currentVocaId,
        phase: "SPELLING",
        doneCount: 0,
        totalCount: targetIds.length,
        queue: initialQueue,
        targetWordIds: targetIds,
      };

      localStorage.setItem(LS_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } else {
      setSession(parsed);
    }
    setHasMistake(false);
    setIsAnswered(false);
  }, [quizWords, currentVocaId]);

  // 세션이 변경될 때마다 LocalStorage 업데이트
  const updateSession = (nextSession) => {
    if (nextSession) {
      localStorage.setItem(LS_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(LS_KEY);
    }
    setSession(nextSession);
  };

  // 현재 출제할 단어 객체 매핑
  const currentWord = useMemo(() => {
    if (!session || !session.queue || session.queue.length === 0) return null;
    const currentId = session.queue[0];
    return quizWords.find((w) => w.id === currentId);
  }, [session, quizWords]);

  if (!isLoaded || quizWords.length === 0) {
    return (
      <S.Wrapper style={{ padding: "20px" }}>
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <Skeleton height="12px" width="100%" />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
            <Skeleton height="20px" width="200px" />
          </div>
        </div>

        <S.Content style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", padding: "40px 20px" }}>
          <Skeleton height="24px" width="150px" />
          <Skeleton height="60px" width="100%" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", marginTop: "20px" }}>
            <Skeleton height="50px" width="100%" />
            <Skeleton height="50px" width="100%" />
            <Skeleton height="50px" width="100%" />
          </div>
        </S.Content>
      </S.Wrapper>
    );
  }

  // 만약 모든 단어를 다 통과해 세션이 완료 상태이거나 세션이 없는데 로드가 끝난 상태인 경우
  if (session && session.phase === "COMPLETE") {
    return <Complete />;
  }

  if (!session || !currentWord) {
    return (
      <S.Wrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <div>진행 가능한 퀴즈가 없습니다.</div>
      </S.Wrapper>
    );
  }


  const handleCorrect = () => {
    setIsAnswered(true);
  };

  const handleWrong = () => {
    setHasMistake(true);
  };

  const handleNext = () => {
    setIsAnswered(false);

    let nextQueue = [];
    let nextDoneCount = session.doneCount;
    const currentWordId = currentWord.id;

    if (hasMistake) {
      // 오답이 발생했던 경우 -> 현재 단어를 맨 뒤로 이동 (이 퀴즈 세션에서는 done에 절대 추가되지 않음)
      nextQueue = [...session.queue.slice(1), session.queue[0]];
    } else {
      // 한 번에 맞춘 경우 -> 현재 단어를 큐에서 완전히 제거하고 완료 개수 증가
      nextQueue = session.queue.slice(1);
      nextDoneCount += 1;

      // [실시간 Local-First 캐싱] 오답 없이 한번에 맞춘 단어이므로 즉시 done 적재 및 백싱크 수행
      updateStatus(currentWordId, true);
    }

    setHasMistake(false);

    // 현재 페이즈의 큐를 모두 소진한 경우
    if (nextQueue.length === 0) {
      let nextPhase = "SPELLING";
      if (session.phase === "SPELLING") {
        nextPhase = "POS";
      } else if (session.phase === "POS") {
        nextPhase = "SENTENCE";
      } else if (session.phase === "SENTENCE") {
        nextPhase = "COMPLETE";
      }

      if (nextPhase === "COMPLETE") {
        // [원샷 벌크 업데이트 리팩토링] 40-loop 개별 호출 방식을 완전히 제거
        const currentLevel = profile.level || 700;
        const currentLevelVoca = Array.isArray(vocaState.voca) ? vocaState.voca : (vocaState.voca?.[currentLevel] || []);
        const activeLabel = profile.selected || currentLevelVoca[0]?.voca_label;

        if (activeLabel) {
          const targetVoca = currentLevelVoca.find((v) => v.voca_label === activeLabel);
          if (targetVoca) {
            // 이번 문항을 완벽히 맞춤으로써 추가된 최종 done 리스트 확보
            let finalDoneList = Array.isArray(targetVoca.done) ? [...targetVoca.done] : [];
            if (!hasMistake && !finalDoneList.includes(currentWordId)) {
              finalDoneList.push(currentWordId);
            }

            const totalWordsCount = targetVoca.word?.length || 0;
            const isPerfect = finalDoneList.length === totalWordsCount;

            // 벌크 업데이트 단 1회 커밋 실행 (100% 무결점 완수 시 status = true)
            updateVocaBulk(activeLabel, finalDoneList, isPerfect);
          }
        }

        updateSession({
          ...session,
          phase: "COMPLETE",
          queue: [],
          doneCount: session.totalCount, // 성과 게이지 풀 표시용
        });
      } else {
        // 다음 페이즈 진입을 위한 세션 초기화
        const nextQueueShuffled = shuffleArray([...session.targetWordIds]);
        updateSession({
          ...session,
          phase: nextPhase,
          doneCount: 0,
          queue: nextQueueShuffled,
        });
      }
    } else {
      // 동일 페이즈 내 다음 단어로 갱신
      updateSession({
        ...session,
        doneCount: nextDoneCount,
        queue: nextQueue,
      });
    }
  };

  const renderQuizComponent = () => {
    switch (session.phase) {
      case "SPELLING":
        return (
          <SpellingQuiz
            currentWord={currentWord}
            allWords={quizWords}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            isAnswered={isAnswered}
          />
        );
      case "POS":
        return (
          <POSQuiz
            currentWord={currentWord}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            isAnswered={isAnswered}
          />
        );
      case "SENTENCE":
        return (
          <SentenceQuiz
            currentWord={currentWord}
            allWords={quizWords}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            isAnswered={isAnswered}
          />
        );
      default:
        return null;
    }
  };

  // 상단 타이틀 매핑
  const getPhaseTitle = (phase) => {
    switch (phase) {
      case "SPELLING":
        return "1단계: 뜻 보고 단어 맞추기 (스펠링 퀴즈)";
      case "POS":
        return "2단계: 단어 보고 품사 맞추기 (품사 퀴즈)";
      case "SENTENCE":
        return "3단계: 빈칸 채우기 (예문 퀴즈)";
      default:
        return "퀴즈 진행 중";
    }
  };

  return (
    <S.Wrapper key={`${session.phase}-${currentWord.id}`}>
      <div>
        <ProgressBar total={session.totalCount} done={session.doneCount} />
        <div style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.1rem",
          color: "var(--color-brand, #4f46e5)"
        }}>
          {getPhaseTitle(session.phase)}
        </div>
      </div>

      <S.Content>
        <div style={{ width: "100%", padding: "20px" }}>
          {renderQuizComponent()}
        </div>
      </S.Content>

      {isAnswered && <Pannel onNext={handleNext} />}
    </S.Wrapper>
  );
};
