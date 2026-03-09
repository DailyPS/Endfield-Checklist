import { useEffect } from 'react';
import './App.css'
import { useRoutineStore, initialRoutines } from './store/useStore'

// 하위 컴포넌트: 일반 및 카운터 태스크
const TaskItem = ({ routine, toggleRoutine, updateCount }) => {
  if (routine.isCounter) {
    /* [카운터 항목] 기존처럼 유지 (버튼 보호를 위해 div 구조 사용) */
    return (
      <div className={`task-card ${routine.completed ? 'completed' : 'active'}`}>
        <div className="counter-container w-full">
          <div className="counter-header flex justify-between items-center mb-2">
            <div className="flex items-center">
              <input type="checkbox" checked={routine.completed} readOnly className="task-checkbox" />
              <span className="task-label active ml-2">{routine.title}</span>
            </div>
            <span className="text-ef-accent font-bold whitespace-nowrap pt-1">{routine.current}/{routine.max}</span>
          </div>
          <div className="progress-wrapper flex items-center gap-3">
            <button className="btn-count" onClick={() => updateCount(routine.id, -1)}>-</button>
            <div className="progress-bar-bg flex-1">
              <div className="progress-bar-fill" style={{ width: `${(routine.current / routine.max) * 100}%` }} />
            </div>
            <button className="btn-count" onClick={() => updateCount(routine.id, 1)}>+</button>
          </div>
        </div>
      </div>
    );
  }

  /* [일반 항목] 클릭 영역 최대화: label을 최외각으로 배치 */
  return (
    <label 
      className={`task-card flex items-center w-full cursor-pointer group ${routine.completed ? 'completed' : 'active'}`}
      style={{ display: 'flex' }} // 확실하게 flex 영역 확보
    >
      <input
        type="checkbox"
        checked={routine.completed}
        onChange={() => toggleRoutine(routine.id)}
        className="task-checkbox"
      />
      <span className={`task-label flex-1 ml-3 ${routine.completed ? 'completed' : 'active'}`}>
        {routine.title}
      </span>
    </label>
  );
};

// 하위 컴포넌트: 운영 매뉴얼 스타일 섹션 (Daily/Weekly 공용)
const ManualSection = ({ title, task, totalPoints, target, isFinished, onToggle }) => {
  if (!task) return null;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-ef-accent font-bold text-lg">{title}</span>
        <span className="points-display">{totalPoints} / {target}</span>
      </div>
      <div className="flex flex-col gap-1">
        {task.subTasks.map(st => (
          <label
            key={st.id}
            className={`task-card flex justify-between items-start gap-x-4 ${st.completed ? 'completed' : 'active'} 
            ${isFinished && !st.completed ? 'opacity-30 pointer-events-none' : ''}`}
          >
            <div className="flex items-start flex-1 min-w-0">
              <input 
                type="checkbox" 
                checked={st.completed} 
                disabled={isFinished && !st.completed}
                onChange={() => onToggle(task.id, st.id)}
                className="task-checkbox mt-1"
              />
              <span className={`task-label-sec3 ml-3 break-keep ${st.completed ? 'completed' : 'active'}`}>
                {st.title}
              </span>
            </div>
            <span className="text-ef-accent font-bold whitespace-nowrap pt-1">+{st.points}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

function App() {
  const { checkAndReset, routines, toggleRoutine, resetRoutines, updateCount, toggleSubTask, syncRoutines } = useRoutineStore();

  // 데이터 분류 및 계산 로직 캡슐화
  const getTaskData = (type) => {
    const list = routines.filter(r => r.type === type && !r.isManual);
    const manual = routines.find(r => r.type === type && r.isManual);
    const points = manual?.subTasks.filter(st => st.completed).reduce((s, st) => s + st.points, 0) || 0;
    return { list, manual, points };
  };

  useEffect(() => {
    // 1. 접속 즉시 소스 코드의 최신 리스트와 사용자 데이터 병합
    // (지난주 ID는 여기서 자동으로 필터링되어 사라집니다)
    syncRoutines(initialRoutines);
    
    // 2. 초기화 시간 체크
    checkAndReset();
    
    const timer = setInterval(() => {
      checkAndReset();
    }, 60000);

    return () => clearInterval(timer);
  }, [checkAndReset]);

  const daily = getTaskData('daily');
  const weekly = getTaskData('weekly');

  const isDailyFinished = daily.points >= 100;
  const isWeeklyFinished = weekly.points >= 10;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title text-ef-accent">엔드필드 일일/주간 임무 체크리스트</h1>
        <p className="app-subtitle">시스템 관제 // 일간 및 주간 루틴 트래커</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-350 mx-auto px-4">
        
        {/* 컬럼 1: 일간 루틴 */}
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">일간 업무</h2>
            <button onClick={() => resetRoutines('daily')} className="btn-reset">일간 초기화</button>
          </div>
          <div className="task-list daily-list">
            {daily.list.map(r => (
              <TaskItem key={r.id} routine={r} toggleRoutine={toggleRoutine} updateCount={updateCount} />
            ))}
          </div>
        </section>

        {/* 컬럼 2: 일상 매뉴얼 */}
        <section className="section-container">
          <div className="section-header border-l-4 border-ef-accent pl-3">
            <h2 className="section-title">일상 - 일일 임무</h2>
          </div>
          <ManualSection 
            title="작전 매뉴얼"
            task={daily.manual}
            totalPoints={daily.points}
            target={100}
            isFinished={isDailyFinished}
            onToggle={toggleSubTask}
          />
        </section>

        {/* 컬럼 3: 주간 업무 */}
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">주간 업무</h2>
            <button onClick={() => resetRoutines('weekly')} className="btn-reset">주간 초기화</button>
          </div>
          <div className="task-list">
            <ManualSection 
              title="이벤트 - 주간 업무"
              task={weekly.manual}
              totalPoints={weekly.points}
              target={10}
              isFinished={isWeeklyFinished}
              onToggle={toggleSubTask}
            />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span className="version-tag">v1.1.1</span>
          <span className="footer-separator">|</span>
          <span className="copyright">© 2026 Endfield Routine Tracker</span>
        </div>
        <p className="disclaimer">
          본 사이트는 팬이 제작한 도구이며, Hypergryph 또는 GRYPHLINE과 관련이 없습니다.
        </p>
      </footer>
    </div>
  );
}

export default App;