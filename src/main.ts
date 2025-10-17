import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { ViewManager } from './ViewManager';
import { SceneManager } from './scenes/SceneManager';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { TestIdleScene } from './scenes/TestIdleScene';
import { ChallengeIdleScene } from './scenes/ChallengeIdleScene';
import { IdleScene } from './scenes/IdleScene';
import { MessageScene } from './scenes/MessageScene';
import { OpeningScene } from './scenes/OpeningScene';
import { CountdownScene } from './scenes/CountdownScene';
import { PlayingScene } from './scenes/PlayingScene';
import { ChallengePlayingScene } from './scenes/ChallengePlayingScene';
import { ResultScene } from './scenes/ResultScene';
import { SoundManager } from './systems/SoundManager';  // v1.5.8

let audioAnalyzer: AudioAnalyzer | null = null;
let viewManager: ViewManager | null = null;
let sceneManager: SceneManager | null = null;
let soundManager: SoundManager | null = null;  // v1.5.8
let isAudioInitialized = false;

// v1.5.1: マイク初期化関数（グローバル、シーンから呼び出し可能）
// v1.5.8: SoundManager初期化も追加
async function initializeAudioGlobal(): Promise<void> {
    if (!isAudioInitialized) {
        try {
            audioAnalyzer = new AudioAnalyzer();
            await audioAnalyzer.initialize();
            isAudioInitialized = true;
            console.log('[main.ts] AudioAnalyzer initialized');

            // v1.5.8: SoundManagerを初期化（同じAudioContextを使用）
            const audioContext = audioAnalyzer.getAudioContext();
            if (audioContext) {
                soundManager = new SoundManager(audioContext);
                if (sceneManager) {
                    sceneManager.setSoundManager(soundManager);
                }
                // 効果音をプリロード（非同期、エラー無視）
                soundManager.preload(['click', 'countdown', 'start', 'clear', 'gameover']).catch((error) => {
                    console.warn('[main.ts] Sound preload failed (non-critical):', error);
                });
            }
        } catch (error) {
            console.error('マイク初期化エラー:', error);
            alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
            throw error;
        }
    }
}

const sketch = (p: p5) => {
    p.setup = () => {
        // v1.2: WEBGLモードに変更（GPU並列処理で粒子数増強）
        const canvas = p.createCanvas(800, 600, p.WEBGL);
        canvas.parent('canvasArea');
        canvas.id('canvas');

        // v1.5.7: WEBGLモードでtext()警告を防ぐためフォント設定
        p.textFont('Courier New');

        // v1.5.2: WEBGLモードではloadFont()が必要だが、重いためHTML要素で対応

        // v1.1.1: インラインstyleで強制設定（CSSの!importantが効かないため）
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
        if (canvasElement) {
            canvasElement.style.width = '800px';
            canvasElement.style.height = '600px';
            canvasElement.style.display = 'block';
        }

        // v1.4: ViewManagerを初期化（PlayingSceneで使用）
        viewManager = new ViewManager();

        // v1.4: SceneManagerを初期化
        sceneManager = new SceneManager();

        // v1.5: 各シーンを作成して登録
        const resultScene = new ResultScene(sceneManager);
        const playingScene = new PlayingScene(sceneManager, viewManager, resultScene);
        const challengePlayingScene = new ChallengePlayingScene(sceneManager, resultScene);
        const countdownScene = new CountdownScene(sceneManager);
        const messageScene = new MessageScene(sceneManager);
        const modeSelectScene = new ModeSelectScene(sceneManager);
        const testIdleScene = new TestIdleScene(sceneManager);
        const challengeIdleScene = new ChallengeIdleScene(sceneManager);
        const idleScene = new IdleScene(sceneManager);  // 後方互換用
        const openingScene = new OpeningScene(sceneManager);  // 後方互換用

        // v1.5: Mode System統合
        sceneManager.addScene('modeSelect', modeSelectScene);
        sceneManager.addScene('testIdle', testIdleScene);
        sceneManager.addScene('challengeIdle', challengeIdleScene);
        sceneManager.addScene('idle', idleScene);  // 後方互換
        sceneManager.addScene('message', messageScene);
        sceneManager.addScene('opening', openingScene);  // 後方互換
        sceneManager.addScene('countdown', countdownScene);
        sceneManager.addScene('playing', playingScene);
        sceneManager.addScene('challengePlaying', challengePlayingScene);
        sceneManager.addScene('result', resultScene);

        // v1.5: 初期シーンをModeSelectに設定
        sceneManager.switchTo('modeSelect');

        const startButton = document.getElementById('startButton');
        const consoleArea = document.getElementById('consoleArea');
        const easyModeToggle = document.getElementById('easyModeToggle') as HTMLInputElement;
        const clearThresholdSlider = document.getElementById('clearThresholdSlider') as HTMLInputElement;
        const clearThresholdValue = document.getElementById('clearThresholdValue');
        const sensitivitySlider = document.getElementById('sensitivitySlider') as HTMLInputElement;
        const sensitivityValue = document.getElementById('sensitivityValue');
        const plantButton = document.getElementById('plantButton');
        const visualizerButton = document.getElementById('visualizerButton');
        const fractalButton = document.getElementById('fractalButton');
        const backButton = document.getElementById('backButton');

        // v1.4: Startボタン（OpeningSceneが管理するが、ここでマイク初期化）
        // v1.5.8: SoundManager初期化も追加
        if (startButton) {
            startButton.addEventListener('click', async () => {
                if (!isAudioInitialized) {
                    try {
                        audioAnalyzer = new AudioAnalyzer();
                        await audioAnalyzer.initialize();
                        isAudioInitialized = true;
                        console.log('[main.ts] AudioAnalyzer initialized');

                        // v1.5.8: SoundManagerを初期化
                        const audioContext = audioAnalyzer.getAudioContext();
                        if (audioContext) {
                            soundManager = new SoundManager(audioContext);
                            if (sceneManager) {
                                sceneManager.setSoundManager(soundManager);
                            }
                            soundManager.preload(['click', 'countdown', 'start', 'clear', 'gameover']).catch((error) => {
                                console.warn('[main.ts] Sound preload failed (non-critical):', error);
                            });
                        }
                    } catch (error) {
                        console.error('マイク初期化エラー:', error);
                        alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
                    }
                }
            });
        }

        // Plant ボタン
        if (plantButton) {
            plantButton.addEventListener('click', () => {
                soundManager?.playSE('click');  // v1.5.8: クリック音
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
                soundManager?.playSE('click');  // v1.5.8: クリック音
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
                soundManager?.playSE('click');  // v1.5.8: クリック音
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

        // v1.6: マイク感度スライダー（対数スケール、中央0.05）
        if (sensitivitySlider && sensitivityValue) {
            sensitivitySlider.addEventListener('input', () => {
                const sliderValue = parseInt(sensitivitySlider.value); // 0-100

                // 対数スケール変換: 0-100 → 0.005-0.15（中央50で0.05）
                // log10(0.005) = -2.301, log10(0.15) = -0.824
                // 線形補間: y = 10^(a + (b-a) * x/100)
                const minLog = Math.log10(0.005);  // -2.301
                const maxLog = Math.log10(0.15);   // -0.824
                const logValue = minLog + (maxLog - minLog) * (sliderValue / 100);
                const value = Math.pow(10, logValue);

                sensitivityValue.textContent = value.toFixed(3);
                if (viewManager) {
                    viewManager.setVolumeThreshold(value);
                }
                if (challengePlayingScene) {
                    challengePlayingScene.setVolumeThreshold(value);
                }
            });
        }

        // v1.3: Backボタン（GameOver/Clear後の再スタート）
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (viewManager) {
                    viewManager.resetCurrentView();
                    backButton.classList.add('back-button--hidden');
                }
            });
        }

        // v1.5.1: Canvas内クリック判定（ModeSelect/ChallengeIdle用）
        p.mousePressed = () => {
            if (!sceneManager) return;

            const currentSceneName = sceneManager.getCurrentSceneName();

            // ModeSelectSceneのクリック判定（v1.5.2: Challenge Mode選択時にマイク初期化）
            if (currentSceneName === 'modeSelect') {
                modeSelectScene.handleMouseClick(p.mouseX, p.mouseY, initializeAudioGlobal);
            }

            // ChallengeIdleSceneのクリック判定
            if (currentSceneName === 'challengeIdle') {
                challengeIdleScene.handleMouseClick(p.mouseX, p.mouseY, initializeAudioGlobal);
            }
        };
    };

    p.draw = () => {
        p.background(20);

        // v1.4: SceneManagerに描画を委譲
        if (!sceneManager) {
            return;
        }

        // v1.5.1: シーン別ライティング制御（ModeSelect/ChallengeIdleではライトなし）
        const currentScene = sceneManager.getCurrentSceneName();
        if (currentScene !== 'modeSelect' && currentScene !== 'challengeIdle') {
            // v1.2: WebGLライティング設定（3D球体を美しく）
            p.ambientLight(60, 60, 60);  // 環境光（全体的な明るさ）
            p.pointLight(255, 255, 255, 0, 0, 200);  // 点光源（手前から）
        }

        // v1.4: SceneManagerを更新・描画
        sceneManager.update(audioAnalyzer ?? undefined);
        sceneManager.draw(p);

        // v1.0: コンソールにリアルタイム情報表示（PlayingScene時のみ）
        if (viewManager && audioAnalyzer && isAudioInitialized) {
            updateConsoleData(audioAnalyzer, viewManager);
        }
    };
};

/**
 * v1.0: コンソールにリアルタイム情報を更新
 * v1.3: タイマー表示追加
 */
function updateConsoleData(audioAnalyzer: AudioAnalyzer, viewManager: ViewManager): void {
    const volumeValue = document.getElementById('volumeValue');
    const frequencyValue = document.getElementById('frequencyValue');
    const stateValue = document.getElementById('stateValue');
    const timeValue = document.getElementById('timeValue');
    const backButton = document.getElementById('backButton');

    if (volumeValue) {
        volumeValue.textContent = audioAnalyzer.getVolume().toFixed(3);
    }

    if (frequencyValue) {
        const freq = audioAnalyzer.getFrequency();
        frequencyValue.textContent = freq.average.toFixed(3);
    }

    // v1.4: Playing中のみPlantState表示、それ以外はシーン名表示
    const plantState = viewManager.getCurrentPlantState();
    if (stateValue) {
        const currentSceneName = sceneManager?.getCurrentSceneName();
        if (currentSceneName === 'playing') {
            stateValue.textContent = plantState ?? 'N/A';
        } else {
            stateValue.textContent = currentSceneName ?? '--';
        }
    }

    // v1.3: タイマー表示
    if (timeValue) {
        const remainingTime = viewManager.getRemainingTime();
        if (remainingTime !== null) {
            timeValue.textContent = `${remainingTime}s`;
        } else {
            timeValue.textContent = '--';
        }
    }

    // v1.3: Backボタン表示制御（GameOver or Cleared時に表示）
    if (backButton) {
        if (plantState === 'gameOver' || plantState === 'cleared') {
            backButton.classList.remove('back-button--hidden');
        } else {
            backButton.classList.add('back-button--hidden');
        }
    }
}

new p5(sketch);
