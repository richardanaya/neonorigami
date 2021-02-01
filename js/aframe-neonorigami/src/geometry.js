export function heightMapGrid(pointWidth, heightCalc, vertexColorCalc) {
    const geometry = new THREE.Geometry();
    for (let y = 0; y < pointWidth; y++) {
        for (let x = 0; x < pointWidth; x++) {
            let px = -pointWidth / 2 + x;
            let py = -pointWidth / 2 + y;
            geometry.vertices.push(
                new THREE.Vector3(px, heightCalc(x, y), py),
            );
        }
    }

    geometry.faceVertexUvs[1] = [];
    for (let y = 0; y < pointWidth - 1; y++) {
        for (let x = 0; x < pointWidth - 1; x++) {
            let curPoint = y * pointWidth + x
            const top = new THREE.Face3(curPoint, curPoint + pointWidth, curPoint + 1);
            const bot = new THREE.Face3(curPoint + 1, curPoint + pointWidth, curPoint + pointWidth + 1)
            geometry.faces.push(
                top,
                bot,
            );
            geometry.faceVertexUvs[0].push(
                [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 0)],
                [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
            );
            let dx = 1 / (pointWidth - 1)
            let dy = 1 / (pointWidth - 1)
            geometry.faceVertexUvs[1].push(
                [new THREE.Vector2(x * dx, y * dy), new THREE.Vector2(x * dx, y * dy + dy), new THREE.Vector2(x * dx + dx, y * dy)],
                [new THREE.Vector2(x * dx + dx, y * dy), new THREE.Vector2(x * dx, y * dy + dy), new THREE.Vector2(x * dx + dx, y * dy + dy)],
            );
            if (vertexColorCalc) {
                top.vertexColors.push(
                    vertexColorCalc(x, y),
                    vertexColorCalc(x, y + 1),
                    vertexColorCalc(x + 1, y),
                )
                bot.vertexColors.push(
                    vertexColorCalc(x + 1, y),
                    vertexColorCalc(x, y + 1),
                    vertexColorCalc(x + 1, y + 1),
                )
            }
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
}