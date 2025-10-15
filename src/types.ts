import p5 from 'p5';
import { AudioAnalyzer } from './audio';

/**
 * 植物の状態（v1.0新規追加、v1.3拡張）
 * - growing: 成長中（音量入力で高さ変化）
 * - cleared: クリア済み（完成状態維持、継続エフェクトのみ）
 * - gameOver: ゲームオーバー（制限時間内に到達できず）
 */
export type PlantState = 'growing' | 'cleared' | 'gameOver';

/**
 * ゲーム全体の状態（v1.4新規追加）
 * - opening: オープニング画面
 * - countdown: カウントダウン演出（3→2→1→START!）
 * - playing: ゲームプレイ中
 * - result: 結果表示（Clear/GameOver）
 */
export type GameState = 'opening' | 'countdown' | 'playing' | 'result';

/**
 * ゲーム結果（v1.4新規追加）
 * - clear: クリア成功
 * - gameover: ゲームオーバー
 */
export type GameResult = 'clear' | 'gameover';

/**
 * View インターフェース（v1.0拡張版）
 * 植物ビューとビジュアライザービューの共通インターフェース
 */
export interface IView {
    /**
     * Viewの更新処理
     * @param audioAnalyzer - オーディオアナライザー
     */
    update(audioAnalyzer: AudioAnalyzer): void;

    /**
     * Viewの描画処理
     * @param p - p5インスタンス
     */
    draw(p: p5): void;

    /**
     * Clearライン目標値を設定（v1.0新規追加、オプショナル）
     * VisualizerViewはClear機能がないため実装不要
     * @param threshold - 目標値（0.5-1.0）
     */
    setClearThreshold?(threshold: number): void;

    /**
     * 植物の状態を取得（v1.0新規追加、オプショナル）
     * PlantView/FractalPlantViewのみ実装
     */
    getPlantState?(): PlantState;

    /**
     * ビューをリセット（v1.3新規追加、オプショナル）
     * PlantView/FractalPlantViewのみ実装
     */
    reset?(): void;

    /**
     * 残り時間を取得（v1.3新規追加、オプショナル）
     * PlantView/FractalPlantViewのみ実装
     * @returns 残り時間（秒）、制限なしの場合はnull
     */
    getRemainingTime?(): number | null;

    /**
     * v1.5.5: リセットアニメーション完了チェック（オプショナル）
     * PlantViewのみ実装
     * @returns true: リセット完了, false: リセット中
     */
    isResetComplete?(): boolean;
}

/**
 * シーンインターフェース（v1.4新規追加）
 * ゲームフロー管理のための抽象シーン
 */
export interface IScene {
    /**
     * シーン更新処理
     * @param audioAnalyzer - オーディオアナライザー（オプショナル）
     */
    update(audioAnalyzer?: AudioAnalyzer): void;

    /**
     * シーン描画処理
     * @param p - p5インスタンス
     */
    draw(p: p5): void;

    /**
     * シーン開始時の処理
     */
    onEnter(): void;

    /**
     * シーン終了時の処理
     */
    onExit(): void;
}
