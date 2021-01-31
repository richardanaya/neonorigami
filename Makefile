build:
	cd js/neonorigami && npm install && npm run build 
	cd js/aframe-neonorigami && npm install && npm run build
	cd js/cyberdeck && npm install && npm run build
dev:
	cd js/neonorigami && npm install && npm run dev
dev-components:
	cd js/aframe-neonorigami && npm install && npm run dev
publish:
	cd js/neonorigami && npm publish
serve:
	python3 server.py
