.PHONY: dev electron build-web build-electron install lint

install:
	npm install

dev:
	npm run dev -w packages/web

electron:
	npm start -w packages/electron

build-web:
	npm run build -w packages/web

build-electron:
	npm run build -w packages/electron

lint:
	npm run lint
