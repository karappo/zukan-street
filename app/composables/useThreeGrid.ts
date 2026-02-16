import { DEG2RAD } from '~/utils/geometry'
import type { Pov } from '~/utils/geometry'

type Three = typeof import('three')

export function useThreeGrid() {
  let THREE: Three | null = null
  let gridRenderer: InstanceType<Three['WebGLRenderer']> | null = null
  let gridScene: InstanceType<Three['Scene']> | null = null
  let gridCamera: InstanceType<Three['PerspectiveCamera']> | null = null

  const gridVisible = ref(false)
  const gridCanvas = ref<HTMLCanvasElement | null>(null)

  async function ensureThree() {
    if (!THREE) {
      THREE = await import('three')
    }
    return THREE
  }

  async function initGridRenderer(container: HTMLElement, width: number, height: number) {
    const T = await ensureThree()

    gridRenderer = new T.WebGLRenderer({ alpha: true, antialias: true })
    gridRenderer.setPixelRatio(window.devicePixelRatio)
    gridRenderer.setSize(width, height)
    gridRenderer.domElement.className = 'grid-canvas'
    container.appendChild(gridRenderer.domElement)
    gridCanvas.value = gridRenderer.domElement

    gridScene = new T.Scene()
    gridScene.fog = new T.Fog(0x000000, 50, 300)

    gridCamera = new T.PerspectiveCamera(60, width / height, 0.1, 500)
    gridCamera.position.set(0, 2.5, 0)

    // Grid (5m間隔、±300m範囲)
    const grid = new T.GridHelper(600, 120, 0xffffff, 0xffffff)
    ;(grid.material as InstanceType<Three['Material']>).opacity = 0.35
    ;(grid.material as InstanceType<Three['Material']>).transparent = true
    ;(grid.material as InstanceType<Three['Material']>).depthWrite = false
    gridScene.add(grid)

    // 暗い半透明の地面プレーン
    const planeGeo = new T.PlaneGeometry(800, 800)
    const planeMat = new T.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      side: T.DoubleSide,
    })
    const plane = new T.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.01
    gridScene.add(plane)
  }

  function syncGridCamera(pov: Pov, zoom: number, width: number, height: number) {
    if (!gridCamera || !gridRenderer) return

    const hFovDeg = 180 / Math.pow(2, zoom)
    const hFovRad = hFovDeg * DEG2RAD
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) * (height / width))
    const vFovDeg = vFovRad / DEG2RAD

    gridCamera.fov = vFovDeg
    gridCamera.aspect = width / height
    gridCamera.updateProjectionMatrix()

    gridCamera.rotation.order = 'YXZ'
    gridCamera.rotation.y = -pov.heading * DEG2RAD
    gridCamera.rotation.x = pov.pitch * DEG2RAD

    gridRenderer.setSize(width, height)
  }

  function renderGrid() {
    if (!gridRenderer || !gridScene || !gridCamera) return
    gridRenderer.render(gridScene, gridCamera)
  }

  function showGroundGrid(pov: Pov, zoom: number, width: number, height: number) {
    if (!gridRenderer) return
    gridRenderer.domElement.style.visibility = 'visible'
    gridVisible.value = true
    syncGridCamera(pov, zoom, width, height)
    renderGrid()
  }

  function hideGroundGrid() {
    if (!gridRenderer) return
    gridRenderer.domElement.style.visibility = 'hidden'
    gridVisible.value = false
  }

  function resizeGrid(width: number, height: number) {
    if (!gridRenderer || !gridCamera) return
    gridRenderer.setSize(width, height)
    gridCamera.aspect = width / height
    gridCamera.updateProjectionMatrix()
    if (gridVisible.value) {
      renderGrid()
    }
  }

  function disposeGrid() {
    if (gridRenderer) {
      gridRenderer.dispose()
      gridRenderer.domElement.remove()
      gridRenderer = null
    }
    gridScene = null
    gridCamera = null
  }

  return {
    gridVisible: readonly(gridVisible),
    gridCanvas,
    initGridRenderer,
    syncGridCamera,
    renderGrid,
    showGroundGrid,
    hideGroundGrid,
    resizeGrid,
    disposeGrid,
  }
}
