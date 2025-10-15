/**
 * ChallengePlayingScene.ts
 * v1.5新規追加: Challenge Mode専用プレイシーン
 *
 * 【役割】
 * - ChallengeModeViewを使用してゲームプレイ
 * - Plant状態監視（cleared/gameOver → ResultSceneへ遷移）
 * - ViewボタンをOFF（Challenge ModeはView固定）
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';
import { ChallengeModeView } from '../views/ChallengeModeView';
import { ResultScene } from './ResultScene';

export class ChallengePlayingScene implements IScene {
    private sceneManager: SceneManager;
    private challengeModeView: ChallengeModeView;
    private resultScene: ResultScene;

    constructor(sceneManager: SceneManager, resultScene: ResultScene) {
        this.sceneManager = sceneManager;
        this.challengeModeView = new ChallengeModeView();
        this.resultScene = resultScene;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[ChallengePlayingScene] Enter');

        // コンソールエリアを表示
        const consoleArea = document.getElementById('consoleArea');
        if (consoleArea) {
            consoleArea.classList.remove('console-area--hidden');
        }

        // Viewボタンを非表示（Challenge ModeはView固定）
        const viewButtons = document.getElementById('viewButtons');
        if (viewButtons) {
            viewButtons.style.display = 'none';
        }

        // Easy Modeトグルを無効化（Challenge Modeでは使用不可）
        const easyModeToggle = document.getElementById('easyModeToggle') as HTMLInputElement;
        if (easyModeToggle) {
            easyModeToggle.disabled = true;
            easyModeToggle.checked = false;
        }

        // ChallengeModeViewをリセット
        this.challengeModeView.reset();
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[ChallengePlayingScene] Exit');

        // Viewボタンを再表示
        const viewButtons = document.getElementById('viewButtons');
        if (viewButtons) {
            viewButtons.style.display = 'flex';
        }

        // Easy Modeトグルを再有効化
        const easyModeToggle = document.getElementById('easyModeToggle') as HTMLInputElement;
        if (easyModeToggle) {
            easyModeToggle.disabled = false;
        }
    }

    /**
     * 更新処理
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        if (!audioAnalyzer) {
            return;
        }

        // ChallengeModeView更新
        this.challengeModeView.update(audioAnalyzer);

        // Plant状態確認
        const plantState = this.challengeModeView.getPlantState();

        if (plantState === 'cleared') {
            // Clear達成 → ResultScene
            console.log('[ChallengePlayingScene] Plant cleared! Transitioning to result...');
            this.resultScene.setResult('clear');
            this.sceneManager.switchTo('result');
        } else if (plantState === 'gameOver') {
            // GameOver → ResultScene
            console.log('[ChallengePlayingScene] GameOver detected. Transitioning to result...');
            this.resultScene.setResult('gameover');
            this.sceneManager.switchTo('result');
        }
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // ChallengeModeView描画（Plant中央 + Visualizer×2）
        // Note: ChallengeModeViewは内部でWEBGL座標系（中央原点）を使用
        this.challengeModeView.draw(p);
    }

    /**
     * v1.5.7: マイク感度（音量閾値）を設定
     * @param threshold - 音量閾値（0.03-0.20）
     */
    setVolumeThreshold(threshold: number): void {
        this.challengeModeView.setVolumeThreshold(threshold);
    }
}
