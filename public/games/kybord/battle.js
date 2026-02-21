/* ============================================
   KPSY Typing — BattleRenderer (졸라맨 배틀 시스템)
   ============================================ */

const MONSTER_TYPES = [
  { id: 'slime', name: '슬라임', maxHp: 3, color: '#44ff88', scale: 0.7, score: 30, shape: 'blob' },
  { id: 'bat', name: '박쥐', maxHp: 3, color: '#aa66ff', scale: 0.55, score: 35, shape: 'bat' },
  { id: 'goblin', name: '고블린', maxHp: 4, color: '#ff8844', scale: 0.85, score: 50, shape: 'stick' },
  { id: 'skeleton', name: '해골', maxHp: 4, color: '#cccccc', scale: 0.9, score: 60, shape: 'stick' },
  { id: 'orc', name: '오크', maxHp: 5, color: '#886622', scale: 1.1, score: 80, shape: 'stick' },
  { id: 'dragon', name: '드래곤', maxHp: 5, color: '#ff2244', scale: 1.2, score: 100, shape: 'dragon' }
];

const VIEW = {
  HERO_X: 0.32,
  HERO_Y: 0.82,
  MONSTER_X: 0.48,
  MONSTER_Y: 0.82,
  BASE_SCALE: 32
};

class BattleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.score = 0; this.kills = 0;
    this.currentCPM = 0;
    this.swordAngle = Math.PI * 0.45;
    this.targetSwordAngle = Math.PI * 0.45;
    this.monster = null;
    this.monsterQueue = [];
    this.effects = [];
    this.attackStart = 0; this.isAttacking = false; this.pendingDamage = false;
    this.heroOffsetX = 0;
    this._animId = null;
    this._time = 0;
    this.shakeTimer = 0; // Screen shake timer
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._fillQueue();
    this._spawnMonster();
  }

  triggerImpact() {
    // Immediate visual feedback on keypress
    this.shakeTimer = 0.15; // Shake for 150ms
    // Add spark particle
    const x = this.w * 0.32 + 40 + Math.random() * 20; // Near hero sword
    const y = this.h * 0.82 - 40 + Math.random() * 40;
    this.effects.push({
      type: 'spark',
      x: x, y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 0.3,
      color: '#fff'
    });
  }

  _resize() {
    const d = window.devicePixelRatio || 1;
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = r.width * d; this.canvas.height = r.height * d;
    this.ctx.scale(d, d); this.w = r.width; this.h = r.height;
  }

  updateCPM(cpm) {
    this.currentCPM = cpm;
    const t = Math.min(cpm / 500, 1);
    this.targetSwordAngle = Math.PI * 0.45 - t * Math.PI * 0.65;
  }

  attack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackStart = performance.now();
    this.pendingDamage = true;
  }

  _applyDamage() {
    if (!this.monster) return;
    this.monster.hp--;
    this.monster.flashTimer = 200;
    this.effects.push({ type: 'hit', x: this.monster.x, y: this.monster.y - 40, alpha: 1, timer: 400 });
    if (this.monster.hp <= 0) {
      const pts = this.monster.type.score;
      this.score += pts;
      this.kills++;
      this.effects.push({ type: 'score', x: this.monster.x, y: this.monster.y - 70, alpha: 1, timer: 800, text: `+${pts}`, vy: -1.2 });
      this.effects.push({ type: 'death', x: this.monster.x, y: this.monster.y, alpha: 1, timer: 500 });
      this.monster = null;
      setTimeout(() => this._spawnMonster(), 600);
    }
  }

  _fillQueue() {
    while (this.monsterQueue.length < 3) {
      this.monsterQueue.push(MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)]);
    }
  }

  _spawnMonster() {
    this._fillQueue();
    const type = this.monsterQueue.shift();
    this._fillQueue();
    this.monster = {
      type, hp: type.maxHp, maxHp: type.maxHp,
      x: this.w * 0.48, y: this.h * 0.82,
      flashTimer: 0, spawnTimer: 250
    };
  }

  _drawQueue(ctx, time) {
    const baseX = this.w * VIEW.MONSTER_X;
    const groundY = this.h * VIEW.MONSTER_Y;
    for (let i = 0; i < this.monsterQueue.length; i++) {
      const q = this.monsterQueue[i];
      const offsetX = (i + 1) * 50;
      const scale = 1 - (i + 1) * 0.18;
      const alpha = 0.4 - i * 0.12;
      const x = baseX + offsetX;
      const s = q.scale * VIEW.BASE_SCALE * scale;
      const bob = Math.sin(time * 2 + i) * 1;

      ctx.globalAlpha = Math.max(0.08, alpha);
      ctx.strokeStyle = q.color; ctx.fillStyle = q.color;
      ctx.lineWidth = 2; ctx.lineCap = 'round';

      if (q.shape === 'blob') {
        ctx.beginPath();
        ctx.ellipse(x, groundY - s * 0.4 + bob, s * 0.7, s * 0.5, 0, Math.PI, 0);
        ctx.lineTo(x + s * 0.7, groundY + bob);
        ctx.ellipse(x, groundY + bob, s * 0.7, s * 0.1, 0, 0, Math.PI);
        ctx.fill();
      } else {
        const hR = s * 0.3, hY = groundY - s * 2 + bob;
        ctx.beginPath(); ctx.arc(x, hY, hR, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, hY + hR); ctx.lineTo(x, groundY - s * 0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.3); ctx.lineTo(x - s * 0.3, groundY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.3); ctx.lineTo(x + s * 0.3, groundY); ctx.stroke();
        if (q.shape === 'dragon' || q.shape === 'bat') {
          const wf = Math.sin(time * 3 + i) * 0.2;
          ctx.beginPath(); ctx.moveTo(x - hR, hY + hR * 0.5);
          ctx.quadraticCurveTo(x - s * 1.2, hY - s * 0.5 + wf * s, x - s, hY + hR + s * 0.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + hR, hY + hR * 0.5);
          ctx.quadraticCurveTo(x + s * 1.2, hY - s * 0.5 - wf * s, x + s, hY + hR + s * 0.5); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  _drawHero(ctx, time) {
    const s = VIEW.BASE_SCALE; // Base Unit
    const baseX = this.w * VIEW.HERO_X + this.heroOffsetX;
    const groundY = this.h * VIEW.HERO_Y;
    const bob = Math.sin(time * 2) * (s * 0.05);

    const headR = s * 0.35, bodyLen = s, armLen = s * 0.6, legLen = s * 0.75;
    const headY = groundY - bodyLen - headR * 2 + bob;
    const shoulderY = headY + headR * 2 + (s * 0.06);
    const hipY = shoulderY + bodyLen - (s * 0.25);

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    const capeWave = Math.sin(time * 3) * (s * 0.12);
    ctx.fillStyle = 'rgba(0,180,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(baseX - s * 0.2, shoulderY);
    ctx.quadraticCurveTo(baseX - s * 0.6 + capeWave, hipY + s * 0.25, baseX - s * 0.4 + capeWave, hipY + legLen);
    ctx.lineTo(baseX + s * 0.06, hipY + s * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = s * 0.11;
    const stepAmount = s * 0.2;
    const stepLift = s * 0.1;
    let lFootX, lFootY, rFootX, rFootY;

    if (this.isAttacking) {
      const legBob = Math.sin(time * 3) * (s * 0.06);
      lFootX = baseX - s * 0.3 + legBob;
      lFootY = hipY + legLen;
      rFootX = baseX + s * 0.3 - legBob;
      rFootY = hipY + legLen;
    } else {
      const stepT = time * 1.6;
      const leftPhase = 0.5 + 0.5 * Math.sin(stepT);
      const rightPhase = 0.5 + 0.5 * Math.sin(stepT + Math.PI);
      lFootX = baseX - s * 0.3 + stepAmount * leftPhase;
      lFootY = hipY + legLen - stepLift * leftPhase;
      rFootX = baseX + s * 0.3 - stepAmount * rightPhase;
      rFootY = hipY + legLen - stepLift * rightPhase;
    }

    ctx.strokeStyle = '#6a7a8a';
    ctx.beginPath(); ctx.moveTo(baseX - 2, hipY); ctx.lineTo(lFootX, lFootY); ctx.stroke();
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(lFootX - 4, lFootY - 3, 10, 5);
    ctx.strokeStyle = '#6a7a8a';
    ctx.beginPath(); ctx.moveTo(baseX + 2, hipY); ctx.lineTo(rFootX, rFootY); ctx.stroke();
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(rFootX - 4, rFootY - 3, 10, 5);

    ctx.fillStyle = '#3a4a5a';
    ctx.beginPath();
    ctx.moveTo(baseX - 10, shoulderY);
    ctx.lineTo(baseX + 10, shoulderY);
    ctx.lineTo(baseX + 7, hipY);
    ctx.lineTo(baseX - 7, hipY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a7a9a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(baseX, shoulderY + 2); ctx.lineTo(baseX, hipY - 2); ctx.stroke();
    ctx.strokeStyle = '#5a7a9a';
    ctx.beginPath(); ctx.moveTo(baseX - 8, shoulderY + 6); ctx.lineTo(baseX + 8, shoulderY + 6); ctx.stroke();

    const lArmEndX = baseX - armLen * 0.65, lArmEndY = shoulderY + armLen * 0.55;
    ctx.strokeStyle = '#8a9aaa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(baseX - 8, shoulderY + 2); ctx.lineTo(lArmEndX, lArmEndY); ctx.stroke();
    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath();
    ctx.ellipse(lArmEndX - 2, lArmEndY, 7, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a8aba'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(lArmEndX - 2, lArmEndY, 7, 9, -0.2, 0, Math.PI * 2);
    ctx.stroke();

    const sa = this.swordAngle;
    const handX = baseX + 8 + Math.cos(sa) * armLen;
    const handY = shoulderY + 2 + Math.sin(sa) * armLen;
    ctx.strokeStyle = '#8a9aaa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(baseX + 8, shoulderY + 2); ctx.lineTo(handX, handY); ctx.stroke();

    const swordLen = 32 + Math.min(this.currentCPM / 25, 14);
    const hiltLen = 6;
    const hiltX = handX + Math.cos(sa) * hiltLen;
    const hiltY = handY + Math.sin(sa) * hiltLen;
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(hiltX, hiltY); ctx.stroke();
    const guardPerp = sa + Math.PI / 2;
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hiltX + Math.cos(guardPerp) * 5, hiltY + Math.sin(guardPerp) * 5);
    ctx.lineTo(hiltX - Math.cos(guardPerp) * 5, hiltY - Math.sin(guardPerp) * 5);
    ctx.stroke();
    const tipX = hiltX + Math.cos(sa) * swordLen;
    const tipY = hiltY + Math.sin(sa) * swordLen;
    const bladeW = 2;
    const perpX = Math.cos(sa + Math.PI / 2) * bladeW;
    const perpY = Math.sin(sa + Math.PI / 2) * bladeW;
    ctx.fillStyle = '#c0d0e0';
    ctx.beginPath();
    ctx.moveTo(hiltX + perpX, hiltY + perpY);
    ctx.lineTo(hiltX - perpX, hiltY - perpY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8f0ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hiltX, hiltY); ctx.lineTo(tipX, tipY); ctx.stroke();

    if (this.currentCPM > 100) {
      ctx.save();
      ctx.shadowColor = this.currentCPM > 500 ? '#ff6600' : '#00ccff';
      ctx.shadowBlur = Math.min(this.currentCPM / 30, 30);
      ctx.strokeStyle = `rgba(${this.currentCPM > 500 ? '255,120,0' : '0,200,255'},0.4)`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(hiltX, hiltY); ctx.lineTo(tipX, tipY); ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#4a5a6a';
    ctx.beginPath(); ctx.arc(baseX, headY, headR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6a8aaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(baseX, headY, headR, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(baseX - 7, headY - 1, 14, 3);
    ctx.strokeStyle = '#5a7a9a'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(baseX, headY - headR);
    ctx.lineTo(baseX, headY - headR - 6);
    ctx.stroke();
  }

  _drawMonster(ctx, time) {
    const m = this.monster;
    if (!m) return;
    const { type, hp, maxHp, flashTimer, spawnTimer } = m;
    const x = m.x, groundY = m.y;
    const s = type.scale * VIEW.BASE_SCALE;
    const bob = Math.sin(time * 2.5 + 1) * 2;
    const isFlash = flashTimer > 0;
    const color = isFlash ? '#ffffff' : type.color;

    let alpha = 1;
    if (spawnTimer > 0) alpha = 1 - spawnTimer / 300;

    ctx.globalAlpha = alpha;

    const hpW = s * 2.2, hpH = 4;
    const hpX = x - hpW / 2, hpY = groundY - s * 3 - 16;
    ctx.fillStyle = 'rgba(255,0,0,0.2)';
    ctx.fillRect(hpX, hpY, hpW, hpH);
    ctx.fillStyle = hp > maxHp * 0.5 ? '#44ff44' : hp > maxHp * 0.25 ? '#ffaa00' : '#ff2222';
    ctx.fillRect(hpX, hpY, hpW * (hp / maxHp), hpH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(type.name, x, hpY - 6);

    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round';

    if (type.shape === 'blob') {
      const squish = 1 + Math.sin(time * 4) * 0.08;
      ctx.beginPath();
      ctx.ellipse(x, groundY - s * 0.5 + bob, s * 0.9 * squish, s * 0.7 / squish, 0, Math.PI, 0);
      ctx.lineTo(x + s * 0.9 * squish, groundY + bob);
      ctx.ellipse(x, groundY + bob, s * 0.9 * squish, s * 0.15, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x - s * 0.25, groundY - s * 0.5 + bob, 3, 0, Math.PI * 2);
      ctx.arc(x + s * 0.25, groundY - s * 0.5 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.shape === 'bat') {
      const wingAngle = Math.sin(time * 8) * 0.4;
      const cy = groundY - s * 1.5 + bob;
      ctx.beginPath(); ctx.arc(x, cy, s * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - 4, cy - 2, 2, 0, Math.PI * 2); ctx.arc(x + 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - s * 0.35, cy);
      ctx.quadraticCurveTo(x - s * 1.2, cy - s + wingAngle * s, x - s * 1.4, cy + s * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.35, cy);
      ctx.quadraticCurveTo(x + s * 1.2, cy - s - wingAngle * s, x + s * 1.4, cy + s * 0.3); ctx.stroke();
    } else if (type.shape === 'dragon') {
      const headR = s * 0.4, headY = groundY - s * 2.5 + bob;
      ctx.beginPath(); ctx.arc(x, headY, headR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - headR * 0.5, headY - headR); ctx.lineTo(x - headR * 0.3, headY - headR * 1.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + headR * 0.5, headY - headR); ctx.lineTo(x + headR * 0.3, headY - headR * 1.8); ctx.stroke();
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(x - 5, headY - 3, 4, 4); ctx.fillRect(x + 2, headY - 3, 4, 4);
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(x, headY + headR); ctx.lineTo(x, groundY - s * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, headY + headR + s * 0.3); ctx.lineTo(x - s, headY + headR + s * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, headY + headR + s * 0.3); ctx.lineTo(x + s, headY + headR + s * 0.8); ctx.stroke();
      const wf = Math.sin(time * 3) * 0.3;
      ctx.beginPath(); ctx.moveTo(x - s * 0.3, headY + headR + s * 0.1);
      ctx.quadraticCurveTo(x - s * 1.8, headY - s + wf * s * 2, x - s * 1.5, headY + headR + s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.3, headY + headR + s * 0.1);
      ctx.quadraticCurveTo(x + s * 1.8, headY - s - wf * s * 2, x + s * 1.5, headY + headR + s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.5); ctx.lineTo(x - s * 0.5, groundY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.5); ctx.lineTo(x + s * 0.5, groundY); ctx.stroke();
    } else {
      const headR = s * 0.35, headY = groundY - s * 2.2 + bob;
      ctx.beginPath(); ctx.arc(x, headY, headR, 0, Math.PI * 2); ctx.stroke();
      if (type.id === 'skeleton') {
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 5, headY - 4); ctx.lineTo(x - 1, headY); ctx.moveTo(x - 1, headY - 4); ctx.lineTo(x - 5, headY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 1, headY - 4); ctx.lineTo(x + 5, headY); ctx.moveTo(x + 5, headY - 4); ctx.lineTo(x + 1, headY); ctx.stroke();
      } else {
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(x - 4, headY - 2, 2.5, 0, Math.PI * 2); ctx.arc(x + 4, headY - 2, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      if (type.id === 'goblin') {
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(x - headR, headY - headR * 0.3); ctx.lineTo(x - headR - 6, headY - headR * 1.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + headR, headY - headR * 0.3); ctx.lineTo(x + headR + 6, headY - headR * 1.3); ctx.stroke();
      }
      ctx.strokeStyle = color; ctx.lineWidth = type.id === 'orc' ? 4 : 2.5;
      ctx.beginPath(); ctx.moveTo(x, headY + headR); ctx.lineTo(x, groundY - s * 0.4); ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, headY + headR + s * 0.3); ctx.lineTo(x - s * 0.7, headY + headR + s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, headY + headR + s * 0.3); ctx.lineTo(x + s * 0.7, headY + headR + s); ctx.stroke();
      if (type.id === 'goblin') {
        ctx.strokeStyle = '#aaaaaa'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - s * 0.7, headY + headR + s);
        ctx.lineTo(x - s * 0.7 - 8, headY + headR + s - 18); ctx.stroke();
      }
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.4); ctx.lineTo(x - s * 0.45, groundY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, groundY - s * 0.4); ctx.lineTo(x + s * 0.45, groundY); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  _drawEffects(ctx) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.timer -= 16;
      if (e.timer <= 0) { this.effects.splice(i, 1); continue; }
      const a = e.timer / 800;

      if (e.type === 'hit') {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 3;
        const r = 20 * (1 - a) + 10;
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(angle) * r * 0.3, e.y + Math.sin(angle) * r * 0.3);
          ctx.lineTo(e.x + Math.cos(angle) * r, e.y + Math.sin(angle) * r);
          ctx.stroke();
        }
        ctx.restore();
      } else if (e.type === 'score') {
        e.y += e.vy;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.text, e.x, e.y);
        ctx.globalAlpha = 1;
      } else if (e.type === 'death') {
        ctx.globalAlpha = a * 0.6;
        const r = 30 * (1 - a + 0.3);
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2 + a * 2;
          ctx.fillStyle = this.monster ? this.monster.type.color : '#ff4444';
          ctx.beginPath();
          ctx.arc(e.x + Math.cos(angle) * r, e.y + Math.sin(angle) * r, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (e.type === 'spark') {
        e.x += e.vx; e.y += e.vy; e.life -= 0.016;
        if (e.life <= 0) { this.effects.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(e.life * 3, 1);
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, 3, 3);
        ctx.globalAlpha = 1;
      }
    }
  }

  _drawScore(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`⚔ ${this.kills}`, this.w - 20, 24);
    ctx.fillText(`🏆 ${this.score}`, this.w - 20, 42);
  }

  _drawGround(ctx) {
    const y = this.h * 0.82 + 14;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.w * 0.08, y); ctx.lineTo(this.w * 0.92, y); ctx.stroke();
  }

  _render() {
    const ctx = this.ctx;
    this._time = performance.now() / 1000;

    // Screen Shake Logic outside of clear rect to avoid trails
    let sx = 0, sy = 0;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= 0.016;
      const intensity = 4;
      sx = (Math.random() - 0.5) * intensity;
      sy = (Math.random() - 0.5) * intensity;
    }

    ctx.fillStyle = 'rgba(10,10,15,0.35)';
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.save();
    ctx.translate(sx, sy);

    this.swordAngle += (this.targetSwordAngle - this.swordAngle) * 0.1;

    if (this.isAttacking) {
      const elapsed = performance.now() - this.attackStart;
      const t = elapsed / 450;
      const dashDist = this.w * 0.08;
      if (t < 0.25) {
        this.heroOffsetX = dashDist * (t / 0.25);
        this.swordAngle = -Math.PI * 0.3;
      } else if (t < 0.45) {
        this.heroOffsetX = dashDist;
        this.swordAngle = Math.PI * 0.35 * ((t - 0.25) / 0.2);
        if (this.pendingDamage && t > 0.35) { this._applyDamage(); this.pendingDamage = false; }
      } else if (t < 1.0) {
        this.heroOffsetX = dashDist * (1 - (t - 0.45) / 0.55);
      } else {
        this.heroOffsetX = 0; this.isAttacking = false;
      }
    } else {
      this.heroOffsetX *= 0.9;
    }

    if (this.monster) {
      if (this.monster.flashTimer > 0) this.monster.flashTimer -= 16;
      if (this.monster.spawnTimer > 0) this.monster.spawnTimer -= 16;
      this.monster.x = this.w * VIEW.MONSTER_X; this.monster.y = this.h * VIEW.MONSTER_Y;
    }

    this._drawGround(ctx);
    this._drawQueue(ctx, this._time);
    this._drawHero(ctx, this._time);
    this._drawMonster(ctx, this._time);
    this._drawEffects(ctx);
    this._drawScore(ctx);

    ctx.restore();
    this._animId = requestAnimationFrame(() => this._render());
  }

  start() { if (!this._animId) this._render(); }
  stop() { if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; } }
  reset() { this.score = 0; this.kills = 0; this.effects = []; this.isAttacking = false; this.heroOffsetX = 0; this.monsterQueue = []; this._fillQueue(); this._spawnMonster(); }
}
