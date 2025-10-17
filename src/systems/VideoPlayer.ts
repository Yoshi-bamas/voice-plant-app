/**
 * VideoPlayer.ts
 * v1.5: Phase E - ムービーシステム
 *
 * 【役割】
 * - 動画の事前読み込み（プリロード）で遅延ゼロ再生
 * - Clear/GameOver動画の管理
 * - 再生完了時のコールバック処理
 */

import { GameResult } from '../types';

export type VideoType = 'clear' | 'gameover';

export class VideoPlayer {
    private videoElement: HTMLVideoElement | null = null;
    private isLoaded: boolean = false;
    private onCompleteCallback: (() => void) | null = null;
    private fadeInDuration: number = 700;  // v1.5.8: フェードイン時間（ms）
    private fadeInTimer: number = 0;  // v1.5.8: フェードイン進行タイマー
    private isFading: boolean = false;  // v1.5.8: フェード中フラグ

    /**
     * コンストラクタ
     * @param videoElementId - HTML video要素のID
     */
    constructor(videoElementId: string = 'resultVideo') {
        this.videoElement = document.getElementById(videoElementId) as HTMLVideoElement;

        if (!this.videoElement) {
            console.error(`[VideoPlayer] Video element #${videoElementId} not found`);
            return;
        }

        // 動画終了時のイベントリスナー
        this.videoElement.addEventListener('ended', () => {
            console.log('[VideoPlayer] Video ended');
            this.hide();
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        });

        // 動画読み込み完了時のイベントリスナー
        this.videoElement.addEventListener('loadeddata', () => {
            console.log('[VideoPlayer] Video loaded');
            this.isLoaded = true;
        });
    }

    /**
     * 動画を事前読み込み（プリロード）
     * @param videoType - 動画の種類（clear/gameover）
     */
    preload(videoType: VideoType): void {
        if (!this.videoElement) {
            console.error('[VideoPlayer] Video element not found');
            return;
        }

        const videoPath = this.getVideoPath(videoType);
        console.log(`[VideoPlayer] Preloading ${videoType} video: ${videoPath}`);

        this.videoElement.src = videoPath;
        this.videoElement.load();  // 事前読み込み開始
        this.isLoaded = false;
    }

    /**
     * 動画を再生
     * v1.5.8: 0.7秒のフェードイン演出を追加
     * @param result - ゲーム結果（clear/gameover）
     * @param onComplete - 再生完了時のコールバック
     */
    play(result: GameResult, onComplete: () => void): void {
        if (!this.videoElement) {
            console.error('[VideoPlayer] Video element not found, skipping video');
            onComplete();
            return;
        }

        console.log(`[VideoPlayer] Playing ${result} video with fade-in`);

        // コールバック設定
        this.onCompleteCallback = onComplete;

        // 動画のソースを設定（プリロードされていない場合）
        const videoPath = this.getVideoPath(result);
        if (this.videoElement.src !== videoPath) {
            console.log(`[VideoPlayer] Loading video: ${videoPath}`);
            this.videoElement.src = videoPath;
        }

        // v1.5.8: フェードイン開始（opacity: 0 → 1）
        this.videoElement.style.display = 'block';
        this.videoElement.style.opacity = '0';
        this.isFading = true;
        this.fadeInTimer = 0;

        // 音声を有効化（ミュート解除）
        this.videoElement.muted = false;
        this.videoElement.volume = 1.0;  // 音量100%
        console.log('[VideoPlayer] Audio enabled: muted=false, volume=1.0');

        // 再生開始
        this.videoElement.currentTime = 0;  // 最初から再生
        this.videoElement.play().catch((error) => {
            console.error('[VideoPlayer] Play error:', error);
            // 再生エラー時は即座にコールバック実行
            this.hide();
            if (onComplete) onComplete();
        });

        // v1.5.8: フェードインアニメーション開始
        this.startFadeIn();
    }

    /**
     * v1.5.8: フェードインアニメーション
     */
    private startFadeIn(): void {
        if (!this.videoElement || !this.isFading) return;

        const startTime = Date.now();

        const animate = () => {
            if (!this.videoElement || !this.isFading) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeInDuration, 1.0);

            // Ease-out曲線でスムーズなフェード
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            this.videoElement.style.opacity = easeProgress.toString();

            if (progress < 1.0) {
                requestAnimationFrame(animate);
            } else {
                this.isFading = false;
                console.log('[VideoPlayer] Fade-in complete');
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * 動画を表示
     */
    private show(): void {
        if (!this.videoElement) return;
        this.videoElement.style.display = 'block';
        this.videoElement.style.opacity = '1';
    }

    /**
     * 動画を非表示
     */
    private hide(): void {
        if (!this.videoElement) return;
        this.videoElement.style.display = 'none';
        this.videoElement.style.opacity = '0';
    }

    /**
     * 動画パスを取得
     * @param videoType - 動画の種類
     * @returns 動画ファイルのパス
     */
    private getVideoPath(videoType: VideoType): string {
        // public/videos/ ディレクトリからの相対パス
        // プロジェクトルートから配信される場合は /public/ を含める
        const path = `/public/videos/${videoType}.mp4`;
        console.log(`[VideoPlayer] getVideoPath(${videoType}) -> ${path}`);
        return path;
    }

    /**
     * 動画が読み込み完了しているか確認
     * @returns true: 読み込み完了, false: 読み込み中
     */
    isReady(): boolean {
        return this.isLoaded;
    }

    /**
     * 動画を停止
     */
    stop(): void {
        if (!this.videoElement) return;
        this.videoElement.pause();
        this.videoElement.currentTime = 0;
        this.hide();
    }
}
