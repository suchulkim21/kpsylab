/* ============================================
   KPSY Typing — App
   data.js / core.js / battle.js 의존
   ============================================ */

class App {
  constructor() {
    this.EXCELLENT_THRESHOLD = 250;

    // 화면 참조
    this.screens = {
      start:   document.getElementById('start-screen'),
      game:    document.getElementById('game-screen'),
      results: document.getElementById('results-screen')
    };

    // DOM 참조
    this.inputEl        = document.getElementById('typing-input');
    this.promptEl       = document.getElementById('prompt-text');
    this.ambientEl      = document.getElementById('ambient-border');
    this.eqCanvas       = document.getElementById('equalizer-canvas');
    this.battleCanvas   = document.getElementById('battle-canvas');
    this.navLevels      = document.getElementById('nav-levels');
    this.levelBtns      = document.querySelectorAll('.level-btn');   // ← #navbar 안에 있음
    this.progressFill   = document.getElementById('progress-fill');
    this.tierIndicator  = document.getElementById('tier-indicator');
    this.submitHint     = document.getElementById('submit-hint');
    this.liveCpmEl      = document.getElementById('live-cpm');
    this.excellentFlash = document.getElementById('excellent-flash');
    this.stagePanelEl   = document.getElementById('stage-next-panel');

    // 게임 상태
    this.currentLevel        = 'beginner';
    this._selectedStage      = 'all';
    this._matched            = false;
    this._totalKeystrokes    = 0;
    this._correctKeystrokes  = 0;
    this._sentenceInputCount = 0;
    this._tierCPMs           = [];
    this._allCPMs            = [];
    this._smoothedCPM        = 0;
    this._gameActive         = false;
    this._ambientId          = null;

    // 렌더러 / 사운드
    this.introRenderer = new IntroRenderer(document.getElementById('intro-canvas'));
    this.introRenderer.start();
    this.sound = new SoundController();

    // 유저 ID + 기록
    this._userId  = this._getOrCreateUserId();
    this._records = this._loadRecords();
    document.getElementById('user-id-display').textContent = `ID: ${this._userId}`;

    this._bindStartScreen();
    this._renderStartRecords();
  }

  // ── 유저 ID / 기록 ──────────────────────────────────────
  _getOrCreateUserId() {
    let id = localStorage.getItem('kpsy_typing_user_id');
    if (!id) {
      id = 'KT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
      localStorage.setItem('kpsy_typing_user_id', id);
    }
    return id;
  }

  _loadRecords() {
    try { return JSON.parse(localStorage.getItem('kpsy_typing_records') || '{}'); }
    catch { return {}; }
  }

  _saveStageRecord(stageKey, avgCPM, accuracy) {
    const prev = this._records[stageKey];
    const rec = {
      bestCPM:  prev ? Math.max(prev.bestCPM, avgCPM) : avgCPM,
      lastCPM:  avgCPM,
      bestAcc:  prev ? Math.max(prev.bestAcc, accuracy) : accuracy,
      lastAcc:  accuracy,
      attempts: (prev?.attempts || 0) + 1,
      date:     new Date().toLocaleDateString('ko-KR')
    };
    this._records[stageKey] = rec;
    localStorage.setItem('kpsy_typing_records', JSON.stringify(this._records));
    return rec;
  }

  _renderStartRecords() {
    const el = document.getElementById('start-records');
    const stages = ['b1', 'b2', 'b3', 'b4', 'm1', 'm2', 'adv'];
    const hasAny = stages.some(k => this._records[k]);
    if (!hasAny) { el.classList.add('hidden'); return; }

    el.classList.remove('hidden');
    let html = '<p class="records-title">이전 기록</p><div class="records-grid">';
    for (const k of stages) {
      const r = this._records[k];
      if (!r) continue;
      html += `<div class="record-card">
        <span class="record-stage">${TIER_LABELS[k] || k}</span>
        <span class="record-best">${r.bestCPM} <small>타/분</small></span>
        <span class="record-acc">${r.bestAcc}%</span>
        <span class="record-tries">${r.attempts}회</span>
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  }

  getSessionSize() {
    return this.currentLevel === 'beginner' ? 50 : 30;
  }

  // ── 화면 전환 ────────────────────────────────────────────
  _showScreen(n) {
    Object.values(this.screens).forEach(s => s.classList.add('hidden'));
    this.screens[n].classList.remove('hidden');
  }

  // ── 시작 화면 ────────────────────────────────────────────
  _bindStartScreen() {
    const levelBtns = document.querySelectorAll('.start-level-btn');
    const stagesEl  = document.getElementById('start-stages');
    const stageBtns = document.querySelectorAll('.start-stage-btn');

    levelBtns.forEach(b => b.addEventListener('click', () => {
      levelBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.currentLevel = b.dataset.level;
      stagesEl.classList.toggle('hidden', b.dataset.level !== 'beginner');
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
    document.getElementById('nav-logo').addEventListener('click', () => this._goHome());
  }

  _goHome() {
    this._gameActive = false;
    if (this._ambientId) { cancelAnimationFrame(this._ambientId); this._ambientId = null; }
    if (this.visualizer) { this.visualizer.stop(); this.visualizer.reset(); }
    if (this.battle)     { this.battle.stop();     this.battle.reset(); }
    this.stagePanelEl.classList.add('hidden');
    this.liveCpmEl.classList.add('hidden');
    this.navLevels.classList.add('hidden');
    this._renderStartRecords();
    this._showScreen('start');
    this.introRenderer.start();
  }

  // ── 게임 세션 초기화 (startGame / restartSession 공통) ──
  _resetState() {
    this._sequence    = (this.currentLevel === 'beginner' && this._selectedStage !== 'all')
      ? [this._selectedStage]
      : [...LEVEL_SEQUENCES[this.currentLevel]];
    this._seqIdx           = 0;
    this._totalTiers       = this._sequence.length;
    this._allCPMs          = [];
    this._tierCPMs         = [];
    this._matched          = false;
    this._totalKeystrokes  = 0;
    this._correctKeystrokes = 0;
    this._sentenceInputCount = 0;
    this._smoothedCPM      = 0;
  }

  _startGame() {
    this._resetState();
    this._loadTier();
    this._showScreen('game');
    this.navLevels.classList.remove('hidden');
    this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === this.currentLevel));
    this._gameActive = true;

    requestAnimationFrame(() => {
      this.visualizer = new Visualizer(this.eqCanvas);
      this.battle     = new BattleRenderer(this.battleCanvas);
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
    });
  }

  // ── 스테이지 로드 ─────────────────────────────────────────
  _loadTier() {
    const pool = [...TYPING_DATA[this._sequence[this._seqIdx]]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.prompts = pool.slice(0, this.getSessionSize());
    this.engine  = new TypingEngine(this.prompts);
    this.inputEl.value = '';
    this.promptEl.textContent = '';
    this._matched = false;
    this._tierCPMs = [];
    this.submitHint.classList.add('hidden');
  }

  // ── 애니메이션 유틸 ──────────────────────────────────────
  _animatePrompt() {
    this.promptEl.classList.remove('slide-in');
    void this.promptEl.offsetWidth;
    this.promptEl.classList.add('slide-in');
  }

  _triggerStageFlash(type) {
    const el = Object.assign(document.createElement('div'), { className: `flash-${type}` });
    el.style.cssText = 'position:absolute;inset:0;z-index:200;pointer-events:none';
    document.getElementById('app').appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // ── 표시 갱신 ────────────────────────────────────────────
  _updateTierIndicator() {
    const key = this._sequence[this._seqIdx];
    this.tierIndicator.textContent = `[ ${TIER_LABELS[key] || key} ] ${this._seqIdx + 1} / ${this._totalTiers}`;
  }

  _updateProgress() {
    const sentIdx   = this.engine?.currentPromptIndex || 0;
    const sentTotal = this.prompts?.length || 1;
    const pct = Math.min(((this._seqIdx + sentIdx / sentTotal) / this._totalTiers) * 100, 100);
    this.progressFill.style.width      = pct + '%';
    this.progressFill.style.background = pct < 33
      ? 'var(--accent-cyan)' : pct < 66
      ? 'var(--accent-magenta)' : 'var(--accent-orange)';
  }

  _updateLiveCPM(cpm) {
    const r = Math.round(cpm);
    this.liveCpmEl.textContent = `${r} 타/분`;
    this.liveCpmEl.className   = r >= 400 ? 'fire' : r >= 300 ? 'hot' : '';
  }

  // ── 이벤트 바인딩 ────────────────────────────────────────
  _bindGameEvents() {
    if (this._boundInput) {
      this.inputEl.removeEventListener('input', this._boundInput);
      this.inputEl.removeEventListener('keydown', this._boundKey);
    }
    this._boundInput = () => this._onInput();
    this._boundKey   = e => this._onKeyDown(e);
    this.inputEl.addEventListener('input', this._boundInput);
    this.inputEl.addEventListener('keydown', this._boundKey);

    this.levelBtns.forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const l = btn.dataset.level;
        if (l === this.currentLevel) return;
        this.levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLevel   = l;
        this._selectedStage = 'all';
        this._restartSession();
      };
    });
    document.onclick = () => this.inputEl.focus();
  }

  _onInput() {
    if (this._matched) return;

    const prompt = this.engine.currentPrompt;
    let v = this.inputEl.value;
    if (v.length > prompt.length) {
      v = v.slice(0, prompt.length);
      this.inputEl.value = v;
    }

    this._sentenceInputCount++;
    const r = this.engine.processInput(v);
    this.visualizer.updateCPM(r.cpm);
    this.battle.updateCPM(r.cpm);
    this._smoothedCPM += (r.cpm - this._smoothedCPM) * 0.3;
    this._updateLiveCPM(r.cpm);

    this._matched = r.type === 'matched';
    this.submitHint.classList.toggle('hidden', !this._matched);
    this._renderPrompt(v);
  }

  _onKeyDown(e) {
    if (this.battle?.triggerImpact && !['Shift','Control','Alt','Meta'].includes(e.key)) {
      this.battle.triggerImpact();
    }
    if (e.key === ' ' || e.key === 'Enter') {
      this.sound.playSpace();
      if (this._matched) {
        e.preventDefault();
        this._submitSentence();
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    } else if (!['Shift','Control','Alt','Meta','CapsLock','Tab'].includes(e.key)) {
      this.sound.playType();
    }
  }

  // ── 문장 제출 ─────────────────────────────────────────────
  _submitSentence() {
    this._totalKeystrokes    += this._sentenceInputCount;
    this._correctKeystrokes  += this.engine.currentPrompt.length;

    const result = this.engine.confirmComplete();
    this.visualizer.addBar(result.cpm);
    this.battle.attack();
    this._allCPMs.push(result.cpm);
    this._tierCPMs.push(result.cpm);
    this._matched            = false;
    this._sentenceInputCount = 0;
    this.submitHint.classList.add('hidden');
    this.inputEl.value = '';

    if (result.cpm >= this.EXCELLENT_THRESHOLD) this._showExcellent();

    if (this.engine.hasMorePrompts) {
      this._renderPrompt('');
      this._animatePrompt();
      this._updateProgress();
    } else {
      this._onStageComplete();
    }
  }

  // ── 스테이지 완료 ─────────────────────────────────────────
  _onStageComplete() {
    const prevKey   = this._sequence[this._seqIdx];
    const tierLabel = TIER_LABELS[prevKey] || prevKey;
    const tierAvg   = this._tierCPMs.length
      ? Math.round(this._tierCPMs.reduce((a, b) => a + b, 0) / this._tierCPMs.length)
      : 0;
    const acc = Math.floor((this._correctKeystrokes / (this._totalKeystrokes || 1)) * 100);

    this._saveStageRecord(prevKey, tierAvg, acc);
    this._seqIdx++;
    this._tierCPMs = [];

    if (this._seqIdx >= this._totalTiers) {
      this._finishGame();
      return;
    }

    // 다음 단계 패널 표시
    const nextKey = this._sequence[this._seqIdx];
    const ICONS   = { b1:'🔤', b2:'📝', b3:'💬', b4:'📖', m1:'⚡', m2:'🔥', adv:'💎' };
    document.getElementById('snp-done-icon').textContent  = ICONS[prevKey] || '✓';
    document.getElementById('snp-done-label').textContent = tierLabel;
    document.getElementById('snp-next-icon').textContent  = ICONS[nextKey] || '▶';
    document.getElementById('snp-next-label').textContent = TIER_LABELS[nextKey] || nextKey;
    this.stagePanelEl.classList.remove('hidden');
    this.sound.playSuccess();

    setTimeout(() => {
      if (!this._gameActive) return;
      this.stagePanelEl.classList.add('hidden');
      this._triggerStageFlash('normal');
      this._loadTier();
      this._updateProgress();
      this._updateTierIndicator();
      this._renderPrompt('');
      this._animatePrompt();
      this.inputEl.value = '';
      this.inputEl.focus();
    }, 1800);
  }

  // ── EXCELLENT ────────────────────────────────────────────
  _showExcellent() {
    this.sound.playExcellent();
    this.excellentFlash.classList.remove('hidden');
    const text = document.getElementById('excellent-text');
    text.style.animation = 'none';
    text.offsetHeight;
    text.style.animation = '';
    setTimeout(() => this.excellentFlash.classList.add('hidden'), 900);
  }

  // ── 게임 종료 ─────────────────────────────────────────────
  _finishGame() {
    this._gameActive = false;
    this.stagePanelEl.classList.add('hidden');
    this._showResults();
  }

  // ── 결과 화면 ─────────────────────────────────────────────
  _showResults() {
    this.visualizer.stop();
    this.battle.stop();
    this.liveCpmEl.classList.add('hidden');
    this.navLevels.classList.add('hidden');
    this.introRenderer.start();
    this._showScreen('results');

    const acc    = Math.floor((this._correctKeystrokes / (this._totalKeystrokes || 1)) * 100);
    const avgCPM = this._allCPMs.length
      ? Math.round(this._allCPMs.reduce((a, b) => a + b, 0) / this._allCPMs.length)
      : 0;
    const kills  = this.battle?.kills || 0;

    const canPromote  = (this.currentLevel === 'beginner' && avgCPM >= 250)
                     || (this.currentLevel === 'intermediate' && avgCPM >= 320);
    const hasNextLevel = this.currentLevel !== 'advanced';

    const grade   = GradeSystem.getGrade(avgCPM);
    const content = document.getElementById('results-content');
    content.className = `grade-${grade.id}`;

    document.getElementById('grade-icon').textContent    = grade.icon;
    document.getElementById('grade-name').textContent    = grade.name;
    document.getElementById('grade-message').textContent = (canPromote && hasNextLevel)
      ? '축하합니다! 모든 과정을 완벽하게 수료했습니다.'
      : grade.message;

    document.getElementById('result-kills').textContent    = kills;
    document.getElementById('result-avg-cpm').textContent  = avgCPM;
    document.getElementById('result-accuracy').textContent = acc + '%';

    // 처음으로 버튼
    document.getElementById('home-btn').onclick = () => {
      this._renderStartRecords();
      this._showScreen('start');
      this.introRenderer.start();
    };

    // 단계 경로 아이콘 (gold 이상 + 다음 등급 존재 시)
    const gradeIdx = GradeSystem.GRADES.findIndex(g => g.id === grade.id);
    const LEVEL_META = {
      beginner:     { icon:'🔥', label:'초급', nextIcon:'⚡', nextLabel:'중급' },
      intermediate: { icon:'💎', label:'중급', nextIcon:'✨', nextLabel:'고급' }
    };
    const meta = LEVEL_META[this.currentLevel];
    const stagePath = document.getElementById('stage-path');
    if (gradeIdx >= 2 && meta) {
      document.getElementById('stage-path-cur-icon').textContent   = meta.icon;
      document.getElementById('stage-path-cur-label').textContent  = meta.label;
      document.getElementById('stage-path-next-icon').textContent  = meta.nextIcon;
      document.getElementById('stage-path-next-label').textContent = meta.nextLabel;
      stagePath.classList.remove('hidden');
    } else {
      stagePath.classList.add('hidden');
    }

    // 승급 버튼
    const promoAction = document.getElementById('promotion-action');
    if (canPromote && hasNextLevel) {
      const nextLevel = this.currentLevel === 'beginner' ? 'intermediate' : 'advanced';
      const nextLabel = nextLevel === 'intermediate' ? '중급' : '고급';
      promoAction.classList.remove('hidden');
      promoAction.querySelector('.promo-text').textContent      = `훌륭합니다! ${nextLabel} 도전 자격을 획득했습니다.`;
      document.getElementById('promote-btn').textContent        = `${nextLabel} 도전하기`;
      document.getElementById('promote-btn').onclick = () => {
        this.currentLevel = nextLevel;
        this.levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === nextLevel));
        this.introRenderer.stop();
        this._startGame();
      };
    } else {
      promoAction.classList.add('hidden');
    }

    document.getElementById('retry-btn').classList.remove('hidden');
  }

  // ── 프롬프트 렌더 ─────────────────────────────────────────
  _renderPrompt(v) {
    this.promptEl.textContent = '';
    const p = this.engine.currentPrompt;
    if (!p) return;
    const raw    = v != null ? String(v) : (this.inputEl.value || '');
    const vClamp = raw.length > p.length ? raw.slice(0, p.length) : raw;
    const s = this.engine.getCharStates(vClamp);
    const ESC = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' };
    let h = '';
    for (let i = 0; i < p.length; i++) {
      const ch = p[i] === ' ' ? '&nbsp;' : (ESC[p[i]] || p[i]);
      h += `<span class="char ${s[i] || 'pending'}">${ch}</span>`;
    }
    this.promptEl.innerHTML = h;
  }

  // ── 앰비언트 루프 ─────────────────────────────────────────
  _ambientLoop() {
    if (this._ambientId) cancelAnimationFrame(this._ambientId);
    const update = () => {
      if (!this._gameActive) { this._ambientId = null; return; }
      const c     = this._smoothedCPM;
      const color = this.visualizer._color(c);
      const glow  = this.visualizer._glow(c);
      if (c > 10) {
        const o = Math.min(0.8, c / 600);
        this.ambientEl.style.background  = color;
        this.ambientEl.style.opacity     = o;
        this.ambientEl.style.boxShadow   = `0 0 ${12 + glow * 30}px ${color.replace('rgb','rgba').replace(')',`,${o * 0.6})`)}`;
      } else {
        this.ambientEl.style.background  = 'transparent';
        this.ambientEl.style.boxShadow   = 'none';
        this.ambientEl.style.opacity     = 0;
      }
      if (c > 30) {
        this.inputEl.style.borderColor = color;
        this.inputEl.style.boxShadow   = `0 0 ${6 + glow * 16}px ${color.replace('rgb','rgba').replace(')',',0.15)')}`;
      } else {
        this.inputEl.style.borderColor = '';
        this.inputEl.style.boxShadow   = '';
      }
      this._smoothedCPM *= 0.995;
      if (this._smoothedCPM < 1) this._smoothedCPM = 0;
      this._ambientId = requestAnimationFrame(update);
    };
    update();
  }

  // ── 게임 중 레벨 전환 ─────────────────────────────────────
  _restartSession() {
    if (this.visualizer) { this.visualizer.stop(); this.visualizer.reset(); this.visualizer._resize(); }
    if (this.battle)     { this.battle.stop();     this.battle.reset();     this.battle._resize(); }
    this.stagePanelEl.classList.add('hidden');
    this._resetState();
    this._loadTier();
    if (this.visualizer) this.visualizer.start();
    if (this.battle)     this.battle.start();
    this.inputEl.value = '';
    this._renderPrompt('');
    this._updateProgress();
    this._updateTierIndicator();
    this.inputEl.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => new App());
