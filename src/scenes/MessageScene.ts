/**
 * MessageScene.ts
 * v1.4.5新規追加: メッセージ表示シーン
 *
 * 【役割】
 * - 「大声を出して想いを伝えよう！」メッセージを2秒間表示
 * - フェードイン演出
 * - 2秒後にCountdownSceneへ自動遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { SceneManager } from './SceneManager';

export class MessageScene implements IScene {
    private sceneManager: SceneManager;
    private startTime: number = 0;
    private duration: number = 2000; // 2秒間表示
    private opacity: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[MessageScene] Enter');
        this.startTime = Date.now();
        this.opacity = 0;

        // v1.5.2: HTMLオーバーレイ表示
        const overlay = document.getElementById('messageOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[MessageScene] Exit');

        // v1.5.2: HTMLオーバーレイ非表示
        const overlay = document.getElementById('messageOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 更新処理
     */
    update(): void {
        const elapsed = Date.now() - this.startTime;

        // フェードイン（0.5秒かけて0→255）
        if (elapsed < 500) {
            this.opacity = (elapsed / 500) * 255;
        } else {
            this.opacity = 255;
        }

        // v1.5.2: HTMLオーバーレイの透明度更新
        const overlay = document.getElementById('messageOverlay');
        if (overlay) {
            overlay.style.opacity = (this.opacity / 255).toString();
        }

        // 2秒経過したらCountdownSceneへ遷移
        if (elapsed >= this.duration) {
            this.sceneManager.switchTo('countdown');
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
