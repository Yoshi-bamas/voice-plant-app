/**
 * 粒子クラス（v1.3金色残像演出版）
 * Clear!エフェクトで使用する個別粒子の状態管理
 * サイズ・回転・奥行き・残像トレイル追加
 */
export class Particle {
    x: number;
    y: number;
    z: number;  // Z座標（奥行き、v1.3追加）
    vx: number;  // X方向速度
    vy: number;  // Y方向速度
    vz: number;  // Z方向速度（v1.3追加）
    life: number;  // 寿命（1.0で生成、0で消滅）
    color: [number, number, number];  // RGB色
    size: number;  // 粒子サイズ倍率（v1.3追加: 0.3-3.0）
    rotation: number;  // 回転角度（v1.3追加）
    rotationSpeed: number;  // 回転速度（v1.3追加）
    trail: Array<{x: number, y: number, z: number}>;  // 残像トレイル（過去位置記録、v1.3追加）
    maxTrailLength: number = 3;  // トレイル最大長（3フレーム分、最適化）

    /**
     * 粒子を生成
     * @param x - 初期X座標
     * @param y - 初期Y座標
     * @param speed - 初期速度
     * @param angle - 射出角度（ラジアン）
     * @param color - RGB色配列（デフォルト: 白）
     * @param size - サイズ倍率（デフォルト: 1.0）
     */
    constructor(
        x: number,
        y: number,
        speed: number,
        angle: number,
        color: [number, number, number] = [255, 255, 255],
        size: number = 1.0
    ) {
        this.x = x;
        this.y = y;
        this.z = 0;  // 初期Z座標
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.vz = (Math.random() - 0.5) * speed * 0.5;  // Z方向にも射出（±速度の25%）
        this.life = 1.0;
        this.color = color;
        this.size = size;
        this.rotation = Math.random() * Math.PI * 2;  // 初期回転角度（0-360度）
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;  // 回転速度（±0.1rad/frame）
        this.trail = [];  // 残像トレイル初期化
    }

    /**
     * 粒子の状態を更新（位置移動、重力適用、寿命減少、回転、トレイル記録）
     * v1.3: Z軸移動・回転・残像トレイル追加
     */
    update(): void {
        // 残像トレイル記録（現在位置を履歴に追加）
        this.trail.push({ x: this.x, y: this.y, z: this.z });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();  // 最古の履歴を削除
        }

        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;  // 奥行き移動
        this.vy += 0.3;  // 重力加速度（強化: 0.2→0.3）
        this.vx *= 0.96;  // 空気抵抗（強化: 0.98→0.96）
        this.vz *= 0.96;  // Z方向の空気抵抗
        this.rotation += this.rotationSpeed;  // 回転アニメーション
        this.life -= 0.012;  // 寿命減少（約83フレームで消滅、やや速く）
    }

    /**
     * 粒子が生存しているか
     * @returns 寿命が残っていればtrue
     */
    isAlive(): boolean {
        return this.life > 0;
    }
}
