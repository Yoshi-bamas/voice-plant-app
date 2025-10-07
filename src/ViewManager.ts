import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { IView } from './types';
import { PlantView } from './PlantView';
import { PlantViewEasy } from './PlantViewEasy';
import { VisualizerView } from './VisualizerView';
import { FractalPlantView } from './views/experimental/FractalPlantView';
import { FractalPlantViewEasy } from './views/experimental/FractalPlantViewEasy';

/**
 * View管理クラス
 * PlantView, VisualizerView, FractalPlantViewを切り替え
 * Easy Modeで音量増幅版に切り替え可能
 */
export class ViewManager {
    private currentView: IView;

    // 通常モード
    private plantView: PlantView;
    private visualizerView: VisualizerView;
    private fractalPlantView: FractalPlantView;

    // Easy モード
    private plantViewEasy: PlantViewEasy;
    private fractalPlantViewEasy: FractalPlantViewEasy;

    private currentViewType: 'plant' | 'visualizer' | 'fractal' = 'plant';
    private isEasyMode: boolean = false;

    constructor() {
        this.plantView = new PlantView();
        this.plantViewEasy = new PlantViewEasy();
        this.visualizerView = new VisualizerView();
        this.fractalPlantView = new FractalPlantView();
        this.fractalPlantViewEasy = new FractalPlantViewEasy();
        this.currentView = this.plantView;
    }

    /**
     * Viewを切り替え
     * @param viewType - 'plant', 'visualizer', または 'fractal'
     */
    switchView(viewType: 'plant' | 'visualizer' | 'fractal'): void {
        this.currentViewType = viewType;
        this.updateCurrentView();
    }

    /**
     * Easy Modeを切り替え
     * @param enabled - trueでEasy Mode有効
     */
    setEasyMode(enabled: boolean): void {
        this.isEasyMode = enabled;
        this.updateCurrentView();
    }

    /**
     * 現在のViewを更新（内部用）
     */
    private updateCurrentView(): void {
        if (this.currentViewType === 'plant') {
            this.currentView = this.isEasyMode ? this.plantViewEasy : this.plantView;
        } else if (this.currentViewType === 'visualizer') {
            this.currentView = this.visualizerView; // Visualizerは常に通常モード
        } else if (this.currentViewType === 'fractal') {
            this.currentView = this.isEasyMode ? this.fractalPlantViewEasy : this.fractalPlantView;
        }
    }

    /**
     * 現在のViewタイプを取得
     */
    getCurrentViewType(): 'plant' | 'visualizer' | 'fractal' {
        return this.currentViewType;
    }

    /**
     * Easy Modeが有効かどうか
     */
    isEasyModeEnabled(): boolean {
        return this.isEasyMode;
    }

    /**
     * v1.0: Clearライン目標値を一括設定
     * @param threshold - 目標値（0.5-1.0）
     */
    setClearThreshold(threshold: number): void {
        // PlantView系のみにsetClearThresholdを適用（VisualizerViewには不要）
        this.plantView.setClearThreshold?.(threshold);
        this.plantViewEasy.setClearThreshold?.(threshold);
        this.fractalPlantView.setClearThreshold?.(threshold);
        this.fractalPlantViewEasy.setClearThreshold?.(threshold);
    }

    /**
     * 現在のViewを更新
     */
    update(audioAnalyzer: AudioAnalyzer): void {
        this.currentView.update(audioAnalyzer);
    }

    /**
     * 現在のViewを描画
     */
    draw(p: p5): void {
        this.currentView.draw(p);
    }
}
