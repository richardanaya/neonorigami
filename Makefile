build:
	cd js/neonorigami && rollup -c
	cd js/aframe-neonorigami && rollup -c
	cd js/cyberdeck && rollup -c
dev:
	cd js/neonorigami && rollup -w -c rollup-dev.config.js
dev-components:
	cd js/aframe-neonorigami && rollup -w -c  rollup-dev.config.js
publish:
	cd js/neonorigami && npm publish
serve:
	python3 server.py
