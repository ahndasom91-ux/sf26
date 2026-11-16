/**
 * 2026 Summer Festival 만족도 조사 [방콕] — 설문 구성 (단일 원본)
 *
 * 이 파일 하나를 Apps Script(gas/)와 설문 페이지(web/)가 함께 사용한다.
 *   - Apps Script : 서버 검증 · 응답 시트 열 제목 · 집계 수식
 *   - web/index.html : 화면 렌더링 (<script src="questions.js">)
 * 수정 후에는 반드시 web/questions.js 로 복사하고(내용 동일), SCHEMA_VERSION 을 올린다.
 * (버전이 다르면 서버가 집계 탭을 다시 만들고, 페이지는 "새로고침" 안내를 띄운다)
 *
 * 문항 형식
 *   type 'scale' : 단일 점수. points = 10 (모든 점수 문항은 1~10점)
 *   type 'group' : 항목별 점수(가수별·식당별 등). items[], points. skippable 이면 항목마다 skipLabel(미방문 등) 선택 가능
 *                  sections[] 가 있으면 화면에서 항목을 item.sec 별로 묶어 그 순서대로 보여준다(시트 열 순서는 items 순서 그대로)
 *                  item.note = 항목 아래 작은 설명, item.ends = [1점 쪽 문구, 10점 쪽 문구] (기본: 매우 불만족 / 매우 만족)
 *   type 'text'  : 주관식. max = 글자 수 제한. 주관식은 모두 선택(required:false)
 *   no    : 화면 번호 ('1', '2-1' ...; '-' 가 있으면 하위 문항으로 표시)   col : 응답 시트 열 제목   area : 영역 태그
 */

var SURVEY_TITLE = '2026 Summer Festival 만족도 조사 [방콕]';
var SCHEMA_VERSION = '5';

/** 설문 페이지 주소(GitHub Pages). Apps Script 링크로 들어온 사람은 이 주소로 보낸다 */
var PAGE_URL = 'https://ahndasom91-ux.github.io/sf26/';
/** 저장 API (Apps Script 웹앱 배포 URL, @버전 고정 배포) */
var API_URL = 'https://script.google.com/macros/s/AKfycbzD_bLwQFgr_N01W6HVsx_N4gRLFsrsa3zr-HdybjupgTm8w1gTJjj63LSq5iEa4emU/exec';

var INTRO_NOTICE = '본 설문은 익명으로 진행되며, 1인 1회 참여를 원칙으로 합니다. 응답 내용은 향후 행사 운영 개선을 위한 자료로 활용됩니다.';
var THANKS_MESSAGE = '소중한 의견 감사합니다. 응답이 정상적으로 제출되었습니다.';
var AUTHOR_LINE = '설문 작성자 : RP영업지원팀 안다솜과장';

var SCALE_LABELS_5 = { 1: '매우 불만족', 2: '불만족', 3: '보통', 4: '만족', 5: '매우 만족' };

/** 이유 주관식 공통 문구 */
var REASON_TITLE = '점수에 대한 이유나 의견을 자유롭게 작성해주세요.';

var QUESTIONS = [
  /* ── 1. 행사 전체 ── */
  { id: 'q1', no: '1', area: '총평', type: 'scale', points: 10, required: true,
    title: '2026 Summer Festival 행사 전체에 대한 총점을 매겨주세요.', col: 'Q1 행사 전체 총점' },
  { id: 'q1r', no: '1-1', area: '총평', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q1-1 행사 총점 이유' },

  /* ── 2. 호텔 ── */
  { id: 'q2', no: '2', area: '호텔', type: 'scale', points: 10, required: true,
    title: '호텔에 대한 총평을 점수로 매겨주세요.', col: 'Q2 호텔 총평' },
  { id: 'q2_1', no: '2-1', area: '호텔', type: 'scale', points: 10, required: true,
    title: '숙소의 위치는 어떠셨나요?', col: 'Q2-1 숙소 위치' },
  { id: 'q2_2', no: '2-2', area: '호텔', type: 'scale', points: 10, required: true,
    title: '숙소의 서비스는 어떠셨나요?', desc: '객실 시설 / 청결 상태 / 직원 서비스 등', col: 'Q2-2 숙소 서비스' },
  { id: 'q2r', no: '2-3', area: '호텔', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q2-3 호텔 이유' },

  /* ── 3. 만찬/시상식 ── */
  { id: 'q3', no: '3', area: '만찬/시상식', type: 'scale', points: 10, required: true,
    title: '만찬/시상식에 대한 전체 총점을 매겨주세요.', col: 'Q3 만찬/시상식 총점' },
  { id: 'q3_1', no: '3-1', area: '만찬/시상식', type: 'scale', points: 10, required: true,
    title: '시상식의 구성과 진행은 어떠셨나요?',
    desc: '시상 진행 순서 및 진행 속도 / 무대·영상·음향 등 연출 / 전체 소요시간 및 축하 분위기 등', col: 'Q3-1 시상식 구성·진행' },
  { id: 'q3r', no: '3-2', area: '만찬/시상식', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q3-2 만찬/시상식 이유' },

  /* ── 4. 특별공연 ── */
  { id: 'q4', no: '4', area: '특별공연', type: 'group', points: 10, required: true,
    title: '특별공연에 대한 점수를 가수별로 매겨주세요.',
    items: [
      { id: 'q4_1', label: '장혜리', col: 'Q4-1 특별공연 장혜리' },
      { id: 'q4_2', label: '김원준', col: 'Q4-2 특별공연 김원준' },
      { id: 'q4_3', label: '하이키', col: 'Q4-3 특별공연 하이키' }
    ] },
  { id: 'q4r', no: '4-1', area: '특별공연', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q4-4 특별공연 이유' },

  /* ── 5. 식당 ── */
  { id: 'q5', no: '5', area: '식당', type: 'group', points: 10, required: true, skippable: true, skipLabel: '미방문',
    title: '식당에 대한 평가를 방문한 곳별로 매겨주세요.',
    desc: '방문하지 않은 식당은 "미방문"을 선택해주세요.',
    items: [
      { id: 'q5_1', label: '(현지식) 망고트리',   col: 'Q5-1 식당 (현지식) 망고트리' },
      { id: 'q5_2', label: '(한식) 페닌슐라',     col: 'Q5-2 식당 (한식) 페닌슐라' },
      { id: 'q5_3', label: '(현지식) 꼬란타식당', col: 'Q5-3 식당 (현지식) 꼬란타식당' },
      { id: 'q5_4', label: '(만찬) 호텔뷔페',     col: 'Q5-4 식당 (만찬) 호텔뷔페' }
    ] },
  { id: 'q5r', no: '5-1', area: '식당', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q5-5 식당 이유' },

  /* ── 6~7. 관광지 ── */
  { id: 'q6', no: '6', area: '관광지', type: 'scale', points: 10, required: true,
    title: '방문 관광지에 대한 전체적인 평가를 점수로 매겨주세요.', col: 'Q6 관광지 전체 평가' },
  { id: 'q6r', no: '6-1', area: '관광지', type: 'text', required: false, max: 1000,
    title: REASON_TITLE, col: 'Q6-1 관광지 이유' },

  { id: 'q7', no: '7', area: '관광지', type: 'group', points: 10, required: true, skippable: true, skipLabel: '미참여',
    title: '방문 관광지별로 평가 점수를 매겨주세요.',
    desc: '참여하지 않은 일정은 "미참여"를 선택해주세요.',
    // 화면에는 sections 순서(골프 → 선택관광 → 자유일정)대로 묶어서 보여준다.
    // items 의 순서·id·col 은 응답 시트 열 순서이므로 바꾸지 않는다 (바꾸면 응답 탭이 새로 만들어진다)
    sections: ['골프', '선택관광', '자유일정'],
    items: [
      { id: 'q7_1', sec: '골프',     label: '로얄방파인',      col: 'Q7-1 관광지 (골프) 로얄방파인' },
      { id: 'q7_2', sec: '골프',     label: '카스카타',        col: 'Q7-2 관광지 (골프) 카스카타' },
      { id: 'q7_3', sec: '자유일정', label: '자유일정',        col: 'Q7-3 관광지 (선택) 자유일정',
        note: '자유일정이 만족스러웠다면 10점, 아쉬웠다면(선택관광이 더 나았겠다) 1점에 가깝게 골라주세요.',
        ends: ['아쉬웠다 (선택관광 선호)', '만족스러웠다'] },
      { id: 'q7_4', sec: '선택관광', label: '아유타야+크루즈', col: 'Q7-4 관광지 (선택) 아유타야+크루즈' },
      { id: 'q7_5', sec: '선택관광', label: '마하나콘+마사지', col: 'Q7-5 관광지 (선택) 마하나콘+마사지' },
      { id: 'q7_6', sec: '선택관광', label: '고급스파',        col: 'Q7-6 관광지 (선택) 고급스파' },
      { id: 'q7_7', sec: '선택관광', label: '매끌렁+담넌사',   col: 'Q7-7 관광지 (선택) 매끌렁+담넌사' },
      { id: 'q7_8', sec: '선택관광', label: '롱테일보트',      col: 'Q7-8 관광지 (선택) 롱테일보트' }
    ] },

  /* ── 8. 이동 ── */
  { id: 'q8', no: '8', area: '일정', type: 'scale', points: 10, required: true,
    title: '현지 이동(버스 등)은 어떠셨나요?', desc: '이동 동선 / 버스 상태 등', col: 'Q8 현지 이동' },

  /* ── 9~10. 종합 의견 ── */
  { id: 'q9', no: '9', area: '평가', type: 'text', required: false, max: 1000,
    title: '이번 여행에 대한 전반적인 의견을 자유롭게 작성해주세요.',
    desc: '특히 만족스러웠던 점이나 개선이 필요하다고 생각되는 부분이 있다면 함께 기재해주시면 향후 운영에 반영하겠습니다.',
    col: 'Q9 전반적 의견' },
  { id: 'q10', no: '10', area: '평가', type: 'text', required: false, max: 200,
    title: '다음 Summer Festival에서 희망하시는 여행지가 있다면 자유롭게 작성해주세요.',
    col: 'Q10 희망 여행지' }
];

/** 응답 시트 열 정의(평탄화): group 의 항목은 각각 별도 열 */
function fieldList() {
  var list = [];
  QUESTIONS.forEach(function (q) {
    if (q.type === 'group') {
      q.items.forEach(function (it, i) {
        list.push({ id: it.id, qid: q.id, col: it.col, type: 'scale', points: q.points, area: q.area, no: q.no + '-' + (i + 1),
                    required: !!q.required, skippable: !!q.skippable, skipLabel: q.skipLabel || '',
                    label: q.title + ' — ' + (it.sec && it.sec !== it.label ? '(' + it.sec + ') ' : '') + it.label });
      });
    } else {
      list.push({ id: q.id, qid: q.id, col: q.col, type: q.type, points: q.points, area: q.area, no: q.no,
                  required: !!q.required, max: q.max, skippable: false, skipLabel: '', label: q.title });
    }
  });
  return list;
}
