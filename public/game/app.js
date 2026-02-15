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
    this._bindStartScreen();
  }

  /** 레벨별 구간당 문장 수 */
  getSessionSize() {
    return this.currentLevel === 'beginner' ? 15 : 10;
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
    this._loadTier();
    this._smoothedCPM = 0;
    this._showScreen('game');
    this.timerEl.classList.remove('hidden');
    this.navLevels.classList.remove('hidden');
    this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === this.currentLevel));

    // Timer Start
    this._timeRemaining = 180;
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
        this._finishGame('timeout');
      } else {
        // Warning Sounds at 2:00 (120s) and 1:00 (60s)
        if (prevTime > 120 && this._timeRemaining <= 120) this.sound.playWarning();
        if (prevTime > 60 && this._timeRemaining <= 60) this.sound.playWarning();
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
    else if (t <= 60) this.timerEl.classList.add('warn');
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

    // Removed length clamp to allow free typing (user feedback)
    // if (v.length > prompt.length) ...

    // 오타 추적: 마지막 글자가 맞는지 확인
    if (v.length > 0) {
      this._totalKeystrokes++;
      // Check last char input
      const lastChar = v[v.length - 1];
      const targetChar = prompt[v.length - 1];

      let isMismatch = false;
      if (lastChar !== targetChar) {
        // Handle Hangul Jamo Composition
        if (/[가-힣]/.test(targetChar) || /[ㄱ-ㅎㅏ-ㅣ]/.test(lastChar)) {
          const dTarget = targetChar.normalize('NFD');
          const dInput = lastChar.normalize('NFD');
          // If input is a prefix of target (e.g. 'ㅇ' of '안'), it's not an error yet
          if (!dTarget.startsWith(dInput)) {
            isMismatch = true;
          }
        } else {
          isMismatch = true;
        }
      }

      if (isMismatch) {
        // Error Sound for mismatch
        this.sound.playError();
      } else if (lastChar === targetChar) {
        this._correctKeystrokes++;
      }
    }

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

  /** 문장 제출 — CPM 확정 + 공격 + 다음 문장 로딩 */
  _submitSentence() {
    const result = this.engine.confirmComplete();
    this.visualizer.addBar(result.cpm);
    this.battle.attack();
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
      this._onStageComplete();
    }
  }

  /** 스테이지 클리어 시 평균 CPM으로 목표 달성 여부 판정 → 자동 다음 스테이지 / 재도전 / 다음 등급 */
  _onStageComplete() {
    const prevKey = this._sequence[this._seqIdx];
    const tierAvg = this._tierCPMs.length
      ? Math.round(this._tierCPMs.reduce((a, b) => a + b, 0) / this._tierCPMs.length)
      : 0;
    const goal = TIER_TARGETS[prevKey] != null ? TIER_TARGETS[prevKey] : null;

    // Retry Case (Failure) - Still doing toast/delay for failure to give pause? 
    // User emphasized "Stage Clear" not blocking. Failure might need a moment to reflect.
    // Keeping retry logic as is for now, or making it faster?
    // User said "Seamless Progression". If I fail, it breaks progression anyway.
    if (goal != null && tierAvg < goal) {
      this._showToast(`목표 미달 (평균 ${tierAvg} 타/분, 목표 ${goal} 타/분). 재도전!`, 2000, () => {
        this._loadTier();
        this._updateProgress();
        this._updateTierIndicator();
        this._renderPrompt('');
        this._animatePrompt();
        this.inputEl.value = '';
        this.inputEl.focus();
      });
      return;
    }

    this._seqIdx++;
    if (this._seqIdx < this._totalTiers) {
      // Seamless Next Stage
      this.sound.playSuccess();
      this._triggerStageFlash('normal');
      this._loadTier();
      this._updateProgress();
      this._updateTierIndicator();
      this._renderPrompt('');
      this._animatePrompt();
      this.inputEl.value = '';
      this.inputEl.focus();
      return;
    }

    // Beginner: Manual Promotion or Retry
    if (this.currentLevel === 'beginner') {
      // Target Met? (250 CPM)
      if (this._smoothedCPM >= 250) {
        this._showResults(true); // Show Manual Promotion
      } else {
        // Failed -> show results without promotion (just clear) or retry?
        // User didn't specify, but "retry" or "clear" is safe.
        // Let's show results so they can retry.
        this._finishGame('clear');
      }
      return;
    }

    if (this.currentLevel === 'intermediate') {
      this.currentLevel = 'advanced';
      this._sequence = [...LEVEL_SEQUENCES.advanced];
      this._seqIdx = 0;
      this._totalTiers = this._sequence.length;
      this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === 'advanced'));

      // Seamless Promotion
      this.sound.playSuccess();
      this._triggerStageFlash('promote');
      this._loadTier();
      this._updateProgress();
      this._updateTierIndicator();
      this._renderPrompt('');
      this._animatePrompt();
      this.inputEl.value = '';
      this.inputEl.focus();
      return;
    }
    // All clear? Just show results
    this._finishGame('clear');
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
    const sessionSize = this.getSessionSize();
    const done = this._seqIdx * sessionSize + this.engine.currentPromptIndex;
    const total = this._totalTiers * sessionSize;
    const pct = Math.min((done / total) * 100, 100);
    this.progressFill.style.width = pct + '%';
    this.progressFill.style.background = pct < 33 ? 'var(--accent-cyan)' : pct < 66 ? 'var(--accent-magenta)' : 'var(--accent-orange)';
  }

  _showResults(canPromote = false) {
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

    // Grade
    const grade = GradeSystem.getGrade(avgCPM);
    const content = document.getElementById('results-content');
    content.className = `grade-${grade.id}`;

    document.getElementById('grade-icon').textContent = grade.icon;
    document.getElementById('grade-name').textContent = grade.name;
    document.getElementById('grade-message').textContent = canPromote
      ? '축하합니다! 모든 과정을 완벽하게 수료했습니다.'
      : grade.message;

    // Battle Stats
    document.getElementById('result-kills').textContent = kills;
    document.getElementById('result-avg-cpm').textContent = avgCPM;
    document.getElementById('result-accuracy').textContent = acc;

    // Promotion UI
    const promoAction = document.getElementById('promotion-action');
    const retryBtn = document.getElementById('retry-btn');

    if (canPromote) {
      const nextLevel = this.currentLevel === 'beginner' ? 'intermediate' : 'advanced';
      const nextLabel = nextLevel === 'intermediate' ? '중급' : '고급';
      promoAction.classList.remove('hidden');
      promoAction.querySelector('.promo-text').textContent = `훌륭합니다! ${nextLabel} 도전 자격을 획득했습니다.`;
      document.getElementById('promote-btn').textContent = `${nextLabel} 도전하기`;
      retryBtn.classList.add('hidden');

      document.getElementById('promote-btn').onclick = () => {
        this.currentLevel = nextLevel;
        this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === nextLevel));
        this._startGame();
      };
    } else {
      promoAction.classList.add('hidden');
      retryBtn.classList.remove('hidden');
    }
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
