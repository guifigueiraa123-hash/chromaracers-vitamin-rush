extends Node3D
class_name ColumnEnvironment
## HPLC glass-column race environment (Van Deemter multipath microcosm).
## Skills used: godot-game (scenes/typed GDScript/MultiMesh/particles),
## art-bible brief — glass + silica coat + exterior flow + dynamic sectors.

signal sector_changed(sector_index: int, sector_name: String)

const COLUMN_RADIUS := 4.0
const COLUMN_LENGTH := 80.0
const SILICA_RADIUS := 3.85
const GLASS_RADIUS := 4.05
const RING_COUNT := 14
const SILICA_COUNT := 2200
const EXTERIOR_MOLECULE_COUNT := 120
const LANE_OFFSETS := [-1.35, 0.0, 1.35]

@export var scroll_speed: float = 12.0
@export var band_speed: float = 8.0

var _elapsed: float = 0.0
var _sector: int = 0
var _silica_mmi: MultiMeshInstance3D
var _exterior_mmi: MultiMeshInstance3D
var _rings: Array[MeshInstance3D] = []
var _lane_mats: Array[StandardMaterial3D] = []
var _world_env: WorldEnvironment
var _band_ribbons: Array[MeshInstance3D] = []

const SECTOR_NAMES := [
	"INTRODUÇÃO — fluxo laminar",
	"SEPARAÇÃO — multipath ativo",
	"DETECTOR — convergência UV/Vis",
]


func _ready() -> void:
	_build_environment()
	_build_glass()
	_build_silica()
	_build_rings()
	_build_lanes()
	_build_exterior_traffic()
	_build_concentration_bands()
	_build_particles()
	print("[column] Van Deemter glass tunnel ready — sectors=%d silica=%d" % [SECTOR_NAMES.size(), SILICA_COUNT])


func _process(delta: float) -> void:
	_elapsed += delta
	_animate_lanes(delta)
	_animate_rings()
	_animate_exterior(delta)
	_animate_bands(delta)
	_update_sector()


func _build_environment() -> void:
	_world_env = WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.04, 0.07, 0.14)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.15, 0.25, 0.4)
	env.ambient_light_energy = 0.55
	env.fog_enabled = true
	env.fog_light_color = Color(0.2, 0.45, 0.7)
	env.fog_density = 0.018
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.glow_enabled = true
	env.glow_intensity = 0.35
	env.glow_bloom = 0.15
	_world_env.environment = env
	add_child(_world_env)

	var key := DirectionalLight3D.new()
	key.light_color = Color(0.55, 0.75, 1.0)
	key.light_energy = 0.45
	key.rotation_degrees = Vector3(-35, 25, 0)
	add_child(key)

	var fill := OmniLight3D.new()
	fill.light_color = Color(0.3, 0.85, 1.0)
	fill.light_energy = 1.2
	fill.omni_range = 28.0
	fill.position = Vector3(0, 0, 6)
	add_child(fill)

	var detector := OmniLight3D.new()
	detector.name = "DetectorGlow"
	detector.light_color = Color(0.75, 0.35, 1.0)
	detector.light_energy = 4.0
	detector.omni_range = 22.0
	detector.position = Vector3(0, 0, -COLUMN_LENGTH + 6.0)
	add_child(detector)


func _build_glass() -> void:
	var glass := MeshInstance3D.new()
	glass.name = "GlassWall"
	var cyl := CylinderMesh.new()
	cyl.top_radius = GLASS_RADIUS
	cyl.bottom_radius = GLASS_RADIUS
	cyl.height = COLUMN_LENGTH
	cyl.radial_segments = 48
	cyl.rings = 1
	glass.mesh = cyl
	glass.rotation_degrees = Vector3(90, 0, 0)
	glass.position = Vector3(0, 0, -COLUMN_LENGTH * 0.5)

	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(0.55, 0.85, 1.0, 0.08)
	mat.roughness = 0.05
	mat.metallic = 0.15
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.emission_enabled = true
	mat.emission = Color(0.15, 0.4, 0.55)
	mat.emission_energy_multiplier = 0.2
	glass.material_override = mat
	add_child(glass)


func _build_silica() -> void:
	_silica_mmi = MultiMeshInstance3D.new()
	_silica_mmi.name = "SilicaPackedBed"
	var sphere := SphereMesh.new()
	sphere.radius = 0.09
	sphere.height = 0.18
	sphere.radial_segments = 8
	sphere.rings = 4

	var bead_mat := StandardMaterial3D.new()
	bead_mat.albedo_color = Color(0.72, 0.88, 0.98, 0.85)
	bead_mat.roughness = 0.25
	bead_mat.metallic = 0.05
	bead_mat.emission_enabled = true
	bead_mat.emission = Color(0.25, 0.55, 0.75)
	bead_mat.emission_energy_multiplier = 0.35
	bead_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = sphere
	mm.instance_count = SILICA_COUNT

	var rng := RandomNumberGenerator.new()
	rng.seed = 4691
	for i in SILICA_COUNT:
		var z := rng.randf_range(-COLUMN_LENGTH + 1.0, -1.0)
		var ang := rng.randf() * TAU
		# Pack near the wall (stationary phase coat), leave center open for race path.
		var r := SILICA_RADIUS + rng.randf_range(-0.25, 0.12)
		# Bias: fewer beads near floor lanes so track stays readable.
		var y := sin(ang) * r
		if absf(y) < 0.55 and absf(cos(ang)) > 0.65:
			y -= signf(y) * 0.35
		var x := cos(ang) * r
		var s := rng.randf_range(0.55, 1.35)
		var xf := Transform3D(Basis.from_scale(Vector3.ONE * s), Vector3(x, y, z))
		mm.set_instance_transform(i, xf)

	_silica_mmi.multimesh = mm
	_silica_mmi.material_override = bead_mat
	add_child(_silica_mmi)


func _build_rings() -> void:
	var parent := Node3D.new()
	parent.name = "NeonRings"
	add_child(parent)
	for i in RING_COUNT:
		var ring := MeshInstance3D.new()
		var torus := TorusMesh.new()
		torus.inner_radius = COLUMN_RADIUS - 0.08
		torus.outer_radius = COLUMN_RADIUS + 0.1
		torus.rings = 24
		torus.ring_segments = 48
		ring.mesh = torus
		var z := -2.0 - float(i) * (COLUMN_LENGTH / float(RING_COUNT))
		ring.position = Vector3(0, 0, z)
		ring.rotation_degrees = Vector3(90, 0, 0)

		var mat := StandardMaterial3D.new()
		mat.emission_enabled = true
		mat.emission = Color(0.2, 0.95, 1.0)
		mat.emission_energy_multiplier = 2.4
		mat.albedo_color = Color(0.1, 0.4, 0.5)
		mat.roughness = 0.3
		ring.material_override = mat
		parent.add_child(ring)
		_rings.append(ring)


func _build_lanes() -> void:
	var parent := Node3D.new()
	parent.name = "Lanes"
	add_child(parent)
	for i in LANE_OFFSETS.size():
		var lane := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(0.55, 0.04, COLUMN_LENGTH - 4.0)
		lane.mesh = box
		lane.position = Vector3(LANE_OFFSETS[i], -COLUMN_RADIUS + 0.55, -COLUMN_LENGTH * 0.5)

		var mat := StandardMaterial3D.new()
		mat.emission_enabled = true
		mat.emission = Color(0.15, 0.9, 1.0)
		mat.emission_energy_multiplier = 1.6
		mat.albedo_color = Color(0.05, 0.25, 0.35)
		mat.uv1_scale = Vector3(1, 12, 1)
		lane.material_override = mat
		_lane_mats.append(mat)
		parent.add_child(lane)

		# Multipath hints — faint alternate routes through packing (Van Deemter A-term).
		if i == 1:
			continue
		var alt := MeshInstance3D.new()
		var alt_box := BoxMesh.new()
		alt_box.size = Vector3(0.18, 0.02, COLUMN_LENGTH * 0.35)
		alt.mesh = alt_box
		alt.position = Vector3(LANE_OFFSETS[i] * 1.55, -COLUMN_RADIUS + 1.2, -COLUMN_LENGTH * 0.35)
		alt.rotation_degrees = Vector3(0, 8.0 * signf(LANE_OFFSETS[i]), 12.0 * signf(LANE_OFFSETS[i]))
		var alt_mat := StandardMaterial3D.new()
		alt_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		alt_mat.albedo_color = Color(0.4, 1.0, 0.85, 0.25)
		alt_mat.emission_enabled = true
		alt_mat.emission = Color(0.3, 1.0, 0.7)
		alt_mat.emission_energy_multiplier = 0.6
		alt.material_override = alt_mat
		parent.add_child(alt)


func _build_exterior_traffic() -> void:
	_exterior_mmi = MultiMeshInstance3D.new()
	_exterior_mmi.name = "ExteriorMolecules"
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.08
	capsule.height = 0.28

	var mat := StandardMaterial3D.new()
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.55, 0.2)
	mat.emission_energy_multiplier = 2.0
	mat.albedo_color = Color(1.0, 0.7, 0.35)
	mat.vertex_color_use_as_albedo = true

	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = capsule
	mm.instance_count = EXTERIOR_MOLECULE_COUNT

	var rng := RandomNumberGenerator.new()
	rng.seed = 1701
	var colors := [
		Color(1.0, 0.45, 0.2),
		Color(0.3, 1.0, 0.7),
		Color(0.85, 0.4, 1.0),
		Color(0.3, 0.7, 1.0),
		Color(1.0, 0.9, 0.3),
	]
	for i in EXTERIOR_MOLECULE_COUNT:
		var ang := rng.randf() * TAU
		var r := GLASS_RADIUS + rng.randf_range(0.35, 1.8)
		var z := rng.randf_range(-COLUMN_LENGTH + 2.0, -2.0)
		var s := rng.randf_range(0.7, 1.6)
		var xf := Transform3D(Basis.from_scale(Vector3(s, s, s * 1.4)), Vector3(cos(ang) * r, sin(ang) * r, z))
		mm.set_instance_transform(i, xf)
		mm.set_instance_color(i, colors[i % colors.size()])

	_exterior_mmi.multimesh = mm
	_exterior_mmi.material_override = mat
	add_child(_exterior_mmi)


func _build_concentration_bands() -> void:
	var parent := Node3D.new()
	parent.name = "ConcentrationBands"
	add_child(parent)
	for i in 3:
		var band := MeshInstance3D.new()
		var torus := TorusMesh.new()
		torus.inner_radius = GLASS_RADIUS + 0.2
		torus.outer_radius = GLASS_RADIUS + 0.55
		torus.rings = 16
		torus.ring_segments = 32
		band.mesh = torus
		band.rotation_degrees = Vector3(90, 0, 0)
		band.position = Vector3(0, 0, -10.0 - float(i) * 18.0)
		var mat := StandardMaterial3D.new()
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.albedo_color = Color(0.6, 0.3, 1.0, 0.35)
		mat.emission_enabled = true
		mat.emission = [Color(0.9, 0.3, 1.0), Color(0.2, 1.0, 0.8), Color(1.0, 0.5, 0.2)][i]
		mat.emission_energy_multiplier = 1.8
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		band.material_override = mat
		parent.add_child(band)
		_band_ribbons.append(band)


func _build_particles() -> void:
	var dust := GPUParticles3D.new()
	dust.name = "FlowDust"
	dust.amount = 400
	dust.lifetime = 4.0
	dust.preprocess = 2.0
	dust.visibility_aabb = AABB(Vector3(-8, -8, -COLUMN_LENGTH), Vector3(16, 16, COLUMN_LENGTH + 4))
	var mat := ParticleProcessMaterial.new()
	mat.direction = Vector3(0, 0, 1)
	mat.spread = 18.0
	mat.initial_velocity_min = 2.0
	mat.initial_velocity_max = 7.0
	mat.gravity = Vector3.ZERO
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(GLASS_RADIUS + 1.2, GLASS_RADIUS + 1.2, COLUMN_LENGTH * 0.45)
	mat.color = Color(0.5, 0.85, 1.0, 0.65)
	dust.process_material = mat
	var pm := SphereMesh.new()
	pm.radius = 0.03
	pm.height = 0.06
	dust.draw_pass_1 = pm
	dust.position = Vector3(0, 0, -COLUMN_LENGTH * 0.5)
	add_child(dust)


func _animate_lanes(_delta: float) -> void:
	for mat in _lane_mats:
		mat.uv1_offset = Vector3(0, fmod(_elapsed * scroll_speed * 0.15, 1.0), 0)
		mat.emission_energy_multiplier = 1.4 + sin(_elapsed * 3.0) * 0.35


func _animate_rings() -> void:
	for i in _rings.size():
		var mat := _rings[i].material_override as StandardMaterial3D
		if mat == null:
			continue
		var phase := _elapsed * 2.2 - float(i) * 0.45
		mat.emission_energy_multiplier = 1.2 + absf(sin(phase)) * 2.8


func _animate_exterior(delta: float) -> void:
	if _exterior_mmi == null:
		return
	var mm := _exterior_mmi.multimesh
	for i in mm.instance_count:
		var xf := mm.get_instance_transform(i)
		xf.origin.z += scroll_speed * delta * (0.65 + fmod(float(i) * 0.17, 1.0))
		if xf.origin.z > -1.0:
			xf.origin.z -= COLUMN_LENGTH - 3.0
		# Slight orbital drift — living exterior flow.
		var ang := atan2(xf.origin.y, xf.origin.x) + delta * 0.15
		var r := Vector2(xf.origin.x, xf.origin.y).length()
		xf.origin.x = cos(ang) * r
		xf.origin.y = sin(ang) * r
		mm.set_instance_transform(i, xf)


func _animate_bands(delta: float) -> void:
	for i in _band_ribbons.size():
		var band := _band_ribbons[i]
		band.position.z += band_speed * delta * (0.7 + float(i) * 0.15)
		if band.position.z > -2.0:
			band.position.z -= COLUMN_LENGTH - 8.0
		var mat := band.material_override as StandardMaterial3D
		if mat:
			mat.emission_energy_multiplier = 1.2 + sin(_elapsed * 2.0 + float(i)) * 0.9


func _update_sector() -> void:
	# Camera sits near z≈0 looking down -Z; advance sector by elapsed as proxy for distance.
	var dist_proxy := fmod(_elapsed * scroll_speed, COLUMN_LENGTH)
	var next := 0
	if dist_proxy > COLUMN_LENGTH * 0.66:
		next = 2
	elif dist_proxy > COLUMN_LENGTH * 0.33:
		next = 1
	if next != _sector:
		_sector = next
		_apply_sector(_sector)
		sector_changed.emit(_sector, SECTOR_NAMES[_sector])
		print("[column] sector -> ", SECTOR_NAMES[_sector])


func _apply_sector(idx: int) -> void:
	if _world_env == null or _world_env.environment == null:
		return
	var env := _world_env.environment
	match idx:
		0:
			env.fog_light_color = Color(0.2, 0.45, 0.7)
			env.fog_density = 0.016
		1:
			env.fog_light_color = Color(0.35, 0.55, 0.85)
			env.fog_density = 0.022
		2:
			env.fog_light_color = Color(0.55, 0.3, 0.75)
			env.fog_density = 0.028
