import p5 from 'p5';
import { Particle } from './Particle';

/**
 * 粒子システムクラス（v1.2 WebGL版）
 * 複数の粒子を管理し、一括更新・描画を行う
 * WebGL sphere()でGPU並列処理、10000個の粒子を60fps描画
 */
export class ParticleSystem {
    private particles: Particle[] = [];

    /**
     * 粒子を放射状に発射（Clear!エフェクト用、v1.3神秘的演出版）
     * @param x - 発射原点X座標
     * @param y - 発射原点Y座標
     * @param count - 粒子数（デフォルト: 5000、v1.2 WebGLで大幅増量）
     * @param color - RGB色配列（デフォルト: ランダムな神秘的色彩）
     */
    burst(
        x: number,
        y: number,
        count: number = 5000,
        color?: [number, number, number]
    ): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;  // 0-360度のランダム角度

            // v1.3: 速度のメリハリ強化（爆発的に速い粒子 vs ゆっくり漂う粒子）
            const speedType = Math.random();
            let speed: number;
            if (speedType < 0.3) {
                // 30%: 超高速粒子（15-25）
                speed = Math.random() * 10 + 15;
            } else if (speedType < 0.7) {
                // 40%: 中速粒子（5-12）
                speed = Math.random() * 7 + 5;
            } else {
                // 30%: ゆっくり粒子（1-4）
                speed = Math.random() * 3 + 1;
            }

            // v1.3: サイズバリエーション（大中小）
            const sizeType = Math.random();
            let size: number;
            if (sizeType < 0.2) {
                // 20%: 巨大粒子（2-3倍）
                size = Math.random() * 1 + 2;
            } else if (sizeType < 0.7) {
                // 50%: 通常粒子（0.8-1.5倍）
                size = Math.random() * 0.7 + 0.8;
            } else {
                // 30%: 微小粒子（0.3-0.6倍）
                size = Math.random() * 0.3 + 0.3;
            }

            // 色指定がなければランダムな神秘的色彩（青紫・虹色追加）
            const particleColor: [number, number, number] = color || this.generateMysticalColor();

            this.particles.push(new Particle(x, y, speed, angle, particleColor, size));
        }
    }

    /**
     * v1.3: 金色系色彩を生成（鮮明でくっきりした金色バリエーション）
     */
    private generateMysticalColor(): [number, number, number] {
        const colorType = Math.random();

        if (colorType < 0.4) {
            // 濃い金色（ディープゴールド）
            return [
                Math.random() * 30 + 200,   // R: 200-230
                Math.random() * 30 + 140,   // G: 140-170
                Math.random() * 20 + 10     // B: 10-30（濃い金）
            ];
        } else if (colorType < 0.7) {
            // 明るい金色（ブライトゴールド）
            return [
                Math.random() * 25 + 230,   // R: 230-255
                Math.random() * 40 + 180,   // G: 180-220
                Math.random() * 30 + 20     // B: 20-50（明るい金）
            ];
        } else if (colorType < 0.85) {
            // オレンジゴールド（温かみのある金）
            return [
                Math.random() * 25 + 230,   // R: 230-255
                Math.random() * 50 + 120,   // G: 120-170
                Math.random() * 20          // B: 0-20（オレンジ寄り）
            ];
        } else {
            // 白金色（プラチナゴールド、最も明るい）
            return [
                Math.random() * 25 + 230,   // R: 230-255
                Math.random() * 25 + 230,   // G: 230-255
                Math.random() * 50 + 180    // B: 180-230（白に近い金）
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
     * v1.3: すべての粒子を描画（金色残像版、くっきり鮮明）
     * GPU並列処理で10000個の粒子を60fps描画
     * 残像トレイル・鮮明なエッジ・控えめグロー
     * v1.3最適化: WebGL座標系対応、トレイル簡略化
     * @param p - p5インスタンス
     */
    draw(p: p5): void {
        // WebGL 3D描画: sphere()で立体感を表現
        this.particles.forEach(particle => {
            const alpha = particle.life * 255;  // 寿命に応じた透明度
            const baseSize = (particle.life * 12 + 4) * particle.size;  // サイズ倍率適用

            p.push();  // 座標系を保存

            // 粒子の位置に移動（Z軸奥行き含む）
            p.translate(particle.x, particle.y, particle.z);

            // v1.3: 回転アニメーション（3軸回転で金色の輝き）
            p.rotateZ(particle.rotation);
            p.rotateX(particle.rotation * 0.5);  // X軸も少し回転

            // v1.3最適化: 外側グロー（1.5倍サイズ、柔らかい光）
            const glowColor = particle.color;
            p.fill(glowColor[0], glowColor[1], glowColor[2], alpha * 0.3);  // 透明度30%
            p.noStroke();
            p.sphere(baseSize * 1.5);  // 1.5倍サイズのグロー

            // 実体（くっきり鮮明、不透明度100%）
            p.fill(particle.color[0], particle.color[1], particle.color[2], alpha);
            p.sphere(baseSize);

            p.pop();  // 座標系を復元
        });
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

            // 花びらのような色彩（v1.3: 神秘的色彩に変更）
            const particleColor: [number, number, number] = this.generateMysticalColor();

            this.particles.push(new Particle(x, y, speed, angle, particleColor, 0.8));
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

            // 白・黄色系の輝き（v1.3: より鮮やかに）
            const particleColor: [number, number, number] = [
                Math.random() * 30 + 225,  // R: 225-255
                Math.random() * 30 + 225,  // G: 225-255
                Math.random() * 80 + 175   // B: 175-255（少し青み）
            ];

            this.particles.push(new Particle(x, y, speed, angle, particleColor, 0.6));
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
