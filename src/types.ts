import p5 from 'p5';
import { AudioAnalyzer } from './audio';

/**
 * View インターフェース
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
}
