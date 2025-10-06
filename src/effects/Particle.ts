/**
 * 粒子クラス
 * Clear!エフェクトで使用する個別粒子の状態管理
 */
export class Particle {
    x: number;
    y: number;
    vx: number;  // X方向速度
    vy: number;  // Y方向速度
    life: number;  // 寿命（1.0で生成、0で消滅）
    color: [number, number, number];  // RGB色

    /**
     * 粒子を生成
     * @param x - 初期X座標
     * @param y - 初期Y座標
     * @param speed - 初期速度
     * @param angle - 射出角度（ラジアン）
     * @param color - RGB色配列（デフォルト: 白）
     */
    constructor(
        x: number,
        y: number,
        speed: number,
        angle: number,
        color: [number, number, number] = [255, 255, 255]
    ) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.color = color;
    }

    /**
     * 粒子の状態を更新（位置移動、重力適用、寿命減少）
     */
    update(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;  // 重力加速度
        this.vx *= 0.98;  // 空気抵抗（水平方向）
        this.life -= 0.01;  // 寿命減少（100フレームで消滅）
    }

    /**
     * 粒子が生存しているか
     * @returns 寿命が残っていればtrue
     */
    isAlive(): boolean {
        return this.life > 0;
    }
}
