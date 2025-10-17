# Sound Effects & BGM Directory

## 必要な効果音ファイル

このディレクトリに以下の音声ファイルを配置してください。

### 効果音（SE）

| ファイル名 | 用途 | 推奨長さ | 推奨サイズ |
|-----------|------|---------|-----------|
| `click.mp3` | ボタンクリック音 | 0.1-0.3秒 | ~10KB |
| `countdown.mp3` | カウントダウン（3,2,1） | 0.3-0.5秒 | ~20KB |
| `start.mp3` | ゲーム開始音 | 0.5-1.0秒 | ~30KB |
| `clear.mp3` | Clear達成音 | 1.0-2.0秒 | ~50KB |
| `gameover.mp3` | GameOver音 | 1.0-2.0秒 | ~50KB |

### BGM（将来用・オプション）

| ファイル名 | 用途 | 推奨長さ | 推奨サイズ |
|-----------|------|---------|-----------|
| `bgm_playing.mp3` | ゲームプレイ中BGM | 60-120秒（ループ） | ~1MB |
| `bgm_result.mp3` | リザルトBGM | 30-60秒（ループ） | ~500KB |

## フリー素材サイト（推奨）

### 効果音
- **魔王魂**: https://maou.audio/category/se/
  - ジャンル: ゲーム, システム音
  - 商用利用: 可
  - クレジット表記: 不要

- **効果音ラボ**: https://soundeffect-lab.info/
  - ジャンル: ボタン音, システム音
  - 商用利用: 可
  - クレジット表記: 不要

- **OtoLogic**: https://otologic.jp/
  - ジャンル: ゲーム, UI音
  - 商用利用: 可
  - クレジット表記: 任意

### BGM
- **DOVA-SYNDROME**: https://dova-s.jp/
  - ジャンル: ゲームBGM, 環境音楽
  - 商用利用: 可（要確認）
  - クレジット表記: 推奨

- **甘茶の音楽工房**: https://amachamusic.chagasi.com/
  - ジャンル: ゲームBGM, 癒し系
  - 商用利用: 可
  - クレジット表記: 不要

## 推奨設定

### ファイル形式
- **形式**: MP3（推奨）または OGG
- **ビットレート**: 128kbps（SE）, 192kbps（BGM）
- **サンプリングレート**: 44.1kHz

### 音量レベル
- **SE**: -6dB to -12dB（ピーク）
- **BGM**: -12dB to -18dB（ピーク）

## テスト用ダミーファイル作成（開発用）

音声ファイルがまだない場合、以下のコマンドで無音ファイルを生成できます：

```bash
# ffmpegで0.5秒の無音mp3を生成
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame click.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame countdown.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1.0 -q:a 9 -acodec libmp3lame start.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -q:a 9 -acodec libmp3lame clear.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 2.0 -q:a 9 -acodec libmp3lame gameover.mp3
```

## 使用方法

```typescript
// main.tsでSoundManagerを初期化
const soundManager = new SoundManager(audioContext);

// 効果音をプリロード
await soundManager.preload(['click', 'countdown', 'start', 'clear', 'gameover']);

// 効果音を再生
soundManager.playSE('click');

// BGMを再生（ループ）
soundManager.playBGM('bgm_playing');

// 音量調整
soundManager.setSEVolume(0.7);  // 70%
soundManager.setBGMVolume(0.3); // 30%
```
