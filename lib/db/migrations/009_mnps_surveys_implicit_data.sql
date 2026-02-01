-- migration: 009_mnps_surveys_implicit_data.sql
-- 사용자 입력 없이 자동 수집되는 메타데이터 컬럼 추가 (개인정보 무관)

ALTER TABLE mnps_surveys
  ADD COLUMN IF NOT EXISTS device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  ADD COLUMN IF NOT EXISTS time_to_survey_ms INTEGER,  -- 결과 페이지 로드 ~ 설문 제출까지 경과 시간
  ADD COLUMN IF NOT EXISTS bad_report_unlocked BOOLEAN DEFAULT FALSE;  -- 어두운 이면 해제 여부
