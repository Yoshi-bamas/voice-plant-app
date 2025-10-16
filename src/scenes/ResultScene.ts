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

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.particles = new ParticleSystem();
    }

    /**
     * シーン開始時の処理
     * v1.5.7: setResult()で事前設定された値を使用（デフォルト引数による上書きを防止）
     */
    onEnter(): void {
        console.log(`[ResultScene] Enter - Result: ${this.result}`);

        // v1.5.7: GameOver演出初期化
        if (this.result === 'gameover') {
            this.shakeFrames = this.shakeDuration;  // シェイク開始
            this.fadeAlpha = 0;                     // フェードイン開始
        } else {
            // Clear演出は即座に表示
            this.shakeFrames = 0;
            this.fadeAlpha = 255;
        }

        // 結果に応じたエフェクト
        if (this.result === 'clear') {
            // Clearエフェクト: 画面全体に金色の粒子バースト
            this.particles.burst(400, 300, 300);  // 中央から
        }

        // Backボタンを表示
        this.backButton = document.getElementById('backButton') as HTMLButtonElement;
        if (this.backButton) {
            this.backButton.style.display = 'block';

            // クリックイベントリスナー登録
            this.onBackCallback = () => this.handleBack();
            this.backButton.addEventListener('click', this.onBackCallback);
        }

        // v1.5.2: HTMLオーバーレイ表示
        const overlay = document.getElementById('resultOverlay');
        const title = document.getElementById('resultTitle');

        if (overlay && title) {
            overlay.style.display = 'block';
            // v1.5.7: 初期opacity設定（GameOverはフェードイン、Clearは即座に表示）
            overlay.style.opacity = this.result === 'clear' ? '1' : '0';

            if (this.result === 'clear') {
                title.textContent = 'CLEAR!';
                title.style.color = '#ffd700';  // 金色
            } else {
                title.textContent = 'GAME OVER';
                title.style.color = '#ff3232';  // 赤
            }
        }
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[ResultScene] Exit');

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
     */
    update(): void {
        // 粒子エフェクトを更新
        this.particles.update();

        // v1.5.7: GameOver演出更新
        if (this.result === 'gameover') {
            // シェイク減衰
            if (this.shakeFrames > 0) {
                this.shakeFrames--;
            }

            // フェードイン（シェイク完了後に開始）
            if (this.shakeFrames === 0 && this.fadeAlpha < 255) {
                this.fadeAlpha += 8;  // 約2秒でフェードイン完了（255 / 8 = 32フレーム）
                if (this.fadeAlpha > 255) this.fadeAlpha = 255;
            }
        }

        // v1.5.7: HTMLオーバーレイのopacity更新
        const overlay = document.getElementById('resultOverlay');
        if (overlay) {
            overlay.style.opacity = (this.fadeAlpha / 255).toString();
        }
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // v1.5.7: GameOverシェイクエフェクト
        let shakeX = 0;
        let shakeY = 0;
        if (this.result === 'gameover' && this.shakeFrames > 0) {
            // ランダムなシェイク（強度は減衰）
            const intensity = (this.shakeFrames / this.shakeDuration) * this.shakeIntensity;
            shakeX = (Math.random() - 0.5) * 2 * intensity;
            shakeY = (Math.random() - 0.5) * 2 * intensity;
        }

        // v1.2: WEBGL座標系を2D互換に変換 + シェイクオフセット
        p.translate(-p.width / 2 + shakeX, -p.height / 2 + shakeY);

        // 背景
        if (this.result === 'clear') {
            // Clear: 明るい背景
            p.background(40, 50, 40);
        } else {
            // GameOver: 暗い背景
            p.background(20, 20, 20);
        }

        // 粒子を描画（Clearの場合のみ）
        if (this.result === 'clear') {
            this.particles.draw(p);
        }

        // v1.5.2: テキストはHTMLオーバーレイで表示（WEBGL text()エラー回避）
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
