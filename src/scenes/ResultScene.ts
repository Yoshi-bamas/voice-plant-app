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

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.particles = new ParticleSystem();
    }

    /**
     * シーン開始時の処理
     * @param result - ゲーム結果（'clear' | 'gameover'）
     */
    onEnter(result: GameResult = 'gameover'): void {
        console.log(`[ResultScene] Enter - Result: ${result}`);
        this.result = result;

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
        const message = document.getElementById('resultMessage');

        if (overlay && title && message) {
            overlay.style.display = 'block';

            if (this.result === 'clear') {
                title.textContent = 'CLEAR!';
                title.style.color = '#ffd700';  // 金色
                message.textContent = '目標を達成しました！';
                message.style.color = '#00ff00';  // 緑
            } else {
                title.textContent = 'GAME OVER';
                title.style.color = '#ff3232';  // 赤
                message.textContent = 'もう一度挑戦しましょう';
                message.style.color = '#ff6464';  // 明るい赤
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
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // v1.2: WEBGL座標系を2D互換に変換
        p.translate(-p.width / 2, -p.height / 2);

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
        this.result = result;
    }
}
