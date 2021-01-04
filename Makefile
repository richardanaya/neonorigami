dev:
	cd js/neonorigami && rollup -c -w
build:
	cd js/neonorigami && rollup -c
publish:
	cd js/neonorigami && npm publish
serve:
	python3 -m http.server