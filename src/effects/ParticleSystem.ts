import p5 from 'p5';
import { Particle } from './Particle';

/**
 * 粒子システムクラス
 * 複数の粒子を管理し、一括更新・描画を行う
 */
export class ParticleSystem {
    private particles: Particle[] = [];

    /**
     * 粒子を放射状に発射（Clear!エフェクト用）
     * @param x - 発射原点X座標
     * @param y - 発射原点Y座標
     * @param count - 粒子数（デフォルト: 100）
     * @param color - RGB色配列（デフォルト: ランダムな暖色系）
     */
    burst(
        x: number,
        y: number,
        count: number = 100,
        color?: [number, number, number]
    ): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;  // 0-360度のランダム角度
            const speed = Math.random() * 5 + 2;  // 2-7のランダム速度

            // 色指定がなければランダムな暖色系（赤・オレンジ・黄）
            const particleColor: [number, number, number] = color || [
                Math.random() * 100 + 155,  // R: 155-255
                Math.random() * 100 + 100,  // G: 100-200
                Math.random() * 50          // B: 0-50
            ];

            this.particles.push(new Particle(x, y, speed, angle, particleColor));
        }
    }

    /**
     * すべての粒子を更新し、寿命切れの粒子を削除
     */
    update(): void {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.isAlive());
    }

    /**
     * すべての粒子を描画
     * @param p - p5インスタンス
     */
    draw(p: p5): void {
        this.particles.forEach(particle => {
            const alpha = particle.life * 255;  // 寿命に応じた透明度
            p.fill(particle.color[0], particle.color[1], particle.color[2], alpha);
            p.noStroke();
            p.circle(particle.x, particle.y, 8);
        });
    }

    /**
     * 現在の粒子数を取得（デバッグ用）
     * @returns 生存粒子数
     */
    getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * すべての粒子をクリア
     */
    clear(): void {
        this.particles = [];
    }
}
