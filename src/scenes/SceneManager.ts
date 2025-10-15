/**
 * SceneManager.ts
 * v1.4新規追加: シーン管理システム
 *
 * 【役割】
 * - ゲームフローを4つのシーンで管理
 * - シーン切り替え時のonExit/onEnter呼び出し
 * - 現在のシーンへの更新・描画委譲
 */

import p5 from 'p5';
import { IScene } from '../types';
import { AudioAnalyzer } from '../audio';

export type SceneType =
    | 'modeSelect'           // v1.5: モード選択画面
    | 'testIdle'             // v1.5: Test Mode初期画面
    | 'challengeIdle'        // v1.5: Challenge Mode初期画面
    | 'idle'                 // 既存（後方互換、非推奨）
    | 'message'
    | 'opening'
    | 'countdown'
    | 'playing'              // Test Mode用
    | 'challengePlaying'     // v1.5: Challenge Mode用
    | 'result';

export type GameMode = 'test' | 'challenge';

/**
 * シーンマネージャークラス
 * 複数のシーンを管理し、切り替えを制御
 * v1.5: mode context追加（Test/Challenge Mode管理）
 */
export class SceneManager {
    private currentScene: IScene | null = null;
    private currentSceneType: SceneType | null = null;
    private currentMode: GameMode = 'test';  // v1.5: デフォルトはTest Mode
    private scenes: Map<SceneType, IScene> = new Map();

    /**
     * シーンを登録
     * @param type - シーン種別
     * @param scene - シーンインスタンス
     */
    addScene(type: SceneType, scene: IScene): void {
        this.scenes.set(type, scene);
    }

    /**
     * シーンを切り替え
     * @param type - 切り替え先のシーン種別
     */
    switchTo(type: SceneType): void {
        const nextScene = this.scenes.get(type);
        if (!nextScene) {
            console.error(`Scene not found: ${type}`);
            return;
        }

        // 現在のシーンの終了処理
        if (this.currentScene) {
            this.currentScene.onExit();
        }

        // 次のシーンに切り替え
        this.currentScene = nextScene;
        this.currentSceneType = type;
        this.currentScene.onEnter();

        console.log(`[SceneManager] Switched to: ${type}`);
    }

    /**
     * 現在のシーンを更新
     * @param audioAnalyzer - オーディオアナライザー（オプショナル）
     */
    update(audioAnalyzer?: AudioAnalyzer): void {
        if (this.currentScene) {
            this.currentScene.update(audioAnalyzer);
        }
    }

    /**
     * 現在のシーンを描画
     * @param p - p5インスタンス
     */
    draw(p: p5): void {
        if (this.currentScene) {
            this.currentScene.draw(p);
        }
    }

    /**
     * 現在のシーンを取得（デバッグ用）
     * @returns 現在のシーンインスタンス
     */
    getCurrentScene(): IScene | null {
        return this.currentScene;
    }

    /**
     * v1.4: 現在のシーン名を取得
     * @returns 現在のシーン種別
     */
    getCurrentSceneName(): SceneType | null {
        return this.currentSceneType;
    }

    /**
     * v1.5: ゲームモードを設定
     * @param mode - ゲームモード ('test' | 'challenge')
     */
    setMode(mode: GameMode): void {
        this.currentMode = mode;
        console.log(`[SceneManager] Mode set to: ${mode}`);
    }

    /**
     * v1.5: 現在のゲームモードを取得
     * @returns 現在のゲームモード
     */
    getMode(): GameMode {
        return this.currentMode;
    }
}
