/**
 * CountdownScene.ts
 * v1.4新規追加: カウントダウン演出シーン
 *
 * 【役割】
 * - カウントダウン表示: 3 → 2 → 1 → START!
 * - 各1秒間隔、フェードイン演出
 * - START!完了 → PlayingSceneへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { SceneManager } from './SceneManager';

export class CountdownScene implements IScene {
    private sceneManager: SceneManager;
    private countdown: number = 5;  // v1.5.7: 5秒カウントダウンに変更
    private frameCounter: number = 0;
    private readonly framesPerCount: number = 60;  // 1秒 = 60フレーム
    private alpha: number = 0;  // フェードイン用

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[CountdownScene] Enter');
        this.countdown = 5;  // v1.5.7: 5秒から開始
        this.frameCounter = 0;
        this.alpha = 0;

        // v1.5.2: HTMLオーバーレイ表示
        const overlay = document.getElementById('countdownOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[CountdownScene] Exit');

        // v1.5.2: HTMLオーバーレイ非表示
        const overlay = document.getElementById('countdownOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 更新処理
     */
    update(): void {
        this.frameCounter++;

        // フェードイン（0.5秒かけて255まで）
        if (this.frameCounter < 30) {
            this.alpha = (this.frameCounter / 30) * 255;
        } else {
            this.alpha = 255;
        }

        // v1.5.2: HTMLオーバーレイ更新
        const number = document.getElementById('countdownNumber');
        if (number) {
            if (this.countdown > 0) {
                number.textContent = this.countdown.toString();
                number.style.opacity = (this.alpha / 255).toString();
                number.style.color = '#00ff00';  // 緑
                number.style.fontSize = '160px';
            } else if (this.countdown === 0) {
                number.textContent = 'START!';
                number.style.opacity = (this.alpha / 255).toString();
                number.style.color = '#ffd700';  // 金色
                number.style.fontSize = '120px';
            }
        }

        // 1秒経過したらカウントダウン
        if (this.frameCounter >= this.framesPerCount) {
            this.frameCounter = 0;
            this.countdown--;

            // v1.5.8: カウントダウン音を再生
            const soundManager = this.sceneManager.getSoundManager();
            if (this.countdown > 0) {
                soundManager?.playSE('countdown');  // 3,2,1
            } else if (this.countdown === 0) {
                soundManager?.playSE('start');  // START!
            }

            // v1.5.7: カウントダウン終了 → モードに応じて適切なシーンへ遷移
            if (this.countdown < 0) {
                const currentMode = this.sceneManager.getMode();
                if (currentMode === 'challenge') {
                    this.sceneManager.switchTo('challengePlaying');
                } else {
                    // Test Mode（デフォルト）
                    this.sceneManager.switchTo('playing');
                }
            }
        }
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // v1.2: WEBGL座標系を2D互換に変換
        p.translate(-p.width / 2, -p.height / 2);

        // 背景（黒）
        p.background(20, 20, 20);

        // v1.5.2: テキストはHTMLオーバーレイで表示（WEBGL text()エラー回避）
    }
}
