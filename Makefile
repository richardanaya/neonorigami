dev:
	cd js/neonorigami && rollup -c -w rollup-dev.config.js
build:
	cd js/neonorigami && rollup -c
	cd js/aframe-neonorigami && rollup -c
publish:
	cd js/neonorigami && npm publish
serve:
	python3 -m http.server
