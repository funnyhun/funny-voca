import * as S from "./Quiz.styles";
import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useWord } from "@app/hooks";
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
  const { updateStatus } = vocaState;
  const { profile } = statsState;
  const { words, loading } = useWord();

  // 로컬 퀴즈 상태 관리
  const [session, setSession] = useState(null);
  const [hasMistake, setHasMistake] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // 단어 데이터가 준비되었을 때 LocalStorage 로드 또는 신규 세션 생성
  useEffect(() => {
    if (loading || !words || words.length === 0) return;

    const saved = localStorage.getItem(LS_KEY);
    let parsed = null;
    try {
      if (saved) parsed = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved quiz state", e);
    }

    const currentVocaId = profile?.selected || "700-etc_1";

    // 저장된 vocaId와 현재 선택된 vocaId가 다르거나 세션이 없으면 새로 생성
    if (!parsed || parsed.vocaId !== currentVocaId) {
      const uncompleted = words.filter((w) => !w.done);
      const targets = uncompleted.length > 0 ? uncompleted : words;
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
  }, [words, loading, profile?.selected]);

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
    return words.find((w) => w.id === currentId);
  }, [session, words]);

  if (loading || !words || words.length === 0) {
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

    if (hasMistake) {
      // 오답이 발생했던 경우 -> 현재 단어를 맨 뒤로 이동
      nextQueue = [...session.queue.slice(1), session.queue[0]];
    } else {
      // 한 번에 맞춘 경우 -> 현재 단어를 큐에서 완전히 제거하고 완료 개수 증가
      nextQueue = session.queue.slice(1);
      nextDoneCount += 1;
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
        // 모든 페이즈를 완료했으므로 대상 단어들 일괄 done = true 업데이트
        session.targetWordIds.forEach((id) => {
          updateStatus(id, true);
        });
        updateSession({
          ...session,
          phase: "COMPLETE",
          queue: [],
          doneCount: session.targetWordIds.length,
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
            allWords={words}
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
            allWords={words}
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
          color: "var(--color-brand, #4f46e5)",
          marginTop: "12px"
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
