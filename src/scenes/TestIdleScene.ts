/**
 * TestIdleScene.ts
 * v1.5新規追加: Test Mode専用アイドルシーン
 *
 * 【役割】
 * - Test Mode開始時の初期状態
 * - VisualizerViewで波形をプレビュー表示
 * - Startボタンクリック → PlayingSceneへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';
import { VisualizerView } from '../VisualizerView';

export class TestIdleScene implements IScene {
    private sceneManager: SceneManager;
    private visualizerView: VisualizerView;
    private startButton: HTMLButtonElement | null = null;
    private onStartCallback: (() => void) | null = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.visualizerView = new VisualizerView();
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[TestIdleScene] Enter');

        // Startボタンを表示
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        if (this.startButton) {
            this.startButton.style.display = 'block';
            this.startButton.disabled = false;
            this.startButton.textContent = 'START';

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

        // v1.5.2: HTMLオーバーレイ表示
        const overlay = document.getElementById('testIdleOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[TestIdleScene] Exit');

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

        // v1.5.2: HTMLオーバーレイ非表示
        const overlay = document.getElementById('testIdleOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 更新処理
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        // audioAnalyzerが存在すればVisualizerViewを更新（波形プレビュー）
        if (audioAnalyzer) {
            this.visualizerView.update(audioAnalyzer);
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

        // VisualizerViewを描画（波形プレビュー）
        this.visualizerView.draw(p);

        // v1.5.2: テキストはHTMLオーバーレイで表示（WEBGL text()エラー回避）
    }

    /**
     * Startボタンクリック時の処理
     */
    private handleStart(): void {
        console.log('[TestIdleScene] Start button clicked');
        // PlayingSceneへ遷移（Test Mode用）
        this.sceneManager.switchTo('playing');
    }
}
