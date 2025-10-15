/**
 * ChallengeIdleScene.ts
 * v1.5新規追加: Challenge Mode専用アイドルシーン
 *
 * 【役割】
 * - Challenge Mode開始時の初期状態
 * - VisualizerViewで波形をプレビュー表示
 * - Start（マイク初期化）→ Challengeボタンクリック → MessageSceneへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';
import { ChallengeModeView } from '../views/ChallengeModeView';

export class ChallengeIdleScene implements IScene {
    private sceneManager: SceneManager;
    private challengeModeView: ChallengeModeView;
    private challengeStartButtonArea = { x: 250, y: 530, width: 300, height: 50 };

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.challengeModeView = new ChallengeModeView();
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[ChallengeIdleScene] Enter');

        // HTMLボタンを全て非表示
        const startButton = document.getElementById('startButton');
        const challengeButton = document.getElementById('challengeButton');
        const backButton = document.getElementById('backButton');
        if (startButton) startButton.style.display = 'none';
        if (challengeButton) challengeButton.style.display = 'none';
        if (backButton) backButton.style.display = 'none';

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

        // v1.5.2: HTMLオーバーレイテキスト表示
        const overlay = document.getElementById('challengeIdleOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[ChallengeIdleScene] Exit');

        // コンソールエリアを再表示
        const consoleArea = document.querySelector('.console-area') as HTMLElement;
        if (consoleArea) {
            consoleArea.style.display = 'block';
        }

        // v1.5.2: HTMLオーバーレイテキスト非表示
        const overlay = document.getElementById('challengeIdleOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 更新処理
     * v1.5.1: ChallengeModeView.updatePreview()を使用（音量で植物が揺れ動く）
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        if (audioAnalyzer) {
            // プレビューモード更新（EasyMode相当、成長なし）
            this.challengeModeView.updatePreview(audioAnalyzer);
        }
    }

    /**
     * 描画処理
     * v1.5.1: ChallengeModeView描画 + CHALLENGE STARTボタン
     */
    draw(p: p5): void {
        // 背景（黒）
        p.background(20, 20, 20);

        // ChallengeModeView描画（Plant + Visualizer×2）
        this.challengeModeView.draw(p);

        // v1.5.2: テキストはHTMLオーバーレイで表示（WEBGL text()エラー回避）
        p.translate(-p.width / 2, -p.height / 2);

        // CHALLENGE STARTボタン描画（Canvas下部）
        this.drawChallengeStartButton(p);
    }

    /**
     * v1.5.1: CHALLENGE STARTボタン描画
     */
    private drawChallengeStartButton(p: p5): void {
        const btn = this.challengeStartButtonArea;

        p.push();

        // ボタン背景
        p.fill(255, 170, 0, 120);
        p.stroke(255, 170, 0);
        p.strokeWeight(4);
        p.rect(btn.x, btn.y, btn.width, btn.height, 5);

        // v1.5.2: ボタンテキストはWEBGL text()エラーのため削除（HTMLで対応）

        p.pop();
    }

    /**
     * v1.5.1: マウスクリック判定
     * main.tsのp.mousePressed()から呼び出される
     */
    async handleMouseClick(mouseX: number, mouseY: number, initializeAudio: () => Promise<void>): Promise<void> {
        const btn = this.challengeStartButtonArea;

        // CHALLENGE STARTボタン判定
        if (
            mouseX >= btn.x &&
            mouseX <= btn.x + btn.width &&
            mouseY >= btn.y &&
            mouseY <= btn.y + btn.height
        ) {
            console.log('[ChallengeIdleScene] CHALLENGE START clicked');

            // マイク初期化
            await initializeAudio();

            // MessageSceneへ遷移
            this.sceneManager.switchTo('message');
        }
    }
}
