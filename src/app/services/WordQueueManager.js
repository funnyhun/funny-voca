import { getMaster } from "@/api/master";
import { getMasterCache, setMasterCache } from "@/api/common";

class WordQueueManager {
  constructor() {
    this.queue = [];             // 다운로드 대기 중인 청크 객체 리스트 [{ voca_label, word, schedule, ... }]
    this.loadedChunks = new Set(); // 단어 다운로드가 이미 완료된 청크 라벨 목록
    this.subscribers = new Set();  // React 상태와 연동하기 위한 구독자 콜백 리스트
    this.activeWorker = null;    // 현재 비동기 워커 루프 상태 제어용 프라미스
    this.isWorking = false;      // 워커 구동 활성화 플래그
  }

  /**
   * 구독자(React 훅 등) 등록
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.add(callback);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 구독자들에게 데이터 추가 이벤트를 브로드캐스팅
   */
  notify(newWords) {
    this.subscribers.forEach((cb) => cb(newWords));
  }

  /**
   * Voca 리스트 및 활성(선택) 청크 정보를 기반으로 큐를 동적으로 빌드하고 최우선순위로 재정렬(Re-sort)합니다.
   * @param {Object} vocaList - 레벨별 그룹화된 Voca 데이터 { 700: [], 800: [], 900: [] }
   * @param {string} selectedLabel - 현재 최우선으로 학습해야 하는 청크 라벨 (예: '700-marketing_1')
   */
  setVocaList(vocaList, selectedLabel) {
    if (!vocaList || Array.isArray(vocaList)) return;

    const cachedWords = getMasterCache();
    this.loadedChunks.clear();

    // 1단계: 플랫(Flat)한 모든 청크 리스트를 취합합니다.
    const allChunks = Object.values(vocaList).flat().filter(Boolean);

    // 2단계: 각 청크에 매핑된 단어들이 로컬 스토리지 마스터 캐시에 이미 무결하게 존재하는지 검사합니다.
    const chunksToLoad = [];
    allChunks.forEach((chunk) => {
      const label = chunk.voca_label;
      const wordIds = chunk.word || [];

      // 해당 청크의 모든 단어 ID가 이미 캐시에 존재하는지 검증
      const isAlreadyLoaded = wordIds.length > 0 && wordIds.every(
        (id) => cachedWords[id] !== undefined || cachedWords[String(id)] !== undefined
      );

      if (isAlreadyLoaded) {
        this.loadedChunks.add(label);
      } else {
        chunksToLoad.push(chunk);
      }
    });

    // 3단계: 미로드 청크들을 학습 우선순위에 맞게 최적 Re-sort (동적 비집고 들어가기)
    // 1순위: 현재 사용자가 선택하여 즉시 학습해야 하는 청크 (selectedLabel)
    // 2순위: 스케줄 정렬 순번 (schedule)이 앞서는 순서
    chunksToLoad.sort((a, b) => {
      const isSelectedA = a.voca_label === selectedLabel;
      const isSelectedB = b.voca_label === selectedLabel;

      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;

      return a.schedule - b.schedule;
    });

    // 4단계: 큐 업데이트
    this.queue = chunksToLoad;

    console.log(`[WordQueueManager] 대기열 갱신 완료. 대기 청크 수: ${this.queue.length}개. 최우선 청크: ${selectedLabel}`);

    // 5단계: 대기열이 있고 워커가 아직 동작 중이 아니라면 백그라운드 워커 시동
    if (this.queue.length > 0 && !this.isWorking) {
      this.startWorker();
    }
  }

  /**
   * 전체 청크 대비 단어 다운로드가 완료된 청크의 진행률을 계산해 반환합니다.
   * @param {Object} vocaList
   * @returns {number} 0 ~ 100 사이의 진행률 수치
   */
  getProgress(vocaList) {
    if (!vocaList) return 100;
    const allChunks = Object.values(vocaList).flat().filter(Boolean);
    const total = allChunks.length;
    if (total === 0) return 100;

    const cachedWords = getMasterCache();
    let completed = 0;
    allChunks.forEach((chunk) => {
      const wordIds = chunk.word || [];
      const isLoaded = wordIds.length > 0 && wordIds.every(
        (id) => cachedWords[id] !== undefined || cachedWords[String(id)] !== undefined || cachedWords[Number(id)] !== undefined
      );
      if (isLoaded) {
        completed++;
      }
    });

    return Math.round((completed / total) * 100);
  }

  /**
   * 지정한 청크를 다운로드 대기 큐의 최우선 순위(맨 앞)로 격상시킵니다.
   * @param {string} targetId - 최우선 격상할 청크 voca_label
   */
  prioritizeChunk(targetId) {
    if (!targetId) return;
    const idx = this.queue.findIndex((chunk) => chunk.voca_label === targetId);
    if (idx > 0) {
      const targetChunk = this.queue.splice(idx, 1)[0];
      this.queue.unshift(targetChunk);
      console.log(`[WordQueueManager] 청크 다운로드 최우선 순위 격상 -> ${targetId}`);
      
      if (!this.isWorking) {
        this.startWorker();
      }
    }
  }

  /**
   * 백그라운드 다운로드 워커를 트리거합니다.
   */
  startWorker() {
    if (this.isWorking) return;

    this.isWorking = true;
    console.log("[WordQueueManager] 백그라운드 단어 로딩 워커 구동 시작");

    this.activeWorker = (async () => {
      while (this.isWorking && this.queue.length > 0) {
        // 큐의 맨 앞에서 최우선 순위 청크를 가져옴
        const chunk = this.queue.shift();
        if (!chunk) continue;

        const label = chunk.voca_label;
        const wordIds = chunk.word || [];

        if (wordIds.length === 0) continue;

        try {
          console.log(`[WordQueueManager] 청크 다운로드 시작 -> ${label} (단어수: ${wordIds.length}개)`);
          
          // 고수준 마스터 API를 통해 단 1회의 최적 IN 쿼리로 청크 단어 데이터 일괄 조회
          const nextChunkWords = await getMaster(wordIds);
          
          if (Object.keys(nextChunkWords).length > 0) {
            // 로컬 마스터 캐시에 점진적 병합 및 로컬 스토리지 실시간 커밋
            const cumulativeWords = getMasterCache();
            Object.assign(cumulativeWords, nextChunkWords);
            setMasterCache(cumulativeWords);

            this.loadedChunks.add(label);

            // React 전역 상태에 점진적 바인딩 노티파이
            this.notify(nextChunkWords);
            console.log(`[WordQueueManager] 청크 로드 및 점진적 병합 완료 -> ${label}`);
          }
        } catch (error) {
          console.error(`[WordQueueManager] 청크 로드 실패 -> ${label}:`, error);
          // 실패 시 큐의 맨 뒤로 밀어 넣어 재시도 기회 확보
          this.queue.push(chunk);
          // 일시적 에러 회복을 위한 1초 대기 후 다음 루프 진행
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // 브라우저 렌더링 스레드가 숨쉴 수 있도록 틱 간 50ms 미세 지연 부여
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // 최종 Cleanup: 대기 큐가 모두 소모되어 완료된 시점 자원 완벽 해제
      this.cleanup();
    })();
  }

  /**
   * 워커 구동을 안전하게 정지시키고 메모리 리소스를 해제(Cleanup)합니다.
   */
  cleanup() {
    this.isWorking = false;
    this.activeWorker = null;
    console.log("[WordQueueManager] 백그라운드 단어 로딩 큐 소모 완료 및 워커 자원 해제(Cleanup) 완료");
  }

  /**
   * 강제 중지 및 큐 완전 리셋 (로그아웃 및 초기화 대응)
   */
  reset() {
    this.isWorking = false;
    this.queue = [];
    this.loadedChunks.clear();
    this.activeWorker = null;
    console.log("[WordQueueManager] 단어 다운로드 큐 강제 초기화 및 리셋 완료");
  }
}

export const wordQueueManager = new WordQueueManager();
