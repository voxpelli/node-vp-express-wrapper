### 0.6.4 (2015-12-29)


#### Bug Fixes

* **wrapper:** set config prior to logger ([53dbe32f](https://github.com/voxpelli/node-vp-express-wrapper/commit/53dbe32f2722d35431c89ceff230a0272d5c4b1c))


### 0.6.3 (2015-12-28)


#### Features

* **wrapper:** make it easier to customize logger ([be8cb141](https://github.com/voxpelli/node-vp-express-wrapper/commit/be8cb141d1210275fd34ad7a4d58ff1706d0a0ad))


### 0.6.2 (2015-12-15)


#### Bug Fixes

* **wrapper:** remove debug statement ([2a259064](https://github.com/voxpelli/node-vp-express-wrapper/commit/2a2590646d83b7aeddd801f282d128e0580732a0))


### 0.6.1 (2015-12-15)


#### Bug Fixes

* **wrapper:**
  * some extra debugging + tweaks ([47324e72](https://github.com/voxpelli/node-vp-express-wrapper/commit/47324e72be8ef94854b2d12296d2a73e585c7164))
  * do proper redirect ([465510bd](https://github.com/voxpelli/node-vp-express-wrapper/commit/465510bdf629b9deb507a210f42efc88f0aefae2))


## 0.6.0 (2015-12-14)


#### Features

* **wrapper:** support HTTPS enforcing ([11eaedaa](https://github.com/voxpelli/node-vp-express-wrapper/commit/11eaedaa8dead2812d790773d1b993f123b1d96f))


### 0.5.2 (2015-12-02)


#### Bug Fixes

* **wrapper:** fix so that the error handler works ([28676e7f](https://github.com/voxpelli/node-vp-express-wrapper/commit/28676e7f6e8ef77a891fb43d839446880d2346c6))


### 0.5.1 (2015-12-02)


#### Bug Fixes

* **main:** remove cache on run ([d0d7e80c](https://github.com/voxpelli/node-vp-express-wrapper/commit/d0d7e80c6a1bfd01116900b523de07cdfb77ae02))


## 0.5.0 (2015-12-02)


#### Bug Fixes

* **config:** make dotenv fail silently ([5432c433](https://github.com/voxpelli/node-vp-express-wrapper/commit/5432c433251c381de8b366a795b57e542f23e7f6))


#### Breaking Changes

* .extend() is now .staticExtend() and now has a single argument that's the new static properties to add/replace
 ([b2b2ce95](https://github.com/voxpelli/node-vp-express-wrapper/commit/b2b2ce9507c7f763d40d7af2ea53772204022068))


### 0.4.2 (2015-12-01)


#### Bug Fixes

* **wrapper:** make the close method work ([af09a572](https://github.com/voxpelli/node-vp-express-wrapper/commit/af09a5720363d9d03e0f03f04401379548450d14))


### 0.4.1 (2015-12-01)


#### Bug Fixes

* **main:** always return class – avoid cache issue ([9ff3bc7a](https://github.com/voxpelli/node-vp-express-wrapper/commit/9ff3bc7a62200339aea589811b4436930a420741))


#### Features

* **main:** added option to skip HOST-enforcing ([162a6215](https://github.com/voxpelli/node-vp-express-wrapper/commit/162a6215067c5911e955efbedf732de7d3a20500))


## 0.4.0 (2015-11-29)


#### Bug Fixes

* **main:** fetch prefix from correct object ([30db8426](https://github.com/voxpelli/node-vp-express-wrapper/commit/30db8426d8768ac2f13e84f4446c547123c908b6))
* **wrapper:** added lost .close() method ([dc7d08b6](https://github.com/voxpelli/node-vp-express-wrapper/commit/dc7d08b687a9d85af8b3d40ffce4079accf2b0f5))


#### Features

* **wrapper:** emit a "started" after start ([1c6e8f62](https://github.com/voxpelli/node-vp-express-wrapper/commit/1c6e8f62bde3f5774c722c34368e9c320f272c34))


#### Breaking Changes

* New names for getDefaultEnv() and getDefaultConfig() – they are now just getEnv() and getConfig()
 ([a0a4738b](https://github.com/voxpelli/node-vp-express-wrapper/commit/a0a4738b26d128407fda07e0f75eacc254af28e3))


### 0.3.1 (2015-11-27)


#### Bug Fixes

* **wrapper:** fixed basic authentication ([9cfdbb39](https://github.com/voxpelli/node-vp-express-wrapper/commit/9cfdbb3971fd824932a6655ce925215e1b7d8407))


## 0.3.0 (2015-11-27)


#### Bug Fixes

* **runner:** .done() is not a valid Promise method ([804c0c02](https://github.com/voxpelli/node-vp-express-wrapper/commit/804c0c020c0bbe85bdd23b4bdf1c4f652620d81d))
* **wrapper:** add a 404 handler ([98e86a8b](https://github.com/voxpelli/node-vp-express-wrapper/commit/98e86a8b273356496b750c09f5ed8819c86cf5fa))


#### Features

* **wrapper:** provide a default response ([31a2d415](https://github.com/voxpelli/node-vp-express-wrapper/commit/31a2d415fb70ff8658e66d82219e90c0cb8ea53a))


## 0.2.0 (2015-11-27)


## 0.1.0 (2015-11-26)

* Initial release

