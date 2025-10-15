import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { IView } from './types';
import { averageFrequencyBands } from './utils';
import { drawCircularVisualizer } from './visualizer';

/**
 * 円形FFTビジュアライザービュークラス
 * 周波数スペクトラムを円形に可視化
 */
export class VisualizerView implements IView {
    private frequencyBands: number[] = [];

    update(audioAnalyzer: AudioAnalyzer): void {
        const bands = audioAnalyzer.getFrequencyBands();
        this.frequencyBands = averageFrequencyBands(bands, 16);
    }

    draw(p: p5): void {
        // v1.5.7: 座標変換は各Scene側で実施（PlayingScene/ChallengePlayingScene）
        drawCircularVisualizer(p, this.frequencyBands);
    }
}
