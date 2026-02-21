/* ============================================
   KPSY Typing — Core Engines
   ============================================ */

// [1] TypingEngine — 첫 타부터 마지막 키(스페이드 포함)까지 구간 CPM
class TypingEngine {
    constructor(prompts) {
        this.prompts = prompts;
        this.currentPromptIndex = 0;
        this.keystrokeTimestamps = [];
        this.ROLLING_WINDOW_SIZE = 5;
        this.completionCPMs = [];
        this.segmentStartTime = null; // 현재 문장 첫 입력 시각
    }
    get currentPrompt() { return this.prompts[this.currentPromptIndex] || ''; }
    get hasMorePrompts() { return this.currentPromptIndex < this.prompts.length; }

    processInput(inputValue) {
        const now = performance.now();
        const prompt = this.currentPrompt;
        if (inputValue.length > prompt.length) return { type: 'typing', cpm: this._rollingCPM() };

        if (inputValue.length === 0) {
            this.segmentStartTime = null;
            this.keystrokeTimestamps = [];
        } else {
            if (this.segmentStartTime === null) this.segmentStartTime = now;
            this.keystrokeTimestamps.push(now);
        }

        // 텍스트가 완전히 일치하면 'matched' 반환 (아직 채점 X)
        if (inputValue === prompt) {
            return { type: 'matched', cpm: this._rollingCPM() };
        }
        return { type: 'typing', cpm: this._rollingCPM() };
    }

    /** 스페이스/엔터 눌렀을 때 호출 — CPM 확정 + 다음 문장 */
    confirmComplete() {
        const now = performance.now();
        // If no start time (e.g. forced submit without typing), default to now
        const start = this.segmentStartTime || now;
        const keystrokes = this.keystrokeTimestamps.length;
        const elapsed = now - start;

        // Prevent divide by zero or NaN
        let cpm = 0;
        if (elapsed > 20 && keystrokes > 0) {
            cpm = Math.round((keystrokes * 60000) / elapsed);
        }

        this.completionCPMs.push(cpm);
        this.currentPromptIndex++;
        this.segmentStartTime = null;
        this.keystrokeTimestamps = [];
        return { type: 'complete', cpm };
    }

    _rollingCPM() {
        const ts = this.keystrokeTimestamps;
        if (ts.length < 2) return 0;
        const w = Math.min(this.ROLLING_WINDOW_SIZE, ts.length - 1);
        const recent = ts.slice(-(w + 1));
        let total = 0;
        for (let i = 1; i < recent.length; i++) total += recent[i] - recent[i - 1];
        const avg = total / w;
        return avg < 20 ? 3000 : Math.round(60000 / avg);
    }

    getCharStates(inputValue) {
        const p = this.currentPrompt;
        const v = inputValue.length > p.length ? inputValue.slice(0, p.length) : inputValue;
        const s = [];
        for (let i = 0; i < p.length; i++) {
            if (i < v.length) s.push(v[i] === p[i] ? 'correct' : 'incorrect');
            else if (i === v.length) s.push('current');
            else s.push('pending');
        }
        return s;
    }
    getAverageCPM() {
        if (!this.completionCPMs.length) return 0;
        return Math.round(this.completionCPMs.reduce((a, b) => a + b, 0) / this.completionCPMs.length);
    }
}

// [2] Visualizer (이퀄라이저)
class Visualizer {
    constructor(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.bars = []; this.MAX_BARS = 40; this.currentCPM = 0;
        this.particles = []; this.MAX_PARTICLES = 60; this._animId = null;
        this._resize(); window.addEventListener('resize', () => this._resize());
    }
    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const r = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = r.width * dpr; this.canvas.height = r.height * dpr;
        this.ctx.scale(dpr, dpr); this.w = r.width; this.h = r.height;
    }
    _hex(h) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 }; }
    _lerp(a, b, t) { t = Math.max(0, Math.min(1, t)); const A = this._hex(a), B = this._hex(b); return `rgb(${Math.round(A.r + (B.r - A.r) * t)},${Math.round(A.g + (B.g - A.g) * t)},${Math.round(A.b + (B.b - A.b) * t)})`; }
    /** 낮을수록 파랑, 높을수록 빨강 (타자수 = CPM) */
    _color(c) {
        if (c <= 0) return 'rgb(50,80,180)';
        const t = Math.min(c / 600, 1);
        return this._lerp('#2563eb', '#dc2626', t);
    }
    _glow(c) { return c < 800 ? 0 : c < 1000 ? (c - 800) / 200 * 0.5 : Math.min(1, 0.5 + (c - 1000) / 500 * 0.5); }
    /** 타자수(CPM) 낮을수록 짧은 막대+파랑, 높을수록 긴 막대+빨강 */
    addBar(cpm) {
        if (!Number.isFinite(cpm) || cpm < 0) cpm = 0;
        const maxH = this.h * 0.85, minH = 18;
        const n = Math.min(cpm / 600, 1);
        const e = 1 - Math.pow(1 - n, 1.8);
        const th = minH + e * (maxH - minH), bw = Math.max(14, this.w / (this.MAX_BARS + 5)), gap = 4;
        this.bars.forEach(b => { b.targetX -= bw + gap; });
        this.bars.push({ targetHeight: th, currentHeight: 0, color: this._color(cpm), cpm: Math.round(cpm), x: this.w - bw - 20, targetX: this.w - bw - 20, width: bw, alpha: 1 });
        if (this.bars.length > this.MAX_BARS) this.bars.shift();
    }
    updateCPM(c) { this.currentCPM = c; }
    _render() {
        const ctx = this.ctx, w = this.w, h = this.h;
        ctx.fillStyle = 'rgba(10,10,15,0.25)'; ctx.fillRect(0, 0, w, h);
        const bl = h - 16;
        // particles
        if (Math.random() < Math.min(this.currentCPM / 300, 1) * 0.4 && this.particles.length < this.MAX_PARTICLES)
            this.particles.push({ x: Math.random() * w, y: h + 10, vx: (Math.random() - 0.5) * 1.5, vy: -(1 + Math.random() * 2 + Math.min(this.currentCPM / 800, 1) * 3), r: 1 + Math.random() * 2.5, color: this._color(this.currentCPM), alpha: 0.3 + Math.random() * 0.5, life: 1 });
        for (let i = this.particles.length - 1; i >= 0; i--) { const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.008; p.alpha = Math.max(0, p.alpha * p.life); if (p.life <= 0 || p.y < -10) { this.particles.splice(i, 1); continue; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `,${p.alpha})`); ctx.fill(); }
        // bars (낮을수록 파랑/짧게, 높을수록 빨강/길게 + 막대 위에 타자수 표시)
        this.bars.forEach(bar => {
            bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.12;
            bar.x += (bar.targetX - bar.x) * 0.15;
            const bx = bar.x, bh = bar.currentHeight, by = bl - bh;
            const bc = this._color(bar.cpm);
            const g = ctx.createLinearGradient(bx, bl, bx, by);
            g.addColorStop(0, bc);
            g.addColorStop(1, bc.replace('rgb', 'rgba').replace(')', ',0.5)'));
            ctx.fillStyle = g;
            ctx.shadowColor = bc;
            ctx.shadowBlur = 6;
            this._rr(ctx, bx, by, bar.width, bh, 4);
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(bar.cpm), bx + bar.width / 2, Math.max(by - 2, 10));
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, bl); ctx.lineTo(w, bl); ctx.stroke();
        this._animId = requestAnimationFrame(() => this._render());
    }
    _rr(ctx, x, y, w, h, r) { if (h <= 0) return; r = Math.min(r, h / 2, w / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); }
    start() { if (!this._animId) this._render(); }
    stop() { if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; } }
    reset() { this.bars = []; this.particles = []; this.currentCPM = 0; this.ctx.clearRect(0, 0, this.w, this.h); }
}

// [3] IntroRenderer
class IntroRenderer {
    constructor(canvas) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.particles = []; this.orbs = []; this._animId = null;
        this._resize(); window.addEventListener('resize', () => this._resize()); this._initOrbs();
    }
    _resize() { const d = window.devicePixelRatio || 1, r = this.canvas.parentElement.getBoundingClientRect(); this.canvas.width = r.width * d; this.canvas.height = r.height * d; this.ctx.scale(d, d); this.w = r.width; this.h = r.height; }
    _initOrbs() { const c = ['rgba(0,255,255,0.08)', 'rgba(128,0,128,0.06)', 'rgba(255,0,255,0.05)']; for (let i = 0; i < 5; i++)this.orbs.push({ x: Math.random() * this.w, y: Math.random() * this.h, r: 80 + Math.random() * 160, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, color: c[i % 3] }); }
    start() { const render = () => { const ctx = this.ctx, w = this.w, h = this.h; ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, w, h); this.orbs.forEach(o => { o.x += o.vx; o.y += o.vy; if (o.x < -o.r) o.x = w + o.r; if (o.x > w + o.r) o.x = -o.r; if (o.y < -o.r) o.y = h + o.r; if (o.y > h + o.r) o.y = -o.r; const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r); g.addColorStop(0, o.color); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); }); if (this.particles.length < 80) this.particles.push({ x: Math.random() * w, y: h + 5, vy: -(0.2 + Math.random() * 0.8), vx: (Math.random() - 0.5) * 0.3, r: 0.5 + Math.random() * 1.5, alpha: 0.1 + Math.random() * 0.4, life: 1 }); for (let i = this.particles.length - 1; i >= 0; i--) { const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.002; if (p.life <= 0 || p.y < -10) { this.particles.splice(i, 1); continue; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,255,255,${p.alpha * p.life})`; ctx.fill(); } this._animId = requestAnimationFrame(render); }; render(); }
    stop() { if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; } }
}

// [4] GradeSystem
class GradeSystem {
    static GRADES = [
        { id: 'bronze', name: '입문자', icon: '🔰', minCPM: 0, message: '첫 발을 내딛었습니다.\n꾸준히 연습하면 성장합니다.' },
        { id: 'silver', name: '탐험가', icon: '⚡', minCPM: 250, message: '손가락이 길을 찾기 시작했습니다.' },
        { id: 'gold', name: '몰입의 달인', icon: '🔥', minCPM: 350, message: '몰입의 경지에 들어섰습니다.' },
        { id: 'platinum', name: '초월자', icon: '💎', minCPM: 450, message: '타자가 당신의 언어가 되었습니다.' },
        { id: 'diamond', name: '전설', icon: '✨', minCPM: 550, message: '당신은 빛 그 자체입니다.' }
    ];
    static getGrade(cpm) { let g = GradeSystem.GRADES[0]; for (const x of GradeSystem.GRADES) if (cpm >= x.minCPM) g = x; return g; }
}

// [5] SoundController — kybord.mp3 Web Audio Buffer 방식 (즉시 재생, 레이턴시 최소)
class SoundController {
    constructor() {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
        this.keyBuffer = null;   // kybord.mp3 디코딩 결과
        this._loadKeyBuffer('kybord.mp3');
    }

    /** fetch → decodeAudioData: 한 번만 디코딩 후 버퍼에 보관 */
    _loadKeyBuffer(src) {
        fetch(src)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.arrayBuffer();
            })
            .then(ab => this.ctx.decodeAudioData(ab))
            .then(buf => { this.keyBuffer = buf; })
            .catch(err => {
                console.warn('[Sound] kybord.mp3 로드 실패, 합성음 fallback:', err.message);
            });
    }

    resume() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    /** AudioBuffer → 즉시 재생 (pitch 변형 지원) */
    _playBuffer(buf, vol = 0.45, pitchRate = 1.0) {
        if (!this.enabled || !buf) return false;
        const src = this.ctx.createBufferSource();
        const g = this.ctx.createGain();
        src.buffer = buf;
        src.playbackRate.value = pitchRate;
        g.gain.value = vol;
        src.connect(g);
        g.connect(this.masterGain);
        src.start(this.ctx.currentTime);
        return true;
    }

    /** fallback: 합성음 (kybord.mp3 로드 전 또는 실패 시) */
    _synthClick(vol = 0.15, freq = 600, dur = 0.018) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(t);
        o.stop(t + dur);
    }

    /** 일반 키 — 키마다 미세한 피치 변화로 기계식 타건감 */
    playType() {
        const pitch = 0.95 + Math.random() * 0.12; // 0.95 ~ 1.07
        if (!this._playBuffer(this.keyBuffer, 0.45, pitch)) {
            this._synthClick(0.15, 600 + Math.random() * 200, 0.018);
        }
    }

    /** 스페이스/엔터 — 조금 더 낮고 묵직하게 */
    playSpace() {
        const pitch = 0.80 + Math.random() * 0.08; // 0.80 ~ 0.88
        if (!this._playBuffer(this.keyBuffer, 0.55, pitch)) {
            this._synthClick(0.18, 260, 0.028);
        }
    }

    playEnter() { this.playSpace(); }

    playError() {
        if (!this.enabled) return;
        this._synthClick(0.2, 180, 0.1);
    }

    playWarning() {
        if (!this.enabled) return;
        this._synthClick(0.6, 880, 0.1);
        setTimeout(() => this._synthClick(0.6, 880, 0.1), 160);
    }

    playSuccess() {
        if (!this.enabled) return;
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, i) => setTimeout(() => this._synthClick(0.4, f, 0.35), i * 90));
    }

    playExcellent() {
        if (!this.enabled) return;
        this._synthClick(0.3, 1100, 0.1);
        setTimeout(() => this._synthClick(0.3, 2200, 0.15), 60);
    }
}
