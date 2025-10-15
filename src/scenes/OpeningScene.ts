/**
 * OpeningScene.ts
 * v1.4新規追加: オープニング画面シーン
 *
 * 【役割】
 * - タイトル表示: "Voice Plant App"
 * - メッセージ表示: "大きな声で想いを伝えろ！"
 * - Startボタンクリック → CountdownSceneへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { SceneManager } from './SceneManager';

export class OpeningScene implements IScene {
    private sceneManager: SceneManager;
    private startButton: HTMLButtonElement | null = null;
    private onStartCallback: (() => void) | null = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[OpeningScene] Enter');

        // Startボタンを表示
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        if (this.startButton) {
            this.startButton.style.display = 'block';
            this.startButton.disabled = false;
            this.startButton.textContent = 'START GAME';

            // クリックイベントリスナー登録
            this.onStartCallback = () => this.handleStart();
            this.startButton.addEventListener('click', this.onStartCallback);
        }

        // コンソールエリアを非表示
        const consoleArea = document.querySelector('.console-area') as HTMLElement;
        if (consoleArea) {
            consoleArea.style.display = 'none';
        }

        // メッセージを非表示にリセット
        const clearMsg = document.getElementById('clearMessage');
        if (clearMsg) {
            clearMsg.classList.remove('clear-message--visible');
            clearMsg.classList.remove('clear-message--persistent');
        }

        const gameOverMsg = document.getElementById('gameOverMessage');
        if (gameOverMsg) {
            gameOverMsg.classList.remove('game-over-message--visible');
        }
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[OpeningScene] Exit');

        // Startボタンを非表示
        if (this.startButton && this.onStartCallback) {
            this.startButton.removeEventListener('click', this.onStartCallback);
            this.startButton.style.display = 'none';
        }

        // コンソールエリアを再表示
        const consoleArea = document.querySelector('.console-area') as HTMLElement;
        if (consoleArea) {
            consoleArea.style.display = 'block';
        }
    }

    /**
     * 更新処理（オープニングは静止画なので何もしない）
     */
    update(): void {
        // 特に処理なし
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // v1.2: WEBGL座標系を2D互換に変換
        p.translate(-p.width / 2, -p.height / 2);

        // 背景（黒）
        p.background(20, 20, 20);

        // タイトル描画
        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(64);
        p.fill(0, 255, 0);  // ネオン緑
        p.text('Voice Plant App', p.width / 2, p.height / 2 - 100);

        // サブタイトル
        p.textSize(24);
        p.fill(0, 255, 0, 180);
        p.text('大きな声で想いを伝えろ！', p.width / 2, p.height / 2 - 30);

        // バージョン表示
        p.textSize(16);
        p.fill(0, 255, 0, 120);
        p.text('v1.4 - MAX-based Growth System', p.width / 2, p.height / 2 + 30);
        p.pop();
    }

    /**
     * Startボタンクリック時の処理
     */
    private handleStart(): void {
        console.log('[OpeningScene] Start button clicked');
        // CountdownSceneへ遷移
        this.sceneManager.switchTo('countdown');
    }
}
