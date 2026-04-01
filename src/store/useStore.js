import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const initialRoutines = [
  // --- 일간 루틴 (Daily) ---
  { id: 'd_01', type: 'daily', title: '크레딧 수령(300)', completed: false },
  { id: 'd_02', type: 'daily', title: '저장고 노드 운송 의뢰', completed: false, current: 0, max: 3, isCounter: true },
  { id: 'd_03', type: 'daily', title: '무릉 변동 물자 거래', completed: false },
  { id: 'd_04', type: 'daily', title: '무릉성 도심 저장고 노드 배달', completed: false },
  { id: 'd_05', type: 'daily', title: '4번 협곡 변동 물자 거래', completed: false },
  { id: 'd_06', type: 'daily', title: '오리지늄 연구 구역 저장고 노드 배달', completed: false },
  { id: 'd_07', type: 'daily', title: '광맥 구역 저장고 노드 배달', completed: false },
  { id: 'd_08', type: 'daily', title: '에너지 공급 고지 저장고 노드 배달', completed: false },
  { id: 'd_09', type: 'daily', title: '제강호 친구 방문 지원', completed: false },
  { id: 'd_10', type: 'daily', title: 'SKPORT 출석 체크', completed: false, resetTime: '1am' },
  { 
    id: 'd_op_manual',
    type: 'daily',
    title: '일상 - 일일 임무',
    isManual: true,
    completed: false,
    subTasks: [
      { id: 'd_st_01', title: '로그인', points: 20, completed: false },
      { id: 'd_st_02', title: '일일 파견 임무를 1회 완료', points: 80, completed: false },
      { id: 'd_st_03', title: '이성을 60포인트 소모', points: 10, completed: false },
      { id: 'd_st_04', title: '이성을 120포인트 소모', points: 10, completed: false },
      { id: 'd_st_05', title: '오퍼레이터를 1회 업그레이드', points: 20, completed: false},
      { id: 'd_st_06', title: '채집물을 5회 수집', points: 20, completed: false},
      { id: 'd_st_07', title: '적을 누적 20명 처치', points: 20, completed: false},
      { id: 'd_st_08', title: '무기를 1회 업그레이드', points: 20, completed: false},
      { id: 'd_st_09', title: '장비 제작을 1회 진행', points: 40, completed: false},
      { id: 'd_st_010', title: '간편 제작을 1회 진행', points: 20, completed: false},
      { id: 'd_st_011', title: '임의의 오퍼레이터 1명에게 선물을 1회 증정', points: 40, completed: false},
    ]
  },

  // --- 주간 루틴 (Weekly) ---
  { 
    id: 'w_260323_manual',
    type: 'weekly',
    title: '주간 업무',
    isManual: true,
    completed: false,
    subTasks: [
      { id: 'w_260323_st_01', title: '[침식된 유산을 찾아서]에서 1000개의 오리렌 결정 조각 수집', points: 5, completed: false },
      { id: 'w_260323_st_02', title: '[그림자 이정표]에서 임의의 스테이지 2회 완료', points: 5, completed: false},
      { id: 'w_260323_st_03', title: '제강호에서 오퍼레이터에게 선물 증정 10회', points: 2, completed: false },
      { id: 'w_260323_st_04', title: '적 누적 150명 처치', points: 2, completed: false},
      { id: 'w_260323_st_05', title: '에너지 응집점 15회 제거', points: 1, completed: false },
      { id: 'w_260323_st_06', title: '크레딧 거래소에서 상품 누적 15회 구매', points: 1, completed: false },
      { id: 'w_260323_st_07', title: '누적 3일 로그인', points: 1, completed: false},
      { id: 'w_260323_st_08', title: '임의의 위험한 리허설 프로토콜 공간 15회 완료', points: 1, completed: false},
      { id: 'w_260323_st_09', title: '물리 이상/아츠 폭발/아츠 이상 효과 누적 100회 발동', points: 1, completed: false},
      { id: 'w_260323_st_10', title: '이성 누적 1500 소모', points: 1, completed: false},
    ]
  },
]

export const useRoutineStore = create(
  persist(
    (set, get) => ({
      // 초기 상태 데이터
      routines: initialRoutines,

      // 마지막 초기화 날짜 기록 (ISO 스트링)
      lastResetDaily: new Date().toISOString(),
      lastResetWeekly: new Date().toISOString(),
      lastReset1AM: new Date().toISOString(), // SKPORT 출석 체크용

      // [신규] 리스트 동기화 및 찌꺼기 데이터 자동 제거
      syncRoutines: (latestRoutines) => {
        const savedRoutines = get().routines;
        const merged = latestRoutines.map((newItem) => {
          const savedItem = savedRoutines.find((s) => s.id === newItem.id);
          if (savedItem) {
            // 상위 항목 상태 보존
            const updatedItem = { ...newItem, completed: savedItem.completed, current: savedItem.current };
            
            // 서브 태스크가 있다면 내부 상태도 보존
            if (newItem.subTasks && savedItem.subTasks) {
              updatedItem.subTasks = newItem.subTasks.map(nst => {
                const sst = savedItem.subTasks.find(s => s.id === nst.id);
                return sst ? { ...nst, completed: sst.completed } : nst;
              });
            }
            return updatedItem;
          }
          return newItem;
        });
        set({ routines: merged });
      },

      // 서브 태스크 토글 함수 (일간)
      toggleSubTask: (parentId, subId) => set((state) => ({
        routines: state.routines.map((r) => {
          if (r.id === parentId) {
            const newSubTasks = r.subTasks.map(st => 
              st.id === subId ? { ...st, completed: !st.completed } : st
            );
            // 점수 합산 계산 (최대 100)
            const totalPoints = newSubTasks
              .filter(st => st.completed)
              .reduce((sum, st) => sum + st.points, 0);

            const targetPoints = r.type === 'daily' ? 100 : 10; // 일간은 100점, 주간은 10점

            return { ...r, subTasks: newSubTasks, completed: totalPoints >= targetPoints };
          }
          return r;
        })
      })),

      // 자동 초기화 체크 로직
      checkAndReset: () => {
        const state = get();
        const now = new Date();
        const nowISO = now.toISOString();

        // 1. 일간 기준점 (매일 새벽 5시)
        const dailyThreshold = new Date(now);
        dailyThreshold.setHours(5, 0, 0, 0);
        // 현재가 새벽 5시 전이라면 기준점은 '어제' 새벽 5시임
        if (now < dailyThreshold) {
          dailyThreshold.setDate(dailyThreshold.getDate() - 1);
        }

        // 2. 매일 오전 1시 기준점 (SKPORT 출석 체크 전용)
        const threshold1AM = new Date(now);
        threshold1AM.setHours(1, 0, 0, 0);
        if (now < threshold1AM) {
          threshold1AM.setDate(threshold1AM.getDate() - 1);
        }

        // 3. 주간 기준점 (월요일 새벽 5시)
        const weeklyThreshold = new Date(now);
        const day = weeklyThreshold.getDay(); 
        // 월요일(1)을 기준으로 차이 계산 (일요일은 0이므로 -6일 처리)
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        weeklyThreshold.setDate(weeklyThreshold.getDate() + diffToMonday);
        weeklyThreshold.setHours(5, 0, 0, 0);

        // 현재가 월요일 새벽 5시 전이라면 기준점은 '지난주' 월요일임
        if (now < weeklyThreshold) {
          weeklyThreshold.setDate(weeklyThreshold.getDate() - 7);
        }

        console.log("현재 시간:", now.toLocaleString());
        console.log("주간 기준점:", weeklyThreshold.toLocaleString());
        console.log("마지막 주간 초기화 기록:", new Date(state.lastResetWeekly).toLocaleString());

        // 저장된 시간 데이터 로드
        const lastDaily = new Date(state.lastResetDaily);
        const lastWeekly = new Date(state.lastResetWeekly);
        const last1AM = new Date(state.lastReset1AM || 0); // 초기값이 없을 때 대비

        // 핵심 비교: 마지막 기록이 기준점보다 '과거'라면 초기화 실행
        if (lastDaily < dailyThreshold) {
          console.log("일간 업무가 갱신되었습니다.");
          state.resetRoutines('daily');
          set({ lastResetDaily: nowISO });
        }

        if (last1AM < threshold1AM) {
          console.log("SKPORT 출석 체크가 갱신되었습니다.");
          state.resetRoutines('daily', '1am');
          set({ lastReset1AM: nowISO });
        }

        if (lastWeekly < weeklyThreshold) {
          console.log("주간 업무가 갱신되었습니다.");
          state.resetRoutines('weekly');
          set({ lastResetWeekly: nowISO });
        }
      },

      // 횟수 업데이트 함수
      updateCount: (id, delta) => set((state) => ({
        routines: state.routines.map((r) => {
          if (r.id === id) {
            const nextCount = Math.min(Math.max(r.current + delta, 0), r.max);
            return { ...r, current: nextCount, completed: nextCount === r.max };
          }
          return r;
        })
      })),

      // 체크박스 토글
      toggleRoutine: (id) => set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === id ? { ...routine, completed: !routine.completed } : routine
        )
      })),

      // 리셋 함수
      resetRoutines: (type, targetResetTime = '5am') => set((state) => ({
        routines: state.routines.map((r) => {
          // 해당 타입(daily 또는 weekly)인 경우에만 초기화 진행
          // 항목에 resetTime이 없다면 기본값은 '5am'으로 간주
          const itemResetTime = r.resetTime || '5am';

          if (r.type === type && itemResetTime === targetResetTime) {
            // 1. 하위 항목(subTasks)이 있는 경우 (운영 매뉴얼, 주간 업무)
            if (r.subTasks) {
              return {
                ...r,
                completed: false,
                current: 0, // 혹시 모를 카운터 초기화
                subTasks: r.subTasks.map(st => ({ ...st, completed: false })) // 내부 항목 전부 체크 해제
              };
            }
            // 2. 일반 항목 또는 카운터 항목인 경우
            return { ...r, completed: false, current: 0 };
          }
        // 타입이 다르면 그대로 유지
        return r;
        })
      }))
    }),
    {
      name: 'endfield-routine-storage',
      storage: createJSONStorage(() => localStorage), // 명시적으로 로컬 스토리지 지정
      version: 1,
    }
  )
)

export { initialRoutines };