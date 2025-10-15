/**
 * IdleScene.ts
 * v1.4.5新規追加: アイドル状態シーン
 *
 * 【役割】
 * - 起動直後の初期状態
 * - VisualizerViewで波形をプレビュー表示（自由に音声入力可能）
 * - Challengeボタンクリック → MessageSceneへ遷移
 * - Startボタンでマイク初期化（Challengeボタンは別）
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';
import { VisualizerView } from '../VisualizerView';

export class IdleScene implements IScene {
    private sceneManager: SceneManager;
    private visualizerView: VisualizerView;
    private challengeButton: HTMLButtonElement | null = null;
    private startButton: HTMLButtonElement | null = null;
    private onChallengeCallback: (() => void) | null = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.visualizerView = new VisualizerView();
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[IdleScene] Enter');

        // Startボタンを表示（マイク初期化用）
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        if (this.startButton) {
            this.startButton.style.display = 'block';
            this.startButton.disabled = false;
            this.startButton.textContent = 'START MICROPHONE';
        }

        // Challengeボタンを表示
        this.challengeButton = document.getElementById('challengeButton') as HTMLButtonElement;
        if (this.challengeButton) {
            this.challengeButton.style.display = 'block';
            this.challengeButton.disabled = false;

            // クリックイベントリスナー登録
            this.onChallengeCallback = () => this.handleChallenge();
            this.challengeButton.addEventListener('click', this.onChallengeCallback);
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
        console.log('[IdleScene] Exit');

        // Challengeボタンを非表示
        if (this.challengeButton && this.onChallengeCallback) {
            this.challengeButton.removeEventListener('click', this.onChallengeCallback);
            this.challengeButton.style.display = 'none';
        }

        // Startボタンを非表示
        if (this.startButton) {
            this.startButton.style.display = 'none';
        }

        // コンソールエリアを再表示
        const consoleArea = document.querySelector('.console-area') as HTMLElement;
        if (consoleArea) {
            consoleArea.style.display = 'block';
        }
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

        // タイトル描画（上部）
        p.push();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(48);
        p.fill(0, 255, 0);  // ネオン緑
        p.text('Voice Plant App', p.width / 2, 80);

        // サブタイトル
        p.textSize(20);
        p.fill(0, 255, 0, 180);
        p.text('声で植物を育てるチャレンジゲーム', p.width / 2, 130);

        // 説明テキスト（下部）
        p.textSize(16);
        p.fill(0, 255, 0, 150);
        p.text('まずはマイクを起動してください', p.width / 2, p.height - 120);
        p.text('準備ができたら "CHALLENGE" ボタンを押そう！', p.width / 2, p.height - 90);
        p.pop();
    }

    /**
     * Challengeボタンクリック時の処理
     */
    private handleChallenge(): void {
        console.log('[IdleScene] Challenge button clicked');
        // MessageSceneへ遷移
        this.sceneManager.switchTo('message');
    }
}
