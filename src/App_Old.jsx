import './App.css'
import { useRoutineStore } from './store/useStore'

function App() {
  // Zustand 스토어에서 데이터와 함수들을 가져옴
  const { routines, toggleRoutine, resetRoutines, updateCount, toggleSubTask} = useRoutineStore()

  // 일간(daily)과 주간(weekly) 숙제를 분리
  const dailyRoutines = routines.filter((r) => r.type === 'daily' && !r.isManual);
  const manualTask = routines.find((r) => r.isManual && r.type === 'daily');
  const weeklyRoutines = routines.filter((r) => r.type === 'weekly');
  const weeklyManualTask = routines.find((r) => r.isManual && r.type === 'weekly');

  // 현재 점수 계산
  const dailyPoints = manualTask?.subTasks.filter(st => st.completed).reduce((s, st) => s + st.points, 0) || 0;
  const weeklyPoints = weeklyManualTask?.subTasks.filter(r => r.completed).reduce((s, r) => s + r.points, 0) || 0;

  // 목표 달성 여부 (100점 / 10점 기준)
  const isDailyFinished = dailyPoints >= 100;
  const isWeeklyFinished = weeklyPoints >= 10;

  return (
    <div className="app-container">
      {/* 최상단 헤더 */}
      <header className="app-header">
        <h1 className="app-title">엔드필드 일일/주간 임무 체크리스트</h1>
        <p className="app-subtitle">시스템 관제 // 일간 및 주간 루틴 트래커</p>
      </header>

      {/* 메인 3컬럼 그리드 레이아웃 */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-400 mx-auto">

        {/* 컬럼 1: 일간 루틴 (Daily) */}
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">일간 업무 (Daily)</h2>
            <button 
              onClick={() => resetRoutines('daily')}
              className="btn-reset"
            >
              일간 초기화
            </button>
          </div>
          
          <div className="task-list flex flex-col gap-1">
            {dailyRoutines.map((routine) => (
              <div key={routine.id} className={`task-card ${routine.completed ? 'completed' : 'active'}`}>

                {/* 케이스 1: 운영 매뉴얼 (세부 점수제) */}
                {routine.isCounter ? (
                  <div className="counter-container">
                    <div className="counter-header">
                      <div className="flex items-center">
                        <input type="checkbox" checked={routine.completed} readOnly className="task-checkbox" />
                        <span className="task-label active">{routine.title}</span>
                      </div>
                      <span className="count-display">{routine.current}/{routine.max}</span>
                    </div>
                    <div className="progress-wrapper">
                      <button className="btn-count" onClick={() => updateCount(routine.id, -1)}>-</button>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${(routine.current / routine.max) * 100}%` }}
                        ></div>
                      </div>
                      <button className="btn-count" onClick={() => updateCount(routine.id, 1)}>+</button>
                    </div>
                  </div>
                ) : (

                /* 케이스 2: 일반 체크박스 임무 (기본값) */
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routine.completed}
                    onChange={() => toggleRoutine(routine.id)}
                    className="task-checkbox"
                  />
                  <span className={`task-label ${routine.completed ? 'completed' : 'active'}`}>
                    {routine.title}
                  </span>
                </label>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 컬럼 2: 일상 - 일일 임무 (Operational Manual) */}
        <section className={`section-container`}>
          <div className="flex justify-between items-center mb-6 border-l-4 border-ef-accent pl-3">
            <h2 className="section-title">일상 - 일일 임무</h2>
            <span className="points-display">{dailyPoints} / 100</span>
          </div>
          <div className="task-list flex flex-col gap-1">
            {manualTask?.subTasks.map(st => (
              <label 
                key={st.id} 
                className={`task-card flex justify-between ${st.completed ? 'completed' : 'active'} 
                ${isDailyFinished && !st.completed ? 'opacity-30 pointer-events-none' : ''}`}
              >
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={st.completed} 
                    disabled={isDailyFinished && !st.completed} // 점수 달성 시 미완료 항목 체크 불가
                    onChange={() => toggleSubTask(manualTask.id, st.id)} 
                    className="task-checkbox" 
                  />
                  <span className={`task-label ${st.completed ? 'line-through' : ''}`}>{st.title}</span>
                </div>
                <span className="text-ef-accent font-bold">+{st.points}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 컬럼 3: 주간 업무 (Weekly) */}
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">주간 업무 (Weekly)</h2>
            <button 
              onClick={() => resetRoutines('weekly')}
              className="btn-reset"
            >
              주간 초기화
            </button>
          </div>
          
          <div className="task-list">
            {weeklyRoutines.map((routine) => (
              <div 
                key={routine.id} 
                className={`task-card-container ${routine.completed ? 'completed' : 'active'}`}
              >
                <div className="w-full">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-ef-accent font-bold">{routine.title}</span>
                      <span className="points-display">
                        {weeklyPoints} / 10
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {routine.subTasks.map(st => (
                        <label
                          key={st.id}
                          className={`task-card flex justify-between items-start gap-x-4 ${st.completed ? 'completed' : 'active'} 
                          ${isWeeklyFinished && !st.completed ? 'opacity-30 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start flex-1 min-w-0">
                            <input 
                              type="checkbox" 
                              checked={st.completed} 
                              disabled={isWeeklyFinished && !st.completed} // 점수 달성 시 미완료 항목 체크 불가
                              onChange={() => toggleSubTask(routine.id, st.id)}
                              className="task-checkbox mt-1"
                            />
                            <span className={`task-label-sec3 ml-3 break-keep ${st.completed ? 'completed' : 'active'}`}>{st.title}</span>
                          </div>
                          <span className="text-ef-accent font-bold whitespace-nowrap pt-1">+{st.points}</span>
                        </label>
                      ))}
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App