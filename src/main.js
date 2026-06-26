import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

window.CESIUM_BASE_URL = '/cesium-map/cesium'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMjA0NjkwZi1iMjk5LTQwMGItOTYwYy1lZGZiMDc5YzI5ZWMiLCJpZCI6NDM4MzE1LCJzdWIiOiJNZWxpYmVlMjAyNCIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJ2aXRlX2Fzc2lnbm1lbnQiLCJpYXQiOjE3ODI1MDUwMTd9.Pu1u_0-LV1RvssWJ1WnhvbwVnqdaBct-SXskrpKYm0s'

async function initViewer() {
  const terrainProvider = await Cesium.createWorldTerrainAsync()

  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: terrainProvider,
    shadows: true,
    terrainShadows: Cesium.ShadowMode.ENABLED,
    shouldAnimate: true
  })

  // Shadow map settings
  const shadowMap = viewer.shadowMap
  shadowMap.maximumDistance = 10000.0
  shadowMap.softShadows = true

  // Enable sun lighting
  viewer.scene.globe.enableLighting = true

  // Add 3D Buildings from Cesium Ion
  const tileset = viewer.scene.primitives.add(
    await Cesium.Cesium3DTileset.fromIonAssetId(4993397)
  )

  await viewer.zoomTo(tileset)

  // Click - green silhouette + infobox
viewer.screenSpaceEventHandler.setInputAction((movement) => {
  silhouetteGreen.selected = []
  const picked = viewer.scene.pick(movement.position)
  if (Cesium.defined(picked)) {
    silhouetteGreen.selected = [picked]

    // Show basic info
    const selectedEntity = new Cesium.Entity()
    selectedEntity.description = `
      <table class="cesium-infoBox-defaultTable">
        <tr><th>Type</th><td>LoD2 Building</td></tr>
        <tr><th>Dataset</th><td>LGL Baden-Württemberg</td></tr>
        <tr><th>Feature ID</th><td>${picked._batchId}</td></tr>
      </table>
    `
    viewer.selectedEntity = selectedEntity
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // Silhouette highlighting on hover and click
  const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
  silhouetteBlue.uniforms.color = Cesium.Color.BLUE
  silhouetteBlue.uniforms.length = 0.01
  silhouetteBlue.selected = []

  const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
  silhouetteGreen.uniforms.color = Cesium.Color.LIME
  silhouetteGreen.uniforms.length = 0.01
  silhouetteGreen.selected = []

  viewer.scene.postProcessStages.add(
    Cesium.PostProcessStageLibrary.createSilhouetteStage([silhouetteBlue, silhouetteGreen])
  )

  // Hover - blue silhouette
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    silhouetteBlue.selected = []
    const picked = viewer.scene.pick(movement.endPosition)
    if (Cesium.defined(picked)) {
      silhouetteBlue.selected = [picked]
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  // Click - green silhouette
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    silhouetteGreen.selected = []
    const picked = viewer.scene.pick(movement.position)
    if (Cesium.defined(picked)) {
      silhouetteGreen.selected = [picked]
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // Add WMS Basemap - basemap.de (BKG)
  viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapServiceImageryProvider({
      url: 'https://sgx.geodatenzentrum.de/wms_basemapde',
      layers: 'de_basemapde_web_raster_farbe',
      parameters: {
        transparent: true,
        format: 'image/png'
      }
    })
  )
}

initViewer()