import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Utensils,
} from 'lucide-react'

const API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo'
const OFFICE_CODE = 'R10'
const SCHOOL_CODE = '8750467'
const MEAL_TYPES = ['조식', '중식', '석식']

// 로컬 시간 기준 오늘을 YYYY-MM-DD 형식으로 반환합니다.
function toInputDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 날짜 문자열을 시간대 영향 없이 로컬 Date 객체로 바꿉니다.
function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value) {
  const date = parseLocalDate(value)
  const formatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(date)
  return { formatted, weekday }
}

function formatApiDate(value) {
  return value.replaceAll('-', '')
}

// NEIS의 <br>, <br/>, <br /> 표기를 메뉴 항목별 배열로 바꿉니다.
function splitMenu(dishName = '') {
  return dishName
    .split(/<br\s*\/?\s*>/i)
    .map((item) => item.replace(/&amp;/g, '&').trim())
    .filter(Boolean)
}

function App() {
  const [selectedDate, setSelectedDate] = useState(() => toInputDate())
  const [selectedMealType, setSelectedMealType] = useState('중식')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 한 날짜의 전체 급식(조식·중식·석식)을 가져옵니다.
  const fetchMealData = useCallback(async (date, signal) => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams({
      Type: 'json',
      ATPT_OFCDC_SC_CODE: OFFICE_CODE,
      SD_SCHUL_CODE: SCHOOL_CODE,
      MLSV_YMD: formatApiDate(date),
    })

    const apiKey = import.meta.env.VITE_NEIS_API_KEY?.trim()
    if (apiKey && apiKey !== 'your_neis_api_key_here') params.set('KEY', apiKey)

    try {
      const response = await fetch(`${API_URL}?${params}`, { signal })
      if (!response.ok) throw new Error(`HTTP_${response.status}`)

      const data = await response.json()
      const result = data.RESULT ?? data.mealServiceDietInfo?.[0]?.head?.find(
        (item) => item.RESULT,
      )?.RESULT

      // INFO-200은 정상적인 '데이터 없음' 응답입니다.
      if (result?.CODE === 'INFO-200') {
        setMeals([])
        return
      }
      if (result && result.CODE !== 'INFO-000') {
        throw new Error(`API_${result.MESSAGE || result.CODE}`)
      }

      setMeals(data.mealServiceDietInfo?.[1]?.row ?? [])
    } catch (caughtError) {
      if (caughtError.name === 'AbortError') return
      setMeals([])
      setError(
        caughtError.message.startsWith('API_')
          ? caughtError.message.slice(4)
          : '급식 정보를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.',
      )
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchMealData(selectedDate, controller.signal)
    return () => controller.abort()
  }, [selectedDate, fetchMealData])

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.MMEAL_SC_NM === selectedMealType),
    [meals, selectedMealType],
  )
  const menuItems = useMemo(() => splitMenu(selectedMeal?.DDISH_NM), [selectedMeal])
  const { formatted, weekday } = formatDisplayDate(selectedDate)

  function moveDate(amount) {
    const date = parseLocalDate(selectedDate)
    date.setDate(date.getDate() + amount)
    setSelectedDate(toInputDate(date))
  }

  return (
    <main className="page-shell">
      <div className="decor decor-one" aria-hidden="true" />
      <div className="decor decor-two" aria-hidden="true" />

      <header className="site-header">
        <div className="brand-mark" aria-hidden="true"><Utensils size={22} /></div>
        <div>
          <p className="eyebrow">ANGYE HIGH SCHOOL</p>
          <h1>안계고 오늘의 급식</h1>
        </div>
      </header>

      <section className="meal-card" aria-live="polite">
        <div className="card-topline">
          <span className="today-label">오늘도 맛있는 하루</span>
          <span className="school-label">안계고등학교</span>
        </div>

        <div className="date-navigation">
          <button className="arrow-button" onClick={() => moveDate(-1)} aria-label="전날 급식 보기">
            <ChevronLeft />
          </button>
          <div className="date-heading">
            <p>{weekday}</p>
            <h2>{formatted}</h2>
          </div>
          <button className="arrow-button" onClick={() => moveDate(1)} aria-label="다음날 급식 보기">
            <ChevronRight />
          </button>
        </div>

        <div className="controls">
          <label className="control-field">
            <span>급식 선택</span>
            <select value={selectedMealType} onChange={(event) => setSelectedMealType(event.target.value)}>
              {MEAL_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>

          <label className="control-field date-field">
            <span>날짜 선택</span>
            <div className="date-input-wrap">
              <CalendarDays size={18} aria-hidden="true" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => event.target.value && setSelectedDate(event.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="divider" />

        <div className="menu-section">
          <div className="menu-title-row">
            <div>
              <p className="menu-kicker">TODAY'S MENU</p>
              <h3>{selectedMealType} 메뉴</h3>
            </div>
            {selectedMeal?.CAL_INFO && <span className="calorie-badge">{selectedMeal.CAL_INFO}</span>}
          </div>

          {loading ? (
            <div className="state-box loading-state">
              <span className="spinner" />
              <p>맛있는 메뉴를 불러오는 중이에요</p>
            </div>
          ) : error ? (
            <div className="state-box error-state">
              <p>{error}</p>
              <button onClick={() => fetchMealData(selectedDate)}><RefreshCw size={16} /> 다시 시도</button>
            </div>
          ) : menuItems.length ? (
            <ul className="menu-list">
              {menuItems.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span className="menu-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="state-box empty-state">
              <span className="empty-icon">🍽️</span>
              <p>등록된 급식 정보가 없습니다.</p>
              <small>다른 날짜나 급식 종류를 선택해 보세요.</small>
            </div>
          )}
        </div>
      </section>

      <footer>
        <p>식단 정보는 학교 사정에 따라 변경될 수 있습니다.</p>
        <span>NEIS 교육정보 개방 포털 제공</span>
      </footer>
    </main>
  )
}

export default App
