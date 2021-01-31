export function heightMapGrid(pointWidth, heightCalc) {
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

    for (let y = 0; y < pointWidth - 1; y++) {
        for (let x = 0; x < pointWidth - 1; x++) {
            let curPoint = y * pointWidth + x
            geometry.faces.push(
                new THREE.Face3(curPoint, curPoint + pointWidth, curPoint + 1,),
                new THREE.Face3(curPoint + 1, curPoint + pointWidth, curPoint + pointWidth + 1),
            );
            geometry.faceVertexUvs[0].push(
                [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 0)],
                [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
            );
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
}