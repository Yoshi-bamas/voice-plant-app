import p5 from 'p5';

/**
 * コンクリート壁エフェクトクラス
 * 横向きの壁とひび割れアニメーションを管理
 */
export class ConcreteEffect {
    private crackProgress: number = 0;  // ひび割れの進行度（0-1）
    private crackLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    private lastWallY: number = 0;  // 最後に描画した壁のY座標（ひび割れ用）

    /**
     * 壁を描画（横向き、Clear!ライン位置に配置）
     * @param p - p5インスタンス
     * @param wallY - 壁の中心Y座標
     * @param thickness - 壁の厚み（デフォルト: 60px）
     * @param color - 壁の色 [r, g, b]（デフォルト: グレー）
     * @param opacity - 壁の不透明度 0-1（デフォルト: 1.0）
     */
    drawWall(
        p: p5,
        wallY: number,
        thickness: number = 60,
        color: [number, number, number] = [100, 100, 100],
        opacity: number = 1.0
    ): void {
        this.lastWallY = wallY;

        // 壁を横向きに描画
        p.fill(color[0], color[1], color[2], opacity * 255);
        p.noStroke();
        p.rect(0, wallY - thickness / 2, p.width, thickness);

        // 壁のエッジライン（上下）
        p.stroke(color[0] - 30, color[1] - 30, color[2] - 30, opacity * 255);
        p.strokeWeight(2);
        p.line(0, wallY - thickness / 2, p.width, wallY - thickness / 2);  // 上端
        p.line(0, wallY + thickness / 2, p.width, wallY + thickness / 2);  // 下端
    }

    /**
     * ひび割れアニメーションをトリガー
     * @param wallY - 壁のY座標
     * @param impactX - 衝突X座標（省略時は画面中央）
     */
    crack(wallY?: number, impactX?: number): void {
        this.crackProgress = 1.0;

        // 衝突位置を記録（次回のひび割れ生成用）
        if (wallY !== undefined) {
            this.lastWallY = wallY;
        }

        // ひび割れ線を再生成（衝突位置から放射状）
        this.generateCrackLines(impactX);
    }

    /**
     * ひび割れ線を生成（衝突位置から放射状、枝分かれ付き）
     * @param impactX - 衝突X座標（省略時は画面中央）
     */
    private generateCrackLines(impactX?: number): void {
        this.crackLines = [];
        const centerX = impactX !== undefined ? impactX : 0.5;  // 画面幅比率（0-1）

        // 衝突点から放射状に12本のひび割れ（強化: 8→12）
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;  // 360度を12分割
            const length = 0.08 + Math.random() * 0.15;  // 8-23%の長さ（強化: 5-15%→8-23%）

            // ひび割れの終点を計算
            const dx = Math.cos(angle) * length;
            const dy = Math.sin(angle) * length;

            // メインひび割れ
            this.crackLines.push({
                x1: centerX,
                y1: 0,  // 壁の中心からの相対位置（drawCracksで調整）
                x2: centerX + dx,
                y2: dy
            });

            // 枝分かれひび割れ（50%の確率）
            if (Math.random() > 0.5) {
                const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 3;  // ±30度
                const branchLength = length * (0.4 + Math.random() * 0.3);  // 40-70%の長さ
                const branchStartRatio = 0.5 + Math.random() * 0.3;  // 50-80%地点から分岐

                const branchStartX = centerX + dx * branchStartRatio;
                const branchStartY = dy * branchStartRatio;

                const branchDx = Math.cos(branchAngle) * branchLength;
                const branchDy = Math.sin(branchAngle) * branchLength;

                this.crackLines.push({
                    x1: branchStartX,
                    y1: branchStartY,
                    x2: branchStartX + branchDx,
                    y2: branchStartY + branchDy
                });
            }
        }
    }

    /**
     * ひび割れの進行度を更新（減衰）
     */
    update(): void {
        if (this.crackProgress > 0.01) {
            this.crackProgress *= 0.98;  // 減衰速度を遅く（約3秒持続）
        } else {
            this.crackProgress = 0;
        }
    }

    /**
     * ひび割れ線を描画（太さのバリエーション付き）
     * @param p - p5インスタンス
     */
    drawCracks(p: p5): void {
        if (this.crackProgress <= 0.01) return;

        const alpha = this.crackProgress * 255;

        this.crackLines.forEach((line, index) => {
            const x1 = line.x1 * p.width;
            const y1 = this.lastWallY + line.y1 * p.height;  // 壁のY座標を基準に
            const x2 = line.x2 * p.width;
            const y2 = this.lastWallY + line.y2 * p.height;

            // メインひび割れ（偶数番号）は太く、枝（奇数番号）は細く
            const weight = index % 2 === 0 ? 5 : 3;

            // 黒のひび割れ（メイン）
            p.stroke(0, 0, 0, alpha);
            p.strokeWeight(weight);
            p.line(x1, y1, x2, y2);

            // 白いハイライト（ひび割れの内側、立体感）
            p.stroke(255, 255, 255, alpha * 0.4);
            p.strokeWeight(weight * 0.4);
            p.line(x1 + 1, y1 + 1, x2 + 1, y2 + 1);
        });
    }

    /**
     * 地面のY座標を取得（他のオブジェクトの配置用）
     * @param p - p5インスタンス
     * @returns 地面のY座標（ピクセル値）
     */
    getGroundY(p: p5): number {
        return p.height * 0.7;
    }
}
