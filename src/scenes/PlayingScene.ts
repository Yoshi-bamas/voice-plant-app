/**
 * PlayingScene.ts
 * v1.4新規追加: ゲームプレイシーン
 *
 * 【役割】
 * - 既存PlantView/FractalPlantViewを統合
 * - GameFlowControllerで音量閾値検出
 * - shouldEndGame()でResultSceneへ遷移
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';
import { SceneManager } from './SceneManager';
import { ViewManager } from '../ViewManager';
import { ResultScene } from './ResultScene';

export class PlayingScene implements IScene {
    private sceneManager: SceneManager;
    private viewManager: ViewManager;
    private resultScene: ResultScene | null = null;

    constructor(sceneManager: SceneManager, viewManager: ViewManager, resultScene?: ResultScene) {
        this.sceneManager = sceneManager;
        this.viewManager = viewManager;
        this.resultScene = resultScene || null;
    }

    /**
     * シーン開始時の処理
     */
    onEnter(): void {
        console.log('[PlayingScene] Enter');

        // ViewManagerのリセット（新規ゲーム開始）
        this.viewManager.reset();
    }

    /**
     * シーン終了時の処理
     */
    onExit(): void {
        console.log('[PlayingScene] Exit');
    }

    /**
     * 更新処理
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        // v1.4.5: audioAnalyzerが存在する場合のみViewManagerを更新
        if (audioAnalyzer) {
            // ViewManagerを更新
            this.viewManager.update(audioAnalyzer);

            // GameFlowController経由でゲーム終了判定
            // （ViewManager内部のGameFlowControllerをチェック）
            // 注: 現在の実装ではPlantView/FractalPlantView内部で管理
            // 将来的にはPlayingSceneで一元管理することも検討

            // 現状は、PlantView/FractalPlantViewのタイマー終了で
            // gameOver状態に遷移するため、ここでは状態をチェック
            const currentView = this.viewManager.getCurrentView();
            if (currentView && currentView.getPlantState) {
                const plantState = currentView.getPlantState();

                // v1.5.6: cleared状態を最優先でチェック（GameOverより優先）
                if (plantState === 'cleared') {
                    // Clear成功 → ResultSceneへ
                    if (this.resultScene) {
                        this.resultScene.setResult('clear');
                    }
                    this.sceneManager.switchTo('result');
                    return; // v1.5.6: 状態遷移後は処理を中断
                }

                if (plantState === 'gameOver') {
                    // v1.5.5: GameOver → 植物が0に戻ったらResultSceneへ
                    // isResetComplete()メソッドがある場合のみチェック
                    if (currentView.isResetComplete && currentView.isResetComplete()) {
                        if (this.resultScene) {
                            this.resultScene.setResult('gameover');
                        }
                        this.sceneManager.switchTo('result');
                    }
                }
            }
        }
        // 注: audioAnalyzerがnullでもdraw()は呼ばれるため、植物は描画される（音量0として）
    }

    /**
     * 描画処理
     */
    draw(p: p5): void {
        // v1.5.7: WEBGL座標系（中央原点）→ 2D座標系（左上原点）に変換
        // PlantView/FractalPlantViewは2D座標系を前提としている
        p.push();
        p.translate(-p.width / 2, -p.height / 2);

        // ViewManagerに描画を委譲
        this.viewManager.draw(p);

        p.pop();
    }
}
