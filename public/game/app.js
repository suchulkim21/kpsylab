/* ============================================
   KPSY Typing — App (스테이지 목표 달성 시 자동 다음/승급, 클릭 최소화)
   data.js, core.js, battle.js 의존
   ============================================ */

class App {
  constructor() {
    this.EXCELLENT_THRESHOLD = 250;
    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      results: document.getElementById('results-screen')
    };
    this.inputEl = document.getElementById('typing-input');
    this.promptEl = document.getElementById('prompt-text');
    this.ambientEl = document.getElementById('ambient-border');
    this.eqCanvas = document.getElementById('equalizer-canvas');
    this.battleCanvas = document.getElementById('battle-canvas');
    this.levelBtns = document.querySelectorAll('#game-screen .level-btn');
    this.progressFill = document.getElementById('progress-fill');
    this.tierIndicator = document.getElementById('tier-indicator');
    this.submitHint = document.getElementById('submit-hint');
    this.liveCpmEl = document.getElementById('live-cpm');
    this.excellentFlash = document.getElementById('excellent-flash');
    this.stageToast = document.getElementById('stage-toast');
    this.timerEl = document.getElementById('nav-timer');
    this.navLevels = document.getElementById('nav-levels');
    this.currentLevel = 'beginner';
    this._selectedStage = 'all';
    this._matched = false;
    this._totalKeystrokes = 0;
    this._correctKeystrokes = 0;
    this._tierCPMs = [];
    this.introRenderer = new IntroRenderer(document.getElementById('intro-canvas'));
    this.introRenderer.start();
    this._smoothedCPM = 0;
    this.sound = new SoundController();
    this._timeLimit = 180; // 3 minutes
    this._timeRemaining = 180;
    this._gameActive = false;
    this._lastFrameTime = 0;

    // 식별번호 + 기록 시스템
    this._userId = this._getOrCreateUserId();
    this._records = this._loadRecords();
    document.getElementById('user-id-display').textContent = `ID: ${this._userId}`;

    this._bindStartScreen();
    this._renderStartRecords();
  }

  _getOrCreateUserId() {
    let id = localStorage.getItem('kpsy_typing_user_id');
    if (!id) {
      id = 'KT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
      localStorage.setItem('kpsy_typing_user_id', id);
    }
    return id;
  }

  _loadRecords() {
    try {
      return JSON.parse(localStorage.getItem('kpsy_typing_records') || '{}');
    } catch { return {}; }
  }

  _saveStageRecord(stageKey, avgCPM, accuracy) {
    const prev = this._records[stageKey];
    const now = new Date().toLocaleDateString('ko-KR');
    const rec = {
      bestCPM: prev ? Math.max(prev.bestCPM, avgCPM) : avgCPM,
      lastCPM: avgCPM,
      bestAcc: prev ? Math.max(prev.bestAcc, accuracy) : accuracy,
      lastAcc: accuracy,
      attempts: (prev ? prev.attempts : 0) + 1,
      date: now
    };
    this._records[stageKey] = rec;
    localStorage.setItem('kpsy_typing_records', JSON.stringify(this._records));
    return rec;
  }

  _renderStartRecords() {
    const el = document.getElementById('start-records');
    const stages = ['b1', 'b2', 'b3', 'b4', 'm1', 'm2', 'adv'];
    const labels = { b1: '초급 1', b2: '초급 2', b3: '초급 3', b4: '초급 4', m1: '중급 1', m2: '중급 2', adv: '고급' };
    const hasAny = stages.some(k => this._records[k]);
    if (!hasAny) { el.classList.add('hidden'); return; }

    el.classList.remove('hidden');
    let html = '<p class="records-title">이전 기록</p><div class="records-grid">';
    for (const k of stages) {
      const r = this._records[k];
      if (!r) continue;
      html += `<div class="record-card">
        <span class="record-stage">${labels[k]}</span>
        <span class="record-best">${r.bestCPM} <small>타/분</small></span>
        <span class="record-acc">${r.bestAcc}%</span>
        <span class="record-tries">${r.attempts}회</span>
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  }

  /** 레벨별 구간당 문장 수 */
  getSessionSize() {
    return this.currentLevel === 'beginner' ? 50 : 30;
  }

  _showScreen(n) {
    Object.values(this.screens).forEach(s => s.classList.add('hidden'));
    this.screens[n].classList.remove('hidden');
  }

  _bindStartScreen() {
    const btns = document.querySelectorAll('.start-level-btn');
    const stagesEl = document.getElementById('start-stages');
    const stageBtns = document.querySelectorAll('.start-stage-btn');

    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.currentLevel = b.dataset.level;
      // 초급일 때만 스테이지 선택 표시
      if (b.dataset.level === 'beginner') {
        stagesEl.classList.remove('hidden');
      } else {
        stagesEl.classList.add('hidden');
      }
    }));

    stageBtns.forEach(b => b.addEventListener('click', () => {
      stageBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this._selectedStage = b.dataset.stage;
    }));

    document.getElementById('start-btn').addEventListener('click', () => {
      this.sound.resume();
      this.introRenderer.stop();
      this._startGame();
    });
    document.getElementById('retry-btn').addEventListener('click', () => {
      this.introRenderer.stop();
      this._startGame();
    });
    document.getElementById('nav-logo').addEventListener('click', () => {
      this._goHome();
    });
  }

  _goHome() {
    this._gameActive = false;
    if (this.visualizer) { this.visualizer.stop(); this.visualizer.reset(); }
    if (this.battle) { this.battle.stop(); this.battle.reset(); }
    this.liveCpmEl.classList.add('hidden');
    this.timerEl.classList.add('hidden');
    this.navLevels.classList.add('hidden');
    this._renderStartRecords();
    this._showScreen('start');
    this.introRenderer.start();
  }

  _startGame() {
    if (this.currentLevel === 'beginner' && this._selectedStage !== 'all') {
      this._sequence = [this._selectedStage];
    } else {
      this._sequence = [...LEVEL_SEQUENCES[this.currentLevel]];
    }
    this._seqIdx = 0;
    this._totalTiers = this._sequence.length;
    this._allCPMs = [];
    this._tierCPMs = [];
    this._matched = false;
    this._totalKeystrokes = 0;
    this._correctKeystrokes = 0;
    this._sentenceInputCount = 0;
    this._loadTier();
    this._smoothedCPM = 0;
    this._showScreen('game');
    this.timerEl.classList.remove('hidden');
    this.navLevels.classList.remove('hidden');
    this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === this.currentLevel));

    // Timer Start
    this._timeRemaining = this._timeLimit;
    this._gameActive = true;
    this._lastFrameTime = performance.now();
    this._updateTimerDisplay();

    requestAnimationFrame(() => {
      this.visualizer = new Visualizer(this.eqCanvas);
      this.battle = new BattleRenderer(this.battleCanvas);
      this._bindGameEvents();
      this._renderPrompt('');
      this._updateProgress();
      this._updateTierIndicator();
      this.liveCpmEl.classList.remove('hidden');
      this.visualizer.start();
      this.battle.start();
      this.inputEl.value = '';
      this.inputEl.focus();
      this._ambientLoop();
      this._gameLoop();
    });
  }

  _gameLoop() {
    if (!this._gameActive) return;
    const now = performance.now();
    const dt = (now - this._lastFrameTime) / 1000;
    this._lastFrameTime = now;

    if (this._timeRemaining > 0) {
      const prevTime = this._timeRemaining;
      this._timeRemaining -= dt;

      if (this._timeRemaining <= 0) {
        this._timeRemaining = 0;
        this._onStageComplete();
        return;
      } else {
        if (prevTime > 60 && this._timeRemaining <= 60) this.sound.playWarning();
        if (prevTime > 10 && this._timeRemaining <= 10) this.sound.playWarning();
      }
      this._updateTimerDisplay();
    }

    if (this._gameActive) requestAnimationFrame(() => this._gameLoop());
  }

  _updateTimerDisplay() {
    const t = Math.max(0, this._timeRemaining);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    this.timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
    this.timerEl.classList.remove('warn', 'critical');
    if (t <= 10) this.timerEl.classList.add('critical');
    else if (t <= 30) this.timerEl.classList.add('warn');
  }

  _finishGame(reason) {
    this._gameActive = false;
    this._showResults();
  }

  _loadTier() {
    const size = this.getSessionSize();
    const pool = [...TYPING_DATA[this._sequence[this._seqIdx]]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.prompts = pool.slice(0, size);
    this.engine = new TypingEngine(this.prompts);
    this.inputEl.value = '';
    this.promptEl.textContent = '';
    this._matched = false;
    this.submitHint.classList.add('hidden');
    this._tierCPMs = [];
  }

  _animatePrompt() {
    this.promptEl.classList.remove('slide-in');
    void this.promptEl.offsetWidth; // Trigger reflow
    this.promptEl.classList.add('slide-in');
  }

  _triggerStageFlash(type) {
    const el = document.createElement('div');
    el.className = `flash-${type}`;
    el.style.position = 'absolute';
    el.style.inset = '0';
    el.style.zIndex = '200';
    el.style.pointerEvents = 'none';
    document.getElementById('app').appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  _showToast(text, ms, callback) {
    // Legacy support for unexpected calls, but main flow uses seamless
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this.stageToast.textContent = text;
    this.stageToast.classList.remove('hidden', 'promote');
    if (text.includes('승급')) this.stageToast.classList.add('promote');
    this._toastTimer = setTimeout(() => {
      this.stageToast.classList.add('hidden');
      this._toastTimer = null;
      if (callback) callback();
    }, ms);
  }

  _updateTierIndicator() {
    const key = this._sequence[this._seqIdx];
    const label = TIER_LABELS[key] || key;
    this.tierIndicator.textContent = `[ ${label} ] ${this._seqIdx + 1} / ${this._totalTiers}`;
  }

  // ---- 이벤트 ----
  _bindGameEvents() {
    if (this._boundInput) {
      this.inputEl.removeEventListener('input', this._boundInput);
      this.inputEl.removeEventListener('keydown', this._boundKey);
    }
    this._boundInput = () => this._onInput();
    this._boundKey = e => this._onKeyDown(e);
    this.inputEl.addEventListener('input', this._boundInput);
    this.inputEl.addEventListener('keydown', this._boundKey);
    this.levelBtns.forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const l = btn.dataset.level;
        if (l === this.currentLevel) return;
        this.levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLevel = l;
        this._restartSession();
      };
    });
    document.onclick = () => this.inputEl.focus();
  }

  _onInput() {
    const prompt = this.engine.currentPrompt;
    let v = this.inputEl.value;

    if (this._matched) {
      return;
    }

    // 입력 이벤트 카운트 (제출 시 정확도 계산에 사용)
    this._sentenceInputCount++;

    const r = this.engine.processInput(v);
    this.visualizer.updateCPM(r.cpm);
    this.battle.updateCPM(r.cpm);
    this._smoothedCPM += (r.cpm - this._smoothedCPM) * 0.3;

    // 실시간 타수 표시
    this._updateLiveCPM(r.cpm);

    if (r.type === 'matched') {
      this._matched = true;
      this.submitHint.classList.remove('hidden');
      this._renderPrompt(v);
    } else {
      this._matched = false;
      this.submitHint.classList.add('hidden');
      this._renderPrompt(v);
    }
  }

  _onKeyDown(e) {
    // Immediate visual feedback regardless of logic
    if (this.battle && this.battle.triggerImpact) {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
        this.battle.triggerImpact();
      }
    }

    // Audio Feedback
    if (e.key === ' ' || e.key === 'Enter') {
      this.sound.playSpace();
    } else if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      this.sound.playType();
    }


    if (e.key === ' ' || e.key === 'Enter') {
      if (this._matched) {
        e.preventDefault();
        this._submitSentence();
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
      // 스페이스: 미완성 시 일반 문자로 입력되도록 허용
    }
  }

  _updateLiveCPM(cpm) {
    const rounded = Math.round(cpm);
    this.liveCpmEl.textContent = `${rounded} 타/분`;
    this.liveCpmEl.className = rounded >= 400 ? 'fire' : rounded >= 300 ? 'hot' : '';
  }

  /** 문장 제출 — CPM 확정 + 정확도 + 공격 + 다음 문장 로딩 */
  _submitSentence() {
    const prompt = this.engine.currentPrompt;
    // 정확도: 제출된 텍스트와 프롬프트 비교 (글자 단위)
    const input = this.inputEl.value;
    for (let i = 0; i < prompt.length; i++) {
      this._totalKeystrokes++;
      if (input[i] === prompt[i]) this._correctKeystrokes++;
    }

    const result = this.engine.confirmComplete();
    this.visualizer.addBar(result.cpm);
    // CPM 기반 데미지로 공격
    this.battle.attackWithDamage(result.cpm);
    this._allCPMs.push(result.cpm);
    this._tierCPMs.push(result.cpm);
    this._matched = false;
    this.submitHint.classList.add('hidden');
    this.inputEl.value = '';

    // 250타 이상이면 EXCELLENT 이벤트!
    if (result.cpm >= this.EXCELLENT_THRESHOLD) {
      this._showExcellent();
    }

    if (this.engine.hasMorePrompts) {
      this._renderPrompt('');
      this._animatePrompt();
      this._updateProgress();
    } else {
      // 프롬프트 완료 → 스테이지 완료
      this._onStageComplete();
    }
  }


  /** 스테이지 클리어 → 기록 저장 + 피드백 표시 후 다음 스테이지 진행 */
  _onStageComplete() {
    const prevKey = this._sequence[this._seqIdx];
    const tierLabel = TIER_LABELS[prevKey] || prevKey;
    const tierAvg = this._tierCPMs.length
      ? Math.round(this._tierCPMs.reduce((a, b) => a + b, 0) / this._tierCPMs.length)
      : 0;
    const total = this._totalKeystrokes || 1;
    const acc = Math.floor((this._correctKeystrokes / total) * 100);
    const goal = TIER_TARGETS[prevKey] != null ? TIER_TARGETS[prevKey] : null;

    // 기록 저장
    const rec = this._saveStageRecord(prevKey, tierAvg, acc);

    // 타수별 피드백 메시지
    let feedback;
    if (tierAvg >= 400) feedback = '놀라운 속도!';
    else if (tierAvg >= 300) feedback = '훌륭해요!';
    else if (tierAvg >= 200) feedback = '좋은 실력!';
    else if (tierAvg >= 100) feedback = '괜찮아요!';
    else feedback = '조금만 더 힘내요!';

    // 이전 기록 + 피드백 토스트
    let toastMsg = `${tierLabel} 완료 — ${tierAvg} 타/분`;
    if (goal != null) {
      toastMsg += tierAvg >= goal ? ' ✓' : ` (목표 ${goal})`;
    }
    toastMsg += `\n${feedback}`;
    if (rec.attempts > 1) {
      toastMsg += `\n최고 ${rec.bestCPM} 타/분 · ${rec.attempts}회차`;
    }
    this._showToast(toastMsg, 2500);

    this._seqIdx++;
    this._tierCPMs = [];
    if (this._seqIdx >= this._totalTiers) {
      // 모든 스테이지 완료 → 결과 화면
      this._finishGame('clear');
      return;
    }

    // 다음 스테이지로 자동 진행 — 타이머 3분 리셋
    this._timeRemaining = this._timeLimit;
    this._lastFrameTime = performance.now();
    this.sound.playSuccess();
    this._triggerStageFlash('normal');
    this._loadTier();
    this._updateProgress();
    this._updateTierIndicator();
    this._updateTimerDisplay();
    this._renderPrompt('');
    this._animatePrompt();
    this.inputEl.value = '';
    this.inputEl.focus();
    requestAnimationFrame(() => this._gameLoop());
  }

  // ---- EXCELLENT 이벤트 ----
  _showExcellent() {
    this.sound.playExcellent();
    this.excellentFlash.classList.remove('hidden');
    // 텍스트 애니메이션 재시작
    const text = document.getElementById('excellent-text');
    text.style.animation = 'none';
    text.offsetHeight; // reflow
    text.style.animation = '';
    setTimeout(() => {
      this.excellentFlash.classList.add('hidden');
    }, 900);
  }

  // ---- 진행/결과 ----
  _updateProgress() {
    const stagePct = (this._timeLimit - this._timeRemaining) / this._timeLimit;
    const pct = Math.min(((this._seqIdx + stagePct) / this._totalTiers) * 100, 100);
    this.progressFill.style.width = pct + '%';
    this.progressFill.style.background = pct < 33 ? 'var(--accent-cyan)' : pct < 66 ? 'var(--accent-magenta)' : 'var(--accent-orange)';
  }

  _showResults() {
    this._gameActive = false;
    this.visualizer.stop();
    this.battle.stop();
    this.liveCpmEl.classList.add('hidden');
    this.introRenderer.start();

    this._showScreen('results');
    this.timerEl.classList.add('hidden');
    this.navLevels.classList.add('hidden');

    // Calc Stats
    const total = this._totalKeystrokes || 1;
    const acc = Math.floor((this._correctKeystrokes / total) * 100);
    const avgCPM = this._allCPMs.length
      ? Math.round(this._allCPMs.reduce((a, b) => a + b, 0) / this._allCPMs.length)
      : 0;
    const kills = this.battle ? this.battle.kills : 0;

    // 승급 판정: 평균 CPM 충족 시
    const canPromote = (this.currentLevel === 'beginner' && avgCPM >= 250)
      || (this.currentLevel === 'intermediate' && avgCPM >= 320);
    const hasNextLevel = this.currentLevel !== 'advanced';

    // Grade
    const grade = GradeSystem.getGrade(avgCPM);
    const content = document.getElementById('results-content');
    content.className = `grade-${grade.id}`;

    document.getElementById('grade-icon').textContent = grade.icon;
    document.getElementById('grade-name').textContent = grade.name;
    document.getElementById('grade-message').textContent = (canPromote && hasNextLevel)
      ? '축하합니다! 모든 과정을 완벽하게 수료했습니다.'
      : grade.message;

    // Battle Stats
    document.getElementById('result-kills').textContent = kills;
    document.getElementById('result-avg-cpm').textContent = avgCPM;
    document.getElementById('result-accuracy').textContent = acc + '%';

    // Promotion UI
    const promoAction = document.getElementById('promotion-action');
    const retryBtn = document.getElementById('retry-btn');

    // 처음으로 버튼
    document.getElementById('home-btn').onclick = () => {
      this._renderStartRecords();
      this._showScreen('start');
      this.introRenderer.start();
    };

    if (canPromote && hasNextLevel) {
      const nextLevel = this.currentLevel === 'beginner' ? 'intermediate' : 'advanced';
      const nextLabel = nextLevel === 'intermediate' ? '중급' : '고급';
      promoAction.classList.remove('hidden');
      promoAction.querySelector('.promo-text').textContent = `훌륭합니다! ${nextLabel} 도전 자격을 획득했습니다.`;
      document.getElementById('promote-btn').textContent = `${nextLabel} 도전하기`;

      document.getElementById('promote-btn').onclick = () => {
        this.currentLevel = nextLevel;
        this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === nextLevel));
        this.introRenderer.stop();
        this._startGame();
      };
    } else {
      promoAction.classList.add('hidden');
    }
    retryBtn.classList.remove('hidden');
  }
  _renderPrompt(v) {
    this.promptEl.textContent = '';
    const p = this.engine.currentPrompt;
    if (!p) return;
    const raw = (v !== undefined && v !== null) ? String(v) : (this.inputEl.value || '');
    const vClamp = raw.length > p.length ? raw.slice(0, p.length) : raw;
    const s = this.engine.getCharStates(vClamp);
    let h = '';
    for (let i = 0; i < p.length; i++) {
      const c = s[i] || 'pending';
      const ch = p[i] === ' ' ? '&nbsp;' : p[i].replace(/[&<>"']/g, x => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[x]));
      h += `<span class="char ${c}">${ch}</span>`;
    }
    this.promptEl.innerHTML = h;
  }

  _ambientLoop() {
    if (this._ambientId) cancelAnimationFrame(this._ambientId);
    const update = () => {
      if (this.screens.game.classList.contains('hidden')) return;
      const c = this._smoothedCPM;
      const vis = this.visualizer;
      const color = vis._color(c);
      const glow = vis._glow(c);
      if (c > 10) {
        const o = Math.min(0.8, c / 600);
        this.ambientEl.style.background = color;
        this.ambientEl.style.opacity = o;
        this.ambientEl.style.boxShadow = `0 0 ${12 + glow * 30}px ${color.replace('rgb', 'rgba').replace(')', `,${o * 0.6})`)}`;
      } else {
        this.ambientEl.style.background = 'transparent';
        this.ambientEl.style.boxShadow = 'none';
        this.ambientEl.style.opacity = 0;
      }
      if (c > 30) {
        this.inputEl.style.borderColor = color;
        this.inputEl.style.boxShadow = `0 0 ${6 + glow * 16}px ${color.replace('rgb', 'rgba').replace(')', ',0.15)')}`;
      } else {
        this.inputEl.style.borderColor = '';
        this.inputEl.style.boxShadow = '';
      }
      this._smoothedCPM *= 0.995;
      if (this._smoothedCPM < 1) this._smoothedCPM = 0;
      this._ambientId = requestAnimationFrame(update);
    };
    update();
  }

  _restartSession() {
    this.visualizer.stop(); this.visualizer.reset();
    this.battle.stop(); this.battle.reset();
    this.visualizer._resize(); this.battle._resize();
    this._sequence = [...LEVEL_SEQUENCES[this.currentLevel]];
    this._seqIdx = 0;
    this._totalTiers = this._sequence.length;
    this._allCPMs = [];
    this._tierCPMs = [];
    this._matched = false;
    this._totalKeystrokes = 0;
    this._correctKeystrokes = 0;
    this._sentenceInputCount = 0;
    this._loadTier();
    this.visualizer.start(); this.battle.start();
    this.inputEl.value = '';
    this._renderPrompt('');
    this._smoothedCPM = 0;
    this._updateProgress();
    this._updateTierIndicator();
    this.inputEl.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => new App());
