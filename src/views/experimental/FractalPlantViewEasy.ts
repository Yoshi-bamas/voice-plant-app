import { AudioAnalyzer } from '../../audio';
import { FractalPlantView } from './FractalPlantView';
import { amplifyVolume } from '../../utils';

/**
 * フラクタル植物ビュークラス（Easy Mode）
 * 音量を10倍に増幅して小さい声でも成長しやすく
 */
export class FractalPlantViewEasy extends FractalPlantView {
    private readonly amplification: number = 10.0;

    update(audioAnalyzer: AudioAnalyzer): void {
        const rawVolume = audioAnalyzer.getVolume();
        const frequencyData = audioAnalyzer.getFrequency();

        // 音量を増幅
        const amplifiedVolume = amplifyVolume(rawVolume, this.amplification);

        // 増幅された音量でAudioAnalyzerをモック
        const mockAnalyzer = {
            getVolume: () => amplifiedVolume,
            getFrequency: () => frequencyData,
            getFrequencyBands: () => audioAnalyzer.getFrequencyBands()
        } as AudioAnalyzer;

        // 親クラスのupdate()を呼び出してClear!判定を実行
        super.update(mockAnalyzer);
    }
}
