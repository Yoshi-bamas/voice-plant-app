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
     * v1.5: 現在のViewインスタンスを取得
     */
    getCurrentView(): IView {
        return this.currentView;
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
     * v1.5.7: マイク感度（音量閾値）を一括設定
     * @param threshold - 音量閾値（0.03-0.20）
     */
    setVolumeThreshold(threshold: number): void {
        // PlantView系のみにsetVolumeThresholdを適用
        const view = this.plantView as any;
        if (typeof view.setVolumeThreshold === 'function') {
            view.setVolumeThreshold(threshold);
        }
        const viewEasy = this.plantViewEasy as any;
        if (typeof viewEasy.setVolumeThreshold === 'function') {
            viewEasy.setVolumeThreshold(threshold);
        }
        const fractal = this.fractalPlantView as any;
        if (typeof fractal.setVolumeThreshold === 'function') {
            fractal.setVolumeThreshold(threshold);
        }
        const fractalEasy = this.fractalPlantViewEasy as any;
        if (typeof fractalEasy.setVolumeThreshold === 'function') {
            fractalEasy.setVolumeThreshold(threshold);
        }
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

    /**
     * v1.5: 現在のView（Plant系のみ）の状態を取得
     * @returns PlantState | null（Visualizerの場合はnull）
     */
    getCurrentPlantState(): string | null {
        if (this.currentViewType === 'visualizer') {
            return null;
        }

        // PlantView系にgetPlantStateメソッドがあればそれを呼ぶ
        const view = this.currentView as any;
        if (typeof view.getPlantState === 'function') {
            return view.getPlantState();
        }

        return null;
    }

    /**
     * v1.5: 現在のView（Plant系のみ）の残り時間を取得
     * @returns 残り時間（秒）| null
     */
    getRemainingTime(): number | null {
        if (this.currentViewType === 'visualizer') {
            return null;
        }

        // PlantView系にgetRemainingTimeメソッドがあればそれを呼ぶ
        const view = this.currentView as any;
        if (typeof view.getRemainingTime === 'function') {
            return view.getRemainingTime();
        }

        return null;
    }

    /**
     * v1.5: 現在のView（Plant系のみ）をリセット
     */
    resetCurrentView(): void {
        // PlantView系にresetメソッドがあればそれを呼ぶ
        const view = this.currentView as any;
        if (typeof view.reset === 'function') {
            view.reset();
        }
    }

    /**
     * v1.5: すべてのViewインスタンスをリセット（新規ゲーム開始時）
     */
    reset(): void {
        // すべてのView系にresetメソッドを呼ぶ
        if (typeof (this.plantView as any).reset === 'function') {
            (this.plantView as any).reset();
        }
        if (typeof (this.plantViewEasy as any).reset === 'function') {
            (this.plantViewEasy as any).reset();
        }
        if (typeof (this.fractalPlantView as any).reset === 'function') {
            (this.fractalPlantView as any).reset();
        }
        if (typeof (this.fractalPlantViewEasy as any).reset === 'function') {
            (this.fractalPlantViewEasy as any).reset();
        }
        // VisualizerViewはstatelessなのでリセット不要
    }
}
