export interface FrequencyData {
    low: number;    // 低周波数帯（0-1）
    mid: number;    // 中周波数帯（0-1）
    high: number;   // 高周波数帯（0-1）
    average: number; // 全体平均（0-1）
}

export class AudioAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private dataArray: Uint8Array | null = null;
    private frequencyArray: Uint8Array | null = null;

    async initialize(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new AudioContext();

            // Safari対応: suspended状態を解除
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);
        } catch (error) {
            if (error instanceof DOMException) {
                throw new Error(`マイクアクセス拒否: ${error.message}`);
            }
            throw error;
        }
    }

    getVolume(): number {
        if (!this.analyser || !this.dataArray) {
            return 0;
        }

        this.analyser.getByteTimeDomainData(this.dataArray);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = Math.abs(this.dataArray[i] - 128) / 128;
            sum += value;
        }

        return sum / this.dataArray.length;
    }

    getFrequency(): FrequencyData {
        if (!this.analyser || !this.frequencyArray) {
            return { low: 0, mid: 0, high: 0, average: 0 };
        }

        // 周波数データを取得
        this.analyser.getByteFrequencyData(this.frequencyArray);

        const bufferLength = this.frequencyArray.length;

        // 周波数帯域を分割（低:0-1/3, 中:1/3-2/3, 高:2/3-1）
        const lowEnd = Math.floor(bufferLength / 3);
        const midEnd = Math.floor((bufferLength * 2) / 3);

        let lowSum = 0;
        let midSum = 0;
        let highSum = 0;
        let totalSum = 0;

        // 低周波数帯
        for (let i = 0; i < lowEnd; i++) {
            lowSum += this.frequencyArray[i];
        }

        // 中周波数帯
        for (let i = lowEnd; i < midEnd; i++) {
            midSum += this.frequencyArray[i];
        }

        // 高周波数帯
        for (let i = midEnd; i < bufferLength; i++) {
            highSum += this.frequencyArray[i];
        }

        // 全体合計
        totalSum = lowSum + midSum + highSum;

        // 0-1の範囲に正規化（255が最大値）
        return {
            low: lowSum / lowEnd / 255,
            mid: midSum / (midEnd - lowEnd) / 255,
            high: highSum / (bufferLength - midEnd) / 255,
            average: totalSum / bufferLength / 255
        };
    }

    getFrequencyBands(): number[] {
        if (!this.analyser || !this.frequencyArray) {
            return [];
        }

        // 全周波数バンドデータを取得
        this.analyser.getByteFrequencyData(this.frequencyArray);

        // 0-255の値を0-1に正規化して返す
        return Array.from(this.frequencyArray).map(value => value / 255);
    }

    dispose(): void {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
