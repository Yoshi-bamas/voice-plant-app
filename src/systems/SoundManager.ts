/**
 * SoundManager.ts
 * v1.5.8: サウンドエフェクト＆BGM管理システム
 *
 * 【役割】
 * - Web Audio APIによる効果音・BGM再生
 * - 音量調整（BGM/SE個別）
 * - プリロード機能（遅延ゼロ再生）
 * - 複数SE同時再生対応
 */

export type SoundType =
    // 効果音
    | 'click'          // ボタンクリック
    | 'countdown'      // カウントダウン（3,2,1）
    | 'start'          // ゲーム開始
    | 'clear'          // Clear達成
    | 'gameover'       // GameOver
    // BGM（将来用）
    | 'bgm_playing'    // ゲームプレイ中BGM
    | 'bgm_result';    // リザルトBGM

interface SoundConfig {
    path: string;
    volume: number;  // 0.0 - 1.0
    loop?: boolean;
}

export class SoundManager {
    private audioContext: AudioContext;
    private buffers: Map<SoundType, AudioBuffer> = new Map();
    private bgmSource: AudioBufferSourceNode | null = null;
    private bgmGainNode: GainNode;
    private seGainNode: GainNode;

    // 音量設定
    private bgmVolume: number = 0.3;  // BGM音量（デフォルト30%）
    private seVolume: number = 0.7;   // SE音量（デフォルト70%）

    // サウンド設定
    private readonly sounds: Record<SoundType, SoundConfig> = {
        // 効果音
        click:      { path: '/public/sounds/click.mp3', volume: 0.5 },
        countdown:  { path: '/public/sounds/countdown.mp3', volume: 0.6 },
        start:      { path: '/public/sounds/start.mp3', volume: 0.7 },
        clear:      { path: '/public/sounds/clear.mp3', volume: 0.8 },
        gameover:   { path: '/public/sounds/gameover.mp3', volume: 0.7 },
        // BGM（将来用）
        bgm_playing: { path: '/public/sounds/bgm_playing.mp3', volume: 0.3, loop: true },
        bgm_result:  { path: '/public/sounds/bgm_result.mp3', volume: 0.3, loop: true },
    };

    /**
     * コンストラクタ
     * @param audioContext - 既存のAudioContext（マイク入力と共有）
     */
    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;

        // GainNode作成（音量調整用）
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.gain.value = this.bgmVolume;
        this.bgmGainNode.connect(this.audioContext.destination);

        this.seGainNode = this.audioContext.createGain();
        this.seGainNode.gain.value = this.seVolume;
        this.seGainNode.connect(this.audioContext.destination);

        console.log('[SoundManager] Initialized');
    }

    /**
     * サウンドファイルをプリロード
     * @param soundTypes - プリロードするサウンドの配列
     */
    async preload(soundTypes: SoundType[]): Promise<void> {
        console.log(`[SoundManager] Preloading ${soundTypes.length} sounds...`);

        const promises = soundTypes.map(async (type) => {
            const config = this.sounds[type];
            if (!config) {
                console.warn(`[SoundManager] Sound config not found: ${type}`);
                return;
            }

            try {
                const response = await fetch(config.path);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.buffers.set(type, audioBuffer);
                console.log(`[SoundManager] Loaded: ${type}`);
            } catch (error) {
                console.error(`[SoundManager] Failed to load ${type}:`, error);
            }
        });

        await Promise.all(promises);
        console.log('[SoundManager] Preload complete');
    }

    /**
     * 効果音を再生
     * @param type - サウンドタイプ
     * @param volumeScale - 音量倍率（0.0-1.0、デフォルト1.0）
     */
    playSE(type: SoundType, volumeScale: number = 1.0): void {
        const buffer = this.buffers.get(type);
        if (!buffer) {
            console.warn(`[SoundManager] Sound not loaded: ${type}`);
            return;
        }

        const config = this.sounds[type];
        if (!config) return;

        // AudioBufferSourceNodeを作成（再生ごとに新規作成が必要）
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // 個別音量調整用のGainNodeを作成
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = config.volume * volumeScale;

        // 接続: source → gainNode → seGainNode → destination
        source.connect(gainNode);
        gainNode.connect(this.seGainNode);

        // 再生
        source.start(0);
        console.log(`[SoundManager] Playing SE: ${type}`);
    }

    /**
     * BGMを再生（ループ）
     * @param type - BGMタイプ
     */
    playBGM(type: SoundType): void {
        // 既存のBGMを停止
        this.stopBGM();

        const buffer = this.buffers.get(type);
        if (!buffer) {
            console.warn(`[SoundManager] BGM not loaded: ${type}`);
            return;
        }

        const config = this.sounds[type];
        if (!config) return;

        // BGM用ソースノード作成
        this.bgmSource = this.audioContext.createBufferSource();
        this.bgmSource.buffer = buffer;
        this.bgmSource.loop = config.loop || false;

        // 接続: bgmSource → bgmGainNode → destination
        this.bgmSource.connect(this.bgmGainNode);

        // 再生
        this.bgmSource.start(0);
        console.log(`[SoundManager] Playing BGM: ${type}`);
    }

    /**
     * BGMを停止
     */
    stopBGM(): void {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (error) {
                // 既に停止している場合のエラーを無視
            }
            this.bgmSource.disconnect();
            this.bgmSource = null;
            console.log('[SoundManager] BGM stopped');
        }
    }

    /**
     * BGM音量を設定
     * @param volume - 音量（0.0-1.0）
     */
    setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        this.bgmGainNode.gain.value = this.bgmVolume;
        console.log(`[SoundManager] BGM volume: ${this.bgmVolume}`);
    }

    /**
     * SE音量を設定
     * @param volume - 音量（0.0-1.0）
     */
    setSEVolume(volume: number): void {
        this.seVolume = Math.max(0, Math.min(1, volume));
        this.seGainNode.gain.value = this.seVolume;
        console.log(`[SoundManager] SE volume: ${this.seVolume}`);
    }

    /**
     * BGM音量を取得
     */
    getBGMVolume(): number {
        return this.bgmVolume;
    }

    /**
     * SE音量を取得
     */
    getSEVolume(): number {
        return this.seVolume;
    }

    /**
     * BGMフェードイン
     * @param duration - フェード時間（秒）
     */
    fadeInBGM(duration: number = 2.0): void {
        if (!this.bgmSource) return;

        this.bgmGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.bgmGainNode.gain.linearRampToValueAtTime(
            this.bgmVolume,
            this.audioContext.currentTime + duration
        );
        console.log(`[SoundManager] BGM fade-in: ${duration}s`);
    }

    /**
     * BGMフェードアウト
     * @param duration - フェード時間（秒）
     */
    fadeOutBGM(duration: number = 2.0): void {
        if (!this.bgmSource) return;

        this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.audioContext.currentTime);
        this.bgmGainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + duration
        );

        // フェード完了後に停止
        setTimeout(() => {
            this.stopBGM();
        }, duration * 1000);

        console.log(`[SoundManager] BGM fade-out: ${duration}s`);
    }
}
