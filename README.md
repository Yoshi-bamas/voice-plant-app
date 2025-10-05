# Voice Plant App

音量で植物が成長し、周波数で色が変化するWebアプリケーション。

## 特徴

- **音量**: 茎の高さをコントロール（0-400px）
- **周波数**: 色（低音:緑120°、高音:赤0°）と葉の分岐数・角度を制御
- **Clear!**: 音量が0.8を超えるとコンクリートを突き破り、花の粒子エフェクトと"Clear!"メッセージを表示

## 技術スタック

- TypeScript (Strict mode)
- p5.js (Canvas描画)
- Web Audio API (マイク入力解析)
- SimplexNoise (揺らぎアニメーション)

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# ビルド
npm run build

# 開発モード（ファイル監視）
npm run dev

# ローカルサーバー起動
npm run serve
```

ブラウザで `http://localhost:8000` を開く。

## 使い方

1. "Start"ボタンをクリック
2. マイクアクセスを許可
3. 声や音を出して植物を育てる
4. 大きな声で"Clear!"達成

## ブラウザ対応

- Chrome/Edge推奨
- Safari対応（AudioContext.suspended処理済み）
- マイクアクセス必須
