import p5 from 'p5';
import { Particle } from './Particle';

/**
 * 粒子システムクラス（v1.0.5最適化版）
 * 複数の粒子を管理し、一括更新・描画を行う
 * createGraphics()事前レンダリングで2-3倍高速化
 */
export class ParticleSystem {
    private particles: Particle[] = [];
    private particleGraphicInner: p5.Graphics | null = null;  // 内側円テンプレート
    private particleGraphicOuter: p5.Graphics | null = null;  // 外側円テンプレート（グロー）

    /**
     * 粒子を放射状に発射（Clear!エフェクト用）
     * @param x - 発射原点X座標
     * @param y - 発射原点Y座標
     * @param count - 粒子数（デフォルト: 300、v1.0.5最適化で増量）
     * @param color - RGB色配列（デフォルト: ランダムな暖色系）
     */
    burst(
        x: number,
        y: number,
        count: number = 300,
        color?: [number, number, number]
    ): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;  // 0-360度のランダム角度
            const speed = Math.random() * 8 + 3;  // 3-11のランダム速度（強化: 2-7→3-11）

            // 色指定がなければランダムな暖色系（赤・オレンジ・黄・ピンク）
            const particleColor: [number, number, number] = color || this.generateFlowerColor();

            this.particles.push(new Particle(x, y, speed, angle, particleColor));
        }
    }

    /**
     * 花のような色彩を生成（赤・ピンク・オレンジ・黄・白のバリエーション）
     */
    private generateFlowerColor(): [number, number, number] {
        const colorType = Math.random();

        if (colorType < 0.3) {
            // 赤・ピンク系
            return [
                Math.random() * 55 + 200,  // R: 200-255
                Math.random() * 100 + 50,  // G: 50-150
                Math.random() * 100 + 100  // B: 100-200（ピンク寄り）
            ];
        } else if (colorType < 0.6) {
            // オレンジ・黄色系
            return [
                Math.random() * 55 + 200,  // R: 200-255
                Math.random() * 100 + 120, // G: 120-220
                Math.random() * 50         // B: 0-50
            ];
        } else {
            // 白・薄黄色系
            return [
                Math.random() * 30 + 225,  // R: 225-255
                Math.random() * 30 + 225,  // G: 225-255
                Math.random() * 50 + 180   // B: 180-230
            ];
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
     * すべての粒子を描画（v1.0.5最適化版）
     * createGraphics()で事前レンダリングしたテンプレートをimage()で使い回し
     * @param p - p5インスタンス
     */
    draw(p: p5): void {
        // 初回のみ: 粒子テンプレート作成（最大サイズで作成）
        if (!this.particleGraphicInner || !this.particleGraphicOuter) {
            this.createParticleTemplates(p);
        }

        // 高速描画: image()で使い回し（circle()より2-3倍速）
        this.particles.forEach(particle => {
            const alpha = particle.life * 255;  // 寿命に応じた透明度
            const size = particle.life * 12 + 4;  // 4-16px

            // 外側（グロー）
            p.tint(particle.color[0], particle.color[1], particle.color[2], alpha * 0.3);
            p.image(
                this.particleGraphicOuter!,
                particle.x - size * 0.9,
                particle.y - size * 0.9,
                size * 1.8,
                size * 1.8
            );

            // 内側（実体）
            p.tint(particle.color[0], particle.color[1], particle.color[2], alpha);
            p.image(
                this.particleGraphicInner!,
                particle.x - size / 2,
                particle.y - size / 2,
                size,
                size
            );
        });

        // tintをリセット（他の描画に影響しないように）
        p.noTint();
    }

    /**
     * 粒子テンプレートを事前作成（初回のみ実行）
     * @param p - p5インスタンス
     */
    private createParticleTemplates(p: p5): void {
        const templateSize = 20;  // テンプレートサイズ（最大粒子サイズ）

        // 内側円テンプレート
        this.particleGraphicInner = p.createGraphics(templateSize, templateSize);
        this.particleGraphicInner.fill(255);
        this.particleGraphicInner.noStroke();
        this.particleGraphicInner.circle(templateSize / 2, templateSize / 2, templateSize);

        // 外側円テンプレート（グロー用、少し大きめ）
        this.particleGraphicOuter = p.createGraphics(templateSize * 2, templateSize * 2);
        this.particleGraphicOuter.fill(255);
        this.particleGraphicOuter.noStroke();
        this.particleGraphicOuter.circle(templateSize, templateSize, templateSize * 2);
    }

    /**
     * v1.0改: 花びら降下エフェクト（画面上部から常時降下）
     * @param canvasWidth - Canvas幅
     * @param maxCount - 粒子数上限（デフォルト: 30）
     */
    generateFloatingPetals(canvasWidth: number, maxCount: number = 30): void {
        // 上限チェック
        if (this.particles.length >= maxCount) {
            return;
        }

        // 確率的に生成（60%の確率で1個、常にまったり漂う）
        if (Math.random() < 0.6) {
            const x = Math.random() * canvasWidth;  // 画面上部のランダムX座標
            const y = -20;  // 画面上部外から出現
            const speed = Math.random() * 1.5 + 0.5;  // 0.5-2のゆっくり速度
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;  // 下向き（±10度揺れ）

            // 花びらのような色彩
            const particleColor: [number, number, number] = this.generateFlowerColor();

            this.particles.push(new Particle(x, y, speed, angle, particleColor));
        }
    }

    /**
     * v1.0: キラキラエフェクト（ランダム位置に瞬き）
     * @param canvasWidth - Canvas幅
     * @param canvasHeight - Canvas高さ
     * @param maxCount - 粒子数上限（デフォルト: 15）
     */
    generateSparkles(canvasWidth: number, canvasHeight: number, maxCount: number = 15): void {
        // 上限チェック
        if (this.particles.length >= maxCount) {
            return;
        }

        // 確率的に生成（30%の確率で1個）
        if (Math.random() < 0.3) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight * 0.8;  // 上部80%エリア
            const speed = Math.random() * 0.5 + 0.2;  // 0.2-0.7のほぼ静止
            const angle = Math.random() * Math.PI * 2;  // ランダム方向

            // 白・黄色系の輝き
            const particleColor: [number, number, number] = [
                Math.random() * 30 + 225,  // R: 225-255
                Math.random() * 30 + 225,  // G: 225-255
                Math.random() * 80 + 175   // B: 175-255（少し青み）
            ];

            this.particles.push(new Particle(x, y, speed, angle, particleColor));
        }
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
