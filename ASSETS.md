# Voice Plant App - アセット管理ドキュメント

**最終更新:** v1.4（2025年）

## 📁 ディレクトリ構成

```
assets/
├── sounds/              # 効果音（SE）
│   ├── button-click.mp3
│   ├── countdown-3.mp3
│   ├── countdown-2.mp3
│   ├── countdown-1.mp3
│   ├── countdown-start.mp3
│   ├── goal-reached.mp3
│   └── result.mp3
│
├── videos/              # ムービー（オプション）
│   ├── opening.mp4
│   ├── clear.mp4
│   └── gameover.mp4
│
└── README.md            # このファイル
```

---

## 🔊 効果音（SE）

### 1. button-click.mp3
**用途:** ボタンクリック時の汎用効果音

| 項目 | 仕様 |
|------|------|
| 長さ | 0.1秒 |
| 音質 | 軽快、クリック感 |
| 音量 | -12dB |
| フォーマット | MP3, 128kbps |
| ファイルサイズ | ~10KB |

**再生タイミング:**
- Startボタンクリック
- Viewボタンクリック
- Easy Modeトグル
- Backボタンクリック

**仮実装（Web Audio API）:**
```typescript
// 短いビープ音（440Hz、0.1秒）
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440;
oscillator.type = 'sine';
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.1);
```

---

### 2. countdown-3.mp3
**用途:** カウントダウン「3」の音

| 項目 | 仕様 |
|------|------|
| 長さ | 0.5秒 |
| 音質 | 低音、緊張感 |
| 音量 | -9dB |
| フォーマット | MP3, 128kbps |
| ファイルサイズ | ~20KB |

**再生タイミング:**
- Startボタンクリック後、1秒後

**仮実装（Web Audio API）:**
```typescript
// 低音ビープ（220Hz、0.5秒）
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 220;
oscillator.type = 'square';
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.5);
```

---

### 3. countdown-2.mp3
**用途:** カウントダウン「2」の音

| 項目 | 仕様 |
|------|------|
| 長さ | 0.5秒 |
| 音質 | 中音、緊張感↑ |
| 音量 | -9dB |
| フォーマット | MP3, 128kbps |
| ファイルサイズ | ~20KB |

**再生タイミング:**
- countdown-3.mp3の1秒後

**仮実装（Web Audio API）:**
```typescript
// 中音ビープ（330Hz、0.5秒）
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 330;
oscillator.type = 'square';
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.5);
```

---

### 4. countdown-1.mp3
**用途:** カウントダウン「1」の音

| 項目 | 仕様 |
|------|------|
| 長さ | 0.5秒 |
| 音質 | 高音、緊張感↑↑ |
| 音量 | -9dB |
| フォーマット | MP3, 128kbps |
| ファイルサイズ | ~20KB |

**再生タイミング:**
- countdown-2.mp3の1秒後

**仮実装（Web Audio API）:**
```typescript
// 高音ビープ（440Hz、0.5秒）
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440;
oscillator.type = 'square';
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.5);
```

---

### 5. countdown-start.mp3
**用途:** カウントダウン「START!」の音

| 項目 | 仕様 |
|------|------|
| 長さ | 1.0秒 |
| 音質 | 爆発的、鋭い、開始感 |
| 音量 | -6dB |
| フォーマット | MP3, 192kbps |
| ファイルサイズ | ~40KB |

**再生タイミング:**
- countdown-1.mp3の1秒後
- ゲーム開始と同時

**仮実装（Web Audio API）:**
```typescript
// 高周波スウィープ（880Hz→440Hz、1.0秒）
const oscillator = audioContext.createOscillator();
oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 1.0);
oscillator.type = 'sawtooth';
oscillator.start();
oscillator.stop(audioContext.currentTime + 1.0);
```

---

### 6. goal-reached.mp3
**用途:** 目標達成時の効果音

| 項目 | 仕様 |
|------|------|
| 長さ | 1.5秒 |
| 音質 | 華やか、勝利感、キラキラ |
| 音量 | -6dB |
| フォーマット | MP3, 192kbps |
| ファイルサイズ | ~60KB |

**再生タイミング:**
- 植物が目標ラインに到達した瞬間
- 粒子バースト演出と同時

**仮実装（Web Audio API）:**
```typescript
// 上昇アルペジオ（C-E-G-C、各0.3秒）
const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
frequencies.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime + i * 0.3);
    oscillator.stop(audioContext.currentTime + (i + 1) * 0.3);
});
```

---

### 7. result.mp3
**用途:** 結果発表時の効果音

| 項目 | 仕様 |
|------|------|
| 長さ | 2.0秒 |
| 音質 | ドラマティック、判定感 |
| 音量 | -6dB |
| フォーマット | MP3, 192kbps |
| ファイルサイズ | ~80KB |

**再生タイミング:**
- 音量が終了閾値を下回った瞬間
- Clear/GameOverメッセージ表示前

**仮実装（Web Audio API）:**
```typescript
// ドラムロール風（ホワイトノイズ、2.0秒）
const bufferSize = audioContext.sampleRate * 2.0;
const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
}
const source = audioContext.createBufferSource();
source.buffer = buffer;
source.start();
```

---

## 🎬 ムービー（オプション）

### 1. opening.mp4
**用途:** オープニング演出

| 項目 | 仕様 |
|------|------|
| 長さ | 5-10秒 |
| 解像度 | 800x600 (4:3) |
| フレームレート | 30fps |
| ビットレート | 2Mbps |
| フォーマット | MP4 (H.264) |
| ファイルサイズ | ~5MB以下 |

**内容案:**
- ロゴアニメーション
- タイトル表示："Voice Plant App"
- キャッチコピー："大きな声で想いを伝えろ！"
- フェードアウト → Startボタン

**代替案（ムービーなし）:**
- CSS/Canvas アニメーションで代用
- フェードイン・テキストアニメーション

---

### 2. clear.mp4
**用途:** クリア演出

| 項目 | 仕様 |
|------|------|
| 長さ | 3-5秒 |
| 解像度 | 800x600 (4:3) |
| フレームレート | 30fps |
| ビットレート | 2Mbps |
| フォーマット | MP4 (H.264) |
| ファイルサイズ | ~3MB以下 |

**内容案:**
- 植物が花開くアニメーション
- "Clear!"テキスト表示
- キラキラエフェクト
- フェードアウト → Backボタン

**代替案（ムービーなし）:**
- 粒子エフェクト強化で代用
- CSS/Canvas アニメーション

---

### 3. gameover.mp4
**用途:** ゲームオーバー演出

| 項目 | 仕様 |
|------|------|
| 長さ | 3-5秒 |
| 解像度 | 800x600 (4:3) |
| フレームレート | 30fps |
| ビットレート | 2Mbps |
| フォーマット | MP4 (H.264) |
| ファイルサイズ | ~3MB以下 |

**内容案:**
- 植物がしおれるアニメーション
- "Game Over"テキスト表示
- 暗転エフェクト
- フェードアウト → Backボタン

**代替案（ムービーなし）:**
- 既存のGameOverメッセージを強化
- CSS/Canvas アニメーション

---

## 📦 アセット実装優先度

### Phase 1: 効果音（必須）
**実装方法:** Web Audio API（仮実装）
**理由:** ムービーなしでも動作、体験向上効果大

1. button-click.mp3（仮実装）
2. countdown-3/2/1/start.mp3（仮実装）
3. goal-reached.mp3（仮実装）
4. result.mp3（仮実装）

### Phase 2: 効果音（本実装、オプション）
**実装方法:** 外部MP3ファイル
**理由:** 音質向上、ブランディング

- 音源制作依頼 or フリー素材探索

### Phase 3: ムービー（オプション）
**実装方法:** MP4動画ファイル
**理由:** リソース次第、なしでも動作

- 動画制作依頼 or Canvas/CSS代替

---

## 🔧 アセット管理クラス

### SoundManager.ts
```typescript
export class SoundManager {
    private audioContext: AudioContext;
    private sounds: Map<SoundType, HTMLAudioElement | 'synthetic'>;

    // Web Audio API（仮実装）
    private playSynthetic(type: SoundType): void {
        switch (type) {
            case 'button-click':
                this.playBeep(440, 0.1);
                break;
            case 'countdown-3':
                this.playBeep(220, 0.5);
                break;
            // ... 他の効果音
        }
    }

    private playBeep(frequency: number, duration: number): void {
        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        oscillator.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}
```

### VideoPlayer.ts
```typescript
export class VideoPlayer {
    private enabled: boolean = false;  // デフォルトOFF

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    play(type: VideoType, onComplete?: () => void): void {
        if (!this.enabled) {
            // ムービーOFF → 即座に完了コールバック
            if (onComplete) onComplete();
            return;
        }

        // ムービーON → 動画再生
        // ...
    }
}
```

---

## 📄 ライセンス情報

### 効果音
**ライセンス:** パブリックドメイン or CC0（予定）
**出典:** 自作（Web Audio API） or フリー素材サイト

### ムービー
**ライセンス:** オリジナル制作 or CC0（予定）
**出典:** 自作 or 外部委託

---

## 🚀 次のステップ

1. **Phase 1実装:** SoundManager（Web Audio API版）
2. **効果音テスト:** 各タイミングで再生確認
3. **音質調整:** 周波数・音量・長さ調整
4. **Phase 2検討:** 外部MP3ファイル化（必要に応じて）
5. **Phase 3検討:** ムービー制作（必要に応じて）

---

## 📝 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| v1.4 | 2025-xx-xx | 初版作成（効果音7種、ムービー3種） |
