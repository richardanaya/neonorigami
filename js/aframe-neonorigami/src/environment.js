function generateGrid(heightCalc, material){
    const geometry = new THREE.Geometry();
    const pointWidth = 200;
    for(let y = -pointWidth/2; y <= pointWidth/2; y++){
        for(let x = -pointWidth/2; x <= pointWidth/2; x++){
            geometry.vertices.push(
                new THREE.Vector3(x, heightCalc(x,y), y),
            );
        }  
    }

    for(let y= 0; y < pointWidth; y++){
        for(let x = 0; x < pointWidth; x++){
            let curPoint = y*pointWidth+x 
            geometry.faces.push(
                new THREE.Face3(curPoint,curPoint+pointWidth+1,curPoint+1),
                new THREE.Face3(curPoint+pointWidth+1,curPoint+pointWidth+2,curPoint+1),
            );
        }   
    }

    return new THREE.Mesh(geometry, material);
}

AFRAME.registerComponent('neon-origami-environment', {
    schema: {
        "sky-color": { type: 'color', default: '#87CEEB' }
    },
    init: function () {
        this.didChange = true;
    },
    update: function (oldData) {
        if (oldData["sky-color"] != this.data["sky-color"]) {
            this.didChange = true;
        }
    },
    tick: function () {
        if (this.didChange) {
            // get the three js scene
            const scene = this.el.closest("a-scene").object3D;
            scene.background = new THREE.Color(this.data["sky-color"]);
            this.didChange = false;

            // land
            scene.add(generateGrid(()=>2*Math.random()-1,new THREE.MeshBasicMaterial({color: new THREE.Color("#7cfc00")})));
            // water
            scene.add(generateGrid(()=>0,new THREE.MeshBasicMaterial({color: new THREE.Color("#0077be")})));
        }
    }
});