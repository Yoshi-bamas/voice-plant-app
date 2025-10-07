import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { ViewManager } from './ViewManager';

let audioAnalyzer: AudioAnalyzer | null = null;
let viewManager: ViewManager | null = null;
let isStarted = false;

const sketch = (p: p5) => {
    p.setup = () => {
        const canvas = p.createCanvas(800, 600);
        canvas.parent('canvasArea');
        canvas.id('canvas');

        // v1.1.1: インラインstyleで強制設定（CSSの!importantが効かないため）
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
        if (canvasElement) {
            canvasElement.style.width = '800px';
            canvasElement.style.height = '600px';
            canvasElement.style.display = 'block';
        }

        // ViewManagerを初期化
        viewManager = new ViewManager();

        const startButton = document.getElementById('startButton');
        const consoleArea = document.getElementById('consoleArea');
        const easyModeToggle = document.getElementById('easyModeToggle') as HTMLInputElement;
        const clearThresholdSlider = document.getElementById('clearThresholdSlider') as HTMLInputElement;
        const clearThresholdValue = document.getElementById('clearThresholdValue');
        const plantButton = document.getElementById('plantButton');
        const visualizerButton = document.getElementById('visualizerButton');
        const fractalButton = document.getElementById('fractalButton');

        if (startButton) {
            startButton.addEventListener('click', async () => {
                try {
                    audioAnalyzer = new AudioAnalyzer();
                    await audioAnalyzer.initialize();
                    isStarted = true;
                    startButton.classList.add('start-button--hidden');

                    // コンソールエリアを表示
                    if (consoleArea) {
                        consoleArea.classList.remove('console-area--hidden');
                    }
                } catch (error) {
                    console.error('マイク初期化エラー:', error);
                    alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
                }
            });
        }

        // Plant ボタン
        if (plantButton) {
            plantButton.addEventListener('click', () => {
                if (viewManager) {
                    viewManager.switchView('plant');
                    plantButton.classList.add('view-button--active');
                    visualizerButton?.classList.remove('view-button--active');
                    fractalButton?.classList.remove('view-button--active');
                }
            });
        }

        // Visualizer ボタン
        if (visualizerButton) {
            visualizerButton.addEventListener('click', () => {
                if (viewManager) {
                    viewManager.switchView('visualizer');
                    visualizerButton.classList.add('view-button--active');
                    plantButton?.classList.remove('view-button--active');
                    fractalButton?.classList.remove('view-button--active');
                }
            });
        }

        // Fractal ボタン
        if (fractalButton) {
            fractalButton.addEventListener('click', () => {
                if (viewManager) {
                    viewManager.switchView('fractal');
                    fractalButton.classList.add('view-button--active');
                    plantButton?.classList.remove('view-button--active');
                    visualizerButton?.classList.remove('view-button--active');
                }
            });
        }

        // Easy Mode トグル
        if (easyModeToggle) {
            easyModeToggle.addEventListener('change', () => {
                if (viewManager) {
                    viewManager.setEasyMode(easyModeToggle.checked);
                }
            });
        }

        // v1.0: Clearラインスライダー
        if (clearThresholdSlider && clearThresholdValue) {
            clearThresholdSlider.addEventListener('input', () => {
                const value = parseInt(clearThresholdSlider.value) / 100; // 50-100 → 0.5-1.0
                clearThresholdValue.textContent = value.toFixed(2);
                if (viewManager) {
                    viewManager.setClearThreshold(value);
                }
            });
        }
    };

    p.draw = () => {
        p.background(20);

        if (!isStarted || !audioAnalyzer || !viewManager) {
            return;
        }

        // ViewManagerを更新・描画
        viewManager.update(audioAnalyzer);
        viewManager.draw(p);

        // v1.0: コンソールにリアルタイム情報表示
        updateConsoleData(audioAnalyzer);
    };
};

/**
 * v1.0: コンソールにリアルタイム情報を更新
 */
function updateConsoleData(audioAnalyzer: AudioAnalyzer): void {
    const volumeValue = document.getElementById('volumeValue');
    const frequencyValue = document.getElementById('frequencyValue');

    if (volumeValue) {
        volumeValue.textContent = audioAnalyzer.getVolume().toFixed(3);
    }

    if (frequencyValue) {
        const freq = audioAnalyzer.getFrequency();
        frequencyValue.textContent = freq.average.toFixed(3);
    }
}

new p5(sketch);
