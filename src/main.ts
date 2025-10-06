import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { ViewManager } from './ViewManager';

let audioAnalyzer: AudioAnalyzer | null = null;
let viewManager: ViewManager | null = null;
let isStarted = false;

const sketch = (p: p5) => {
    p.setup = () => {
        const canvas = p.createCanvas(800, 600);
        canvas.parent('container');
        canvas.id('canvas');

        // ViewManagerを初期化
        viewManager = new ViewManager();

        const startButton = document.getElementById('startButton');
        const viewButtons = document.getElementById('viewButtons');
        const easyModeContainer = document.getElementById('easyModeContainer');
        const easyModeToggle = document.getElementById('easyModeToggle') as HTMLInputElement;
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

                    // View切り替えボタンとEasy Modeトグルを表示
                    if (viewButtons) {
                        viewButtons.classList.remove('view-buttons--hidden');
                    }
                    if (easyModeContainer) {
                        easyModeContainer.classList.remove('easy-mode-container--hidden');
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
    };

    p.draw = () => {
        p.background(20);

        if (!isStarted || !audioAnalyzer || !viewManager) {
            return;
        }

        // ViewManagerを更新・描画
        viewManager.update(audioAnalyzer);
        viewManager.draw(p);
    };
};

new p5(sketch);
