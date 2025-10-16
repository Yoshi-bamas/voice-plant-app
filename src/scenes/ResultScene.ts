/**
 * ResultScene.ts
 * v1.4新規追加: 結果表示シーン
 *
 * 【役割】
 * - Clear/GameOverメッセージ表示
 * - Backボタン → OpeningSceneへ遷移
 * - 結果に応じたエフェクト（粒子バースト/暗転）
 */

import p5 from 'p5';
import { IScene, GameResult } from '../types';
import { SceneManager } from './SceneManager';
import { ParticleSystem } from '../effects/ParticleSystem';
import { VideoPlayer } from '../systems/VideoPlayer';

export class ResultScene implements IScene {
    private sceneManager: SceneManager;
    private result: GameResult = 'gameover';
    private particles: ParticleSystem;
    private backButton: HTMLButtonElement | null = null;
    private onBackCallback: (() => void) | null = null;

    // v1.5.7: GameOver演出用
    private shakeFrames: number = 0;        // シェイクの残りフレーム数
    private readonly shakeDuration: number = 10;  // シェイク時間（10フレーム = 約0.17秒）
    private readonly shakeIntensity: number = 20; // シェイク強度（ピクセル）
    private fadeAlpha: number = 0;          // フェードイン用アルファ値（0-255）

    // v1.5.8: インパクトのある演出（2.5秒エフェクト → 動画）
    private effectTimer: number = 0;        // 演出タイマー（フレーム数）
    private readonly effectDuration: number = 150;  // 2.5秒 (60fps × 2.5 = 150フレーム)
    private flashAlpha: number = 0;         // フラッシュエフェクト用
    private zoomScale: number = 1.0;        // ズームエフェクト用
    private rotationAngle: number = 0;      // 回転エフェクト用
    private transitionAlpha: number = 0;    // トランジション用（白/黒フェード）
    private crackLines: Array<{x1: number, y1: number, x2: number, y2: number}> = [];  // ひび割れライン

    // v1.5: Phase E - 動画再生
    private videoPlayer: VideoPlayer;
    private isVideoPlaying: boolean = false;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.particles = new ParticleSystem();
        this.videoPlayer = new VideoPlayer('resultVideo');
    }

    /**
     * シーン開始時の処理
     * v1.5.8: 2.5秒のインパクト演出 → 動画再生
     */
    onEnter(): void {
        console.log(`[ResultScene] Enter - Result: ${this.result}`);

        // v1.5.8: 演出タイマー初期化
        this.effectTimer = 0;
        this.flashAlpha = 0;
        this.zoomScale = 1.0;
        this.rotationAngle = 0;
        this.transitionAlpha = 0;
        this.crackLines = [];

        // v1.5.8: 初期エフェクト開始
        if (this.result === 'clear') {
            // Clear: 粒子バースト + 初期フラッシュ
            this.particles.burst(400, 300, 300);
            this.flashAlpha = 255;  // 白フラッシュ
            this.fadeAlpha = 0;     // テキストフェードイン準備
        } else {
            // GameOver: シェイク + 赤フラッシュ
            this.shakeFrames = this.shakeDuration;
            this.flashAlpha = 200;  // 赤フラッシュ
            this.fadeAlpha = 0;
            this.generateCrackLines();  // ひび割れライン生成
        }

        // v1.5.8: HTMLオーバーレイを即座に表示（演出開始）
        this.showEffectOverlay();

        // 動画はまだ再生しない（2.5秒後に再生）
        this.isVideoPlaying = false;

        // Backボタンは動画終了後に表示（showRetryScreen()で処理）
    }

    /**
     * v1.5.8: 演出開始時のHTMLオーバーレイ表示
     */
    private showEffectOverlay(): void {
        const overlay = document.getElementById('resultOverlay');
        const title = document.getElementById('resultTitle');

        if (overlay && title) {
            overlay.style.display = 'block';
            overlay.style.opacity = '0';  // フェードインで開始

            // v1.5.8: 既存のクラスをクリア
            title.className = 'result-title';

            if (this.result === 'clear') {
                title.textContent = 'CLEAR!';
                title.classList.add('result-title--clear');  // グローアニメーション
            } else {
                title.textContent = 'GAME OVER';
                title.classList.add('result-title--gameover');  // シェイクアニメーション
            }
        }
    }

    /**
     * v1.5.8: ひび割れラインを生成（GameOver演出用）
     */
    private generateCrackLines(): void {
        const centerX = 400;
        const centerY = 300;
        const lineCount = 12;  // ひび割れライン数

        for (let i = 0; i < lineCount; i++) {
            const angle = (Math.PI * 2 / lineCount) * i + (Math.random() - 0.5) * 0.5;
            const length = 200 + Math.random() * 150;
            this.crackLines.push({
                x1: centerX,
                y1: centerY,
                x2: centerX + Math.cos(angle) * length,
                y2: centerY + Math.sin(angle) * length
            });
        }
    }

    /**
     * v1.5.8: 動画再生開始（2.5秒後）
     */
    private startVideo(): void {
        console.log('[ResultScene] Starting video playback');
        this.isVideoPlaying = true;
        this.videoPlayer.play(this.result, () => {
            console.log('[ResultScene] Video completed, showing retry screen');
            this.isVideoPlaying = false;
            this.showRetryScreen();
        });
    }

    /**
     * v1.5: Phase E - Retry画面を表示（動画終了後）
     */
    private showRetryScreen(): void {
        console.log('[ResultScene] Showing retry screen');

        // Backボタンを表示
        this.backButton = document.getElementById('backButton') as HTMLButtonElement;
        if (this.backButton) {
            this.backButton.style.display = 'block';

            // クリックイベントリスナー登録
            this.onBackCallback = () => this.handleBack();
            this.backButton.addEventListener('click', this.onBackCallback);
        }

        // HTMLオーバーレイは既に表示されているので、opacityを1に
        const overlay = document.getElementById('resultOverlay');
        if (overlay) {
            overlay.style.opacity = '1';
        }
    }

    /**
     * シーン終了時の処理
     * v1.5: Phase E - 動画停止処理追加
     */
    onExit(): void {
        console.log('[ResultScene] Exit');

        // v1.5: Phase E - 動画停止
        this.videoPlayer.stop();
        this.isVideoPlaying = false;

        // Backボタンを非表示
        if (this.backButton && this.onBackCallback) {
            this.backButton.removeEventListener('click', this.onBackCallback);
            this.backButton.style.display = 'none';
        }

        // v1.5.2: HTMLオーバーレイ非表示
        const overlay = document.getElementById('resultOverlay');
        if (overlay) overlay.style.display = 'none';

        // エフェクトをクリア
        this.particles.clear();
    }

    /**
     * 更新処理
     * v1.5.8: 2.5秒演出タイムライン管理
     */
    update(): void {
        // 動画再生中は演出更新をスキップ
        if (this.isVideoPlaying) return;

        // 粒子エフェクトを更新
        this.particles.update();

        // v1.5.8: 演出タイムライン（0-150フレーム = 2.5秒）
        if (this.effectTimer < this.effectDuration) {
            this.effectTimer++;
            this.updateEffectTimeline();
        } else if (this.effectTimer === this.effectDuration) {
            // 2.5秒経過 → 動画再生開始
            this.effectTimer++;  // 1回だけ実行されるように
            this.startVideo();
        }
    }

    /**
     * v1.5.8: 演出タイムライン更新（Clear/GameOver共通）
     */
    private updateEffectTimeline(): void {
        const t = this.effectTimer;

        if (this.result === 'clear') {
            // ========== Clear演出タイムライン ==========
            // 0-30フレーム (0.0-0.5s): フラッシュ減衰 + テキストフェードイン
            if (t < 30) {
                this.flashAlpha = 255 * (1 - t / 30);  // 白フラッシュ減衰
                this.fadeAlpha = 255 * (t / 30);        // テキストフェードイン
            }
            // 30-90フレーム (0.5-1.5s): ズームアウト
            else if (t < 90) {
                const progress = (t - 30) / 60;
                this.zoomScale = 1.0 + progress * 0.3;  // 1.0 → 1.3
            }
            // 90-120フレーム (1.5-2.0s): 回転開始
            else if (t < 120) {
                const progress = (t - 90) / 30;
                this.rotationAngle = progress * Math.PI / 8;  // 0 → π/8 (22.5度)
            }
            // 120-150フレーム (2.0-2.5s): 白フェードイン（トランジション）
            else {
                const progress = (t - 120) / 30;
                this.transitionAlpha = 255 * progress;  // 0 → 255
            }
        } else {
            // ========== GameOver演出タイムライン ==========
            // 0-10フレーム (0.0-0.17s): シェイク + 赤フラッシュ
            if (t < 10) {
                this.shakeFrames = 10 - t;
                this.flashAlpha = 200 * (1 - t / 10);  // 赤フラッシュ減衰
            }
            // 10-30フレーム (0.17-0.5s): テキストフェードイン
            else if (t < 30) {
                const progress = (t - 10) / 20;
                this.fadeAlpha = 255 * progress;
            }
            // 30-60フレーム (0.5-1.0s): ズームイン（圧迫感）
            else if (t < 60) {
                const progress = (t - 30) / 30;
                this.zoomScale = 1.0 + progress * 0.2;  // 1.0 → 1.2
            }
            // 60-120フレーム (1.0-2.0s): ひび割れライン拡大
            else if (t < 120) {
                // ひび割れは描画で処理（zoomScaleキープ）
            }
            // 120-150フレーム (2.0-2.5s): 暗転（トランジション）
            else {
                const progress = (t - 120) / 30;
                this.transitionAlpha = 255 * progress;  // 0 → 255
            }
        }

        // HTMLオーバーレイのopacity更新
        const overlay = document.getElementById('resultOverlay');
        if (overlay) {
            overlay.style.opacity = (this.fadeAlpha / 255).toString();
        }
    }

    /**
     * 描画処理
     * v1.5.8: インパクトのある演出を描画
     */
    draw(p: p5): void {
        // v1.5: Phase E - 動画再生中は背景を黒にして動画を前面に表示
        if (this.isVideoPlaying) {
            p.translate(-p.width / 2, -p.height / 2);
            p.background(0, 0, 0);  // 黒背景
            return;  // Canvas描画をスキップ
        }

        // v1.5.8: シェイクエフェクト
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeFrames > 0) {
            const intensity = (this.shakeFrames / this.shakeDuration) * this.shakeIntensity;
            shakeX = (Math.random() - 0.5) * 2 * intensity;
            shakeY = (Math.random() - 0.5) * 2 * intensity;
        }

        // v1.2: WEBGL座標系を2D互換に変換 + シェイク
        p.push();
        p.translate(-p.width / 2 + shakeX, -p.height / 2 + shakeY);

        // 背景
        if (this.result === 'clear') {
            p.background(40, 50, 40);
        } else {
            p.background(20, 20, 20);
        }

        // v1.5.8: ズーム + 回転エフェクト適用
        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.scale(this.zoomScale);
        p.rotate(this.rotationAngle);
        p.translate(-p.width / 2, -p.height / 2);

        // 粒子を描画（Clearの場合のみ）
        if (this.result === 'clear') {
            this.particles.draw(p);
        }

        // v1.5.8: ひび割れライン描画（GameOverの場合のみ）
        if (this.result === 'gameover' && this.effectTimer >= 60 && this.effectTimer < 120) {
            const progress = (this.effectTimer - 60) / 60;
            p.stroke(255, 0, 0, 150);
            p.strokeWeight(3);
            for (const line of this.crackLines) {
                const x1 = line.x1;
                const y1 = line.y1;
                const x2 = line.x1 + (line.x2 - line.x1) * progress;
                const y2 = line.y1 + (line.y2 - line.y1) * progress;
                p.line(x1, y1, x2, y2);
            }
        }

        p.pop();  // ズーム + 回転解除

        // v1.5.8: フラッシュエフェクト
        if (this.flashAlpha > 0) {
            if (this.result === 'clear') {
                // Clear: 白フラッシュ
                p.fill(255, 255, 255, this.flashAlpha);
            } else {
                // GameOver: 赤フラッシュ
                p.fill(255, 0, 0, this.flashAlpha);
            }
            p.noStroke();
            p.rect(0, 0, p.width, p.height);
        }

        // v1.5.8: トランジションフェード
        if (this.transitionAlpha > 0) {
            if (this.result === 'clear') {
                // Clear: 白フェード
                p.fill(255, 255, 255, this.transitionAlpha);
            } else {
                // GameOver: 黒フェード
                p.fill(0, 0, 0, this.transitionAlpha);
            }
            p.noStroke();
            p.rect(0, 0, p.width, p.height);
        }

        p.pop();  // シェイク解除
    }

    /**
     * Backボタンクリック時の処理
     */
    private handleBack(): void {
        console.log('[ResultScene] Back button clicked');
        // OpeningSceneへ遷移
        this.sceneManager.switchTo('opening');
    }

    /**
     * 結果を設定（外部から呼び出し可能）
     * @param result - ゲーム結果
     */
    setResult(result: GameResult): void {
        console.log(`[ResultScene] setResult called with: ${result}`);
        this.result = result;
        console.log(`[ResultScene] this.result is now: ${this.result}`);
    }
}
