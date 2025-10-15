/**
 * ChallengeModeView.ts
 * v1.5新規追加: Challenge Mode専用ビュー
 *
 * 【役割】
 * - Plant（中央）+ Visualizer×2（背景）のレイアウト
 * - Voice continuity検出統合
 * - 連続発声必須ルール適用
 */

import p5 from 'p5';
import { IView, PlantState } from '../types';
import { AudioAnalyzer } from '../audio';
import { PlantView } from '../PlantView';
import { VisualizerView } from '../VisualizerView';
import { VoiceContinuityDetector } from '../systems/VoiceContinuityDetector';

/**
 * Challenge Mode専用ビュークラス
 * Plant中央配置、Visualizer×2を背景として配置
 */
export class ChallengeModeView implements IView {
    private plantView: PlantView;
    private visualizerLeft: VisualizerView;
    private visualizerRight: VisualizerView;
    private voiceContinuityDetector: VoiceContinuityDetector;

    constructor() {
        this.plantView = new PlantView();
        this.visualizerLeft = new VisualizerView();
        this.visualizerRight = new VisualizerView();

        // Voice continuity検出: デフォルト値使用（閾値0.15、30フレーム、無敵時間2秒）
        this.voiceContinuityDetector = new VoiceContinuityDetector();
    }

    /**
     * フレーム毎の更新処理（Playing時）
     * v1.5.7: 処理順序を明確化（PlantView更新 → 状態チェック → GameOver判定）
     */
    update(audioAnalyzer: AudioAnalyzer): void {
        const volume = audioAnalyzer.getVolume();

        // Voice continuity検出
        this.voiceContinuityDetector.update(volume);

        // v1.5.7: PlantView更新（Clear判定はここで実行される）
        this.plantView.update(audioAnalyzer);
        this.visualizerLeft.update(audioAnalyzer);
        this.visualizerRight.update(audioAnalyzer);

        // v1.5.7: 状態チェック（Clear成功時はGameOver判定をスキップ）
        const plantState = this.plantView.getPlantState();
        console.log(`[ChallengeModeView] State after update: ${plantState}, VoiceLost: ${this.voiceContinuityDetector.isVoiceLost()}`);

        // growing状態のみ途切れ検出
        if (plantState === 'growing' && this.voiceContinuityDetector.isVoiceLost()) {
            console.log('[ChallengeModeView] Voice lost! Resetting plant...');
            this.plantView.resetPlantHeight();
            this.plantView.transitionToGameOver();
        }

        // v1.5.5: 状態メッセージ更新
        this.updateStatusMessage();
    }

    /**
     * v1.5.5: 状態メッセージ更新
     */
    private updateStatusMessage(): void {
        const messageElement = document.getElementById('challengeStatusMessage');
        if (!messageElement) return;

        const overlay = document.getElementById('challengeStatusOverlay');
        if (!overlay) return;

        const plantState = this.plantView.getPlantState();

        // growing状態のみメッセージ表示
        if (plantState === 'growing') {
            overlay.style.display = 'block';

            if (!this.voiceContinuityDetector.hasStartedVoice()) {
                // 発声未開始: 「発声してください」
                messageElement.textContent = '発声してください';
                messageElement.style.color = '#00ff00';
                messageElement.style.fontSize = '28px';
            } else {
                // 発声開始後: 「発声をキープ！」
                messageElement.textContent = '発声をキープ！';
                messageElement.style.color = '#ffd700';  // 金色
                messageElement.style.fontSize = '36px';
            }
        } else {
            // growing以外は非表示
            overlay.style.display = 'none';
        }
    }

    /**
     * v1.5.1: プレビューモード用更新（Idle時）
     * 音量に応じて植物が揺れ動く（成長なし、EasyMode相当）
     */
    updatePreview(audioAnalyzer: AudioAnalyzer): void {
        const volume = audioAnalyzer.getVolume();
        const frequencyData = audioAnalyzer.getFrequency();

        // PlantViewに音量を直接反映（EasyMode相当の増幅）
        this.plantView.setPreviewHeight(volume);

        // Visualizer更新
        this.visualizerLeft.update(audioAnalyzer);
        this.visualizerRight.update(audioAnalyzer);
    }

    /**
     * 描画処理
     * Visualizer×2（背景、半透明） → Plant（中央、メイン）
     */
    draw(p: p5): void {
        // 背景Visualizer描画（Plant より先に描画）
        this.drawVisualizerLeft(p);
        this.drawVisualizerRight(p);

        // メインPlant描画（中央）
        this.drawPlantCenter(p);
    }

    /**
     * 左上Visualizer描画
     * v1.5.7: VisualizerViewは座標変換なしなので、ここでWEBGL→2D変換+配置を行う
     */
    private drawVisualizerLeft(p: p5): void {
        p.push();

        // WEBGL座標系（中央原点）→ 2D座標系（左上原点）に変換
        p.translate(-p.width / 2, -p.height / 2);

        // 縮小（元サイズ800x600 → 200x150相当）
        p.scale(0.25);

        // 左上へ配置（2D座標系で 0, 0 = 左上）
        p.translate(0, 0);

        // 半透明（opacity 0.5）
        // Note: p5.js WEBGLモードではtint()が効かない場合があるため、
        // Visualizer側で透明度を制御することも検討
        p.tint(255, 128);

        this.visualizerLeft.draw(p);

        p.pop();
    }

    /**
     * 右下Visualizer描画
     * v1.5.7: VisualizerViewは座標変換なしなので、ここでWEBGL→2D変換+配置を行う
     */
    private drawVisualizerRight(p: p5): void {
        p.push();

        // WEBGL座標系（中央原点）→ 2D座標系（左上原点）に変換
        p.translate(-p.width / 2, -p.height / 2);

        // 縮小（元サイズ800x600 → 200x150相当）
        p.scale(0.25);

        // 右下へ配置（2D座標系で 2400, 1800 = 画面右下、scale後の座標）
        p.translate(2400, 1800);

        // 半透明
        p.tint(255, 128);

        this.visualizerRight.draw(p);

        p.pop();
    }

    /**
     * 中央Plant描画
     * PlantViewは2D座標系（左上原点）を前提としているため、WEBGL座標を変換
     */
    private drawPlantCenter(p: p5): void {
        p.push();

        // WEBGL座標系（中央原点）→ 2D座標系（左上原点）に変換
        p.translate(-p.width / 2, -p.height / 2);

        this.plantView.draw(p);

        p.pop();
    }

    /**
     * Plant状態取得（ResultScene用）
     */
    getPlantState(): PlantState {
        return this.plantView.getPlantState();
    }

    /**
     * Clear閾値設定
     */
    setClearThreshold(threshold: number): void {
        this.plantView.setClearThreshold(threshold);
    }

    /**
     * リセット処理
     */
    reset(): void {
        this.plantView.reset();
        this.voiceContinuityDetector.reset();
    }

    /**
     * 残り時間取得（Challenge Modeではタイマーなし、常にnull）
     */
    getRemainingTime(): number | null {
        return this.plantView.getRemainingTime();
    }

    /**
     * v1.5.5: リセットアニメーション完了チェック
     */
    isResetComplete(): boolean {
        return this.plantView.isResetComplete();
    }

    /**
     * v1.5.7: マイク感度（音量閾値）を設定
     * PlantViewとVoiceContinuityDetectorの両方に適用
     * @param threshold - 音量閾値（0.03-0.20）
     */
    setVolumeThreshold(threshold: number): void {
        // PlantViewの成長閾値を更新
        if (typeof (this.plantView as any).setVolumeThreshold === 'function') {
            (this.plantView as any).setVolumeThreshold(threshold);
        }

        // VoiceContinuityDetectorの閾値も更新
        this.voiceContinuityDetector.setVolumeThreshold(threshold);
    }
}
