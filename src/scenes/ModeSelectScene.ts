/**
 * ModeSelectScene.ts
 * v1.5新規追加: モード選択シーン
 *
 * 【役割】
 * - Test Mode / Challenge Mode選択画面
 * - 初期シーン（アプリ起動時）
 * - モード選択後、各Idleシーンへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';

/**
 * モード選択シーンクラス
 * v1.5.1: Canvas内ボタン描画＋クリック判定
 */
export class ModeSelectScene implements IScene {
    private sceneManager: SceneManager;

    // v1.5.1: Canvas内ボタン領域定義（中央揃え）
    private testModeButtonArea = { x: 300, y: 200, width: 200, height: 60 };
    private challengeModeButtonArea = { x: 280, y: 320, width: 240, height: 60 };

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[ModeSelectScene] onEnter');

        // 他のボタンを非表示
        const startButton = document.getElementById('startButton');
        const challengeButton = document.getElementById('challengeButton');
        const backButton = document.getElementById('backButton');
        if (startButton) startButton.style.display = 'none';
        if (challengeButton) challengeButton.style.display = 'none';
        if (backButton) backButton.style.display = 'none';

        // Console非表示
        const consoleArea = document.getElementById('consoleArea');
        if (consoleArea) consoleArea.classList.add('console-area--hidden');

        // v1.5.2: HTMLオーバーレイテキスト表示
        const overlay = document.getElementById('modeSelectOverlay');
        if (overlay) overlay.style.display = 'block';
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[ModeSelectScene] onExit');

        // v1.5.2: HTMLオーバーレイテキスト非表示
        const overlay = document.getElementById('modeSelectOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * フレーム毎の更新処理（特になし）
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        // ModeSelectSceneでは更新処理なし
    }

    /**
     * 描画処理
     * v1.5.1: Canvas内ボタン描画
     */
    draw(p: p5): void {
        // v1.5.2: WEBGL座標系を2D互換に変換
        p.translate(-p.width / 2, -p.height / 2);

        // v1.5.2: テキストはHTMLオーバーレイで表示（WEBGL text()エラー回避）
        // ボタンのみCanvas描画

        // Test Modeボタン
        this.drawButton(
            p,
            this.testModeButtonArea.x,
            this.testModeButtonArea.y,
            this.testModeButtonArea.width,
            this.testModeButtonArea.height,
            'Test Mode',
            [0, 255, 0]  // 緑
        );

        // Challenge Modeボタン
        this.drawButton(
            p,
            this.challengeModeButtonArea.x,
            this.challengeModeButtonArea.y,
            this.challengeModeButtonArea.width,
            this.challengeModeButtonArea.height,
            'Challenge Mode',
            [255, 170, 0]  // オレンジ
        );
    }

    /**
     * v1.5.1: Canvas内ボタン描画メソッド
     */
    private drawButton(
        p: p5,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        color: [number, number, number]
    ): void {
        p.push();

        // ボタン背景
        p.fill(color[0], color[1], color[2], 100);
        p.stroke(color[0], color[1], color[2]);
        p.strokeWeight(3);
        p.rect(x, y, width, height, 5);

        // v1.5.2: ボタンテキストはWEBGL text()エラーのため削除
        // HTMLで描画するか、別の方法で対応

        p.pop();
    }

    /**
     * v1.5.1: マウスクリック判定
     * main.tsのp.mousePressed()から呼び出される
     * v1.5.2: Challenge Mode選択時にマイク初期化を実行
     */
    async handleMouseClick(mouseX: number, mouseY: number, initializeAudio?: () => Promise<void>): Promise<void> {
        // Test Modeボタン判定
        if (this.isInsideButton(mouseX, mouseY, this.testModeButtonArea)) {
            console.log('[ModeSelectScene] Test Mode selected');
            this.sceneManager.setMode('test');
            this.sceneManager.switchTo('testIdle');
            return;
        }

        // Challenge Modeボタン判定
        if (this.isInsideButton(mouseX, mouseY, this.challengeModeButtonArea)) {
            console.log('[ModeSelectScene] Challenge Mode selected');

            // v1.5.2: マイク初期化（待機画面で声に反応させるため）
            if (initializeAudio) {
                await initializeAudio();
            }

            this.sceneManager.setMode('challenge');
            this.sceneManager.switchTo('challengeIdle');
            return;
        }
    }

    /**
     * v1.5.1: ボタン領域内判定
     */
    private isInsideButton(
        mouseX: number,
        mouseY: number,
        button: { x: number; y: number; width: number; height: number }
    ): boolean {
        return (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        );
    }
}
