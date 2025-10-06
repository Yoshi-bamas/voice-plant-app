import p5 from 'p5';

/**
 * 対生の枝を再帰的に描画（左右対称）
 * @param p - p5インスタンス
 * @param x - 開始点X座標
 * @param y - 開始点Y座標
 * @param length - 枝の長さ
 * @param angle - 枝の角度（ラジアン）
 * @param depth - 再帰深度（0で終了）
 * @param branchAngle - 分岐角度（度数法）
 * @param color - RGB色配列 [r, g, b]
 */
function drawSymmetricBranches(
    p: p5,
    x: number,
    y: number,
    length: number,
    angle: number,
    depth: number,
    branchAngle: number,
    color: [number, number, number]
): void {
    if (depth === 0 || length < 5) {
        return; // 終了条件
    }

    const [r, g, b] = color;
    const branchAngleRad = p.radians(branchAngle);
    const newLength = length * 0.7; // 枝の長さは0.7倍

    // 左の枝
    const leftAngle = angle - branchAngleRad;
    const x2Left = x + Math.cos(leftAngle) * length;
    const y2Left = y + Math.sin(leftAngle) * length;

    p.stroke(r, g, b);
    p.strokeWeight(Math.max(1, depth * 1.5));
    p.line(x, y, x2Left, y2Left);

    // 左の枝から再帰
    drawSymmetricBranches(p, x2Left, y2Left, newLength, leftAngle, depth - 1, branchAngle, color);

    // 右の枝
    const rightAngle = angle + branchAngleRad;
    const x2Right = x + Math.cos(rightAngle) * length;
    const y2Right = y + Math.sin(rightAngle) * length;

    p.stroke(r, g, b);
    p.strokeWeight(Math.max(1, depth * 1.5));
    p.line(x, y, x2Right, y2Right);

    // 右の枝から再帰
    drawSymmetricBranches(p, x2Right, y2Right, newLength, rightAngle, depth - 1, branchAngle, color);
}

/**
 * 音量で成長する対生の樹木を描画
 * @param p - p5インスタンス
 * @param baseX - 基点X座標
 * @param baseY - 基点Y座標
 * @param trunkHeight - 幹の高さ
 * @param branchStartRatio - 分岐開始位置（0-1）
 * @param branchAngle - 分岐角度（度数法）
 * @param maxDepth - 最大再帰深度
 * @param color - RGB色配列 [r, g, b]
 */
export function drawGrowingTree(
    p: p5,
    baseX: number,
    baseY: number,
    trunkHeight: number,
    branchStartRatio: number,
    branchAngle: number,
    maxDepth: number,
    color: [number, number, number]
): void {
    const [r, g, b] = color;

    // 幹を描画（直線）
    const trunkTopY = baseY - trunkHeight;
    p.stroke(r, g, b);
    p.strokeWeight(8);
    p.line(baseX, baseY, baseX, trunkTopY);

    // 分岐開始位置を計算
    const branchStartY = baseY - (trunkHeight * branchStartRatio);

    // 分岐開始高さに達していたら枝を描画
    if (trunkHeight > 50 && trunkHeight * branchStartRatio > 30) {
        const branchLength = trunkHeight * 0.3; // 枝の初期長さは幹の30%

        // 対生の枝を描画（上向き-90度から分岐）
        drawSymmetricBranches(
            p,
            baseX,
            branchStartY,
            branchLength,
            -Math.PI / 2, // 上向き
            maxDepth,
            branchAngle,
            color
        );
    }
}

/**
 * L-Systemベースの植物生成（将来の拡張用）
 * 現在は未実装、将来的にルールベースの成長パターンを実装
 */
export function generateLSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
    let current = axiom;
    for (let i = 0; i < iterations; i++) {
        let next = '';
        for (const char of current) {
            next += rules[char] || char;
        }
        current = next;
    }
    return current;
}
