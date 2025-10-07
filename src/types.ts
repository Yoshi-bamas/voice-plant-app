import p5 from 'p5';
import { AudioAnalyzer } from './audio';

/**
 * 植物の状態（v1.0新規追加）
 * - growing: 成長中（音量入力で高さ変化）
 * - cleared: クリア済み（完成状態維持、継続エフェクトのみ）
 */
export type PlantState = 'growing' | 'cleared';

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
}
