extends Node3D
class_name ColumnLab
## From-scratch HPLC column lab. Loads ONLY res://assets/generated/* (Muapi).
## Concept/direction: docs/CHROMARACERS_VISUAL_TARGET.md + godot/ART_BIBLE.md

signal sector_changed(sector_index: int, sector_name: String)

const COLUMN_RADIUS := 4.2
const COLUMN_LENGTH := 72.0
const SILICA_R := 3.9
const GLASS_R := 4.25
const FLOOR_Y := -COLUMN_RADIUS + 0.7
const RING_COUNT := 11
const SILICA_COUNT := 3200
const MOLECULE_COUNT := 70

const COL_MOBILE := Color(0.0, 0.682, 0.937)
const COL_MOBILE_DEEP := Color(0.0, 0.4, 0.8)
const COL_MOBILE_HI := Color(0.098, 0.851, 1.0)
const COL_STATIONARY := Color(0.318, 0.125, 0.659)
const COL_STATIONARY_HI := Color(0.608, 0.482, 0.910)
const COL_STRUCTURE := Color(0.063, 0.169, 0.333)
const COL_LIGHT := Color(0.435, 0.918, 1.0)

@export var scroll_speed: float = 13.0

var _elapsed: float = 0.0
var _sector: int = 0
var _world_env: WorldEnvironment
var _floor_mat: StandardMaterial3D
var _rings: Array[MeshInstance3D] = []
var _molecules: MultiMeshInstance3D
var _mol_speeds: PackedFloat32Array = PackedFloat32Array()
var _using_generated: Dictionary = {}

const SECTOR_NAMES := [
	"INTRODUÇÃO — fluxo laminar",
	"SEPARAÇÃO — packed bed",
	"DETECTOR — UV/Vis",
]


func _ready() -> void:
	_build_environment()
	_build_glass()
	_build_silica()
	_build_lab_rings()
	_build_floor()
	_build_vanishing()
	_build_molecules()
	print("[column-lab] ready generated=%s" % str(_using_generated))


func _process(delta: float) -> void:
	_elapsed += delta
	if _floor_mat:
		_floor_mat.uv1_offset.y = fmod(_elapsed * scroll_speed * 0.11, 1.0)
	_animate_rings()
	_animate_molecules(delta)
	_update_sector()


func _tex(path: String) -> Texture2D:
	if ResourceLoader.exists(path):
		var t := load(path) as Texture2D
		if t:
			_using_generated[path.get_file()] = true
			return t
	_using_generated[path.get_file()] = false
	return null


func _build_environment() -> void:
	_world_env = WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.07, 0.04, 0.14)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.3, 0.2, 0.45)
	env.ambient_light_energy = 0.6
	env.fog_enabled = true
	env.fog_light_color = Color(0.4, 0.28, 0.6)
	env.fog_density = 0.012
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.glow_enabled = true
	env.glow_intensity = 0.16
	env.glow_bloom = 0.05
	env.glow_hdr_threshold = 1.15
	_world_env.environment = env
	add_child(_world_env)

	var key := DirectionalLight3D.new()
	key.light_color = Color(0.75, 0.82, 1.0)
	key.light_energy = 0.5
	key.rotation_degrees = Vector3(-38, 18, 0)
	add_child(key)

	var fill := OmniLight3D.new()
	fill.light_color = COL_MOBILE_HI
	fill.light_energy = 0.85
	fill.omni_range = 22.0
	fill.position = Vector3(0, 0.4, 4.5)
	add_child(fill)


func _build_glass() -> void:
	var glass := MeshInstance3D.new()
	glass.name = "Glass"
	var cyl := CylinderMesh.new()
	cyl.top_radius = GLASS_R
	cyl.bottom_radius = GLASS_R
	cyl.height = COLUMN_LENGTH
	cyl.radial_segments = 48
	glass.mesh = cyl
	glass.rotation_degrees = Vector3(90, 0, 0)
	glass.position = Vector3(0, 0, -COLUMN_LENGTH * 0.5)
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(0.7, 0.88, 1.0, 0.06)
	mat.roughness = 0.08
	mat.metallic = 0.25
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	glass.material_override = mat
	add_child(glass)


func _silica_mat(tex: Texture2D, tint: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	if tex:
		mat.albedo_texture = tex
		mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	mat.albedo_color = tint
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	mat.alpha_scissor_threshold = 0.12
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.emission_enabled = true
	mat.emission = tint
	mat.emission_energy_multiplier = 0.5
	return mat


func _build_silica() -> void:
	var parent := Node3D.new()
	parent.name = "Silica"
	add_child(parent)

	# Mass coat so purple walls read even before/without sprites.
	var coat := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = SILICA_R
	cm.bottom_radius = SILICA_R
	cm.height = COLUMN_LENGTH - 2.0
	cm.radial_segments = 48
	coat.mesh = cm
	coat.rotation_degrees = Vector3(90, 0, 0)
	coat.position = Vector3(0, 0, -COLUMN_LENGTH * 0.5)
	var coat_mat := StandardMaterial3D.new()
	coat_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	coat_mat.albedo_color = Color(0.196, 0.106, 0.447, 0.5)
	coat_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	coat_mat.emission_enabled = true
	coat_mat.emission = COL_STATIONARY
	coat_mat.emission_energy_multiplier = 0.18
	coat.material_override = coat_mat
	parent.add_child(coat)

	var tex_a := _tex("res://assets/generated/silica_cluster_a.png")
	var tex_b := _tex("res://assets/generated/silica_cluster_b.png")
	var tex_p := _tex("res://assets/generated/silica_particle.png")
	var batches := [
		{"tex": tex_a, "count": 1100, "size": 0.7, "tint": COL_STATIONARY_HI},
		{"tex": tex_b, "count": 1100, "size": 0.55, "tint": Color(0.443, 0.22, 0.831)},
		{"tex": tex_p, "count": 1000, "size": 0.32, "tint": Color(0.55, 0.38, 0.92)},
	]

	var rng := RandomNumberGenerator.new()
	rng.seed = 20261017
	for batch in batches:
		var mmi := MultiMeshInstance3D.new()
		var quad := QuadMesh.new()
		quad.size = Vector2(batch["size"], batch["size"])
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.mesh = quad
		mm.instance_count = int(batch["count"])
		mmi.multimesh = mm
		mmi.material_override = _silica_mat(batch["tex"], batch["tint"])
		parent.add_child(mmi)
		for i in int(batch["count"]):
			var z := rng.randf_range(-COLUMN_LENGTH + 1.0, -1.0)
			var ang := rng.randf_range(0.4, TAU - 0.4)
			var r := SILICA_R + rng.randf_range(-0.3, 0.18)
			var x := cos(ang) * r
			var y := sin(ang) * r
			if y < FLOOR_Y + 0.5:
				y = FLOOR_Y + 0.5 + rng.randf_range(0.2, 2.0)
				var side := 1.0 if rng.randf() > 0.5 else -1.0
				x = side * sqrt(maxf(SILICA_R * SILICA_R - y * y, 0.5))
			var s := rng.randf_range(0.7, 1.5)
			mm.set_instance_transform(i, Transform3D(Basis.from_scale(Vector3.ONE * s), Vector3(x, y, z)))


func _build_lab_rings() -> void:
	var parent := Node3D.new()
	parent.name = "LabRings"
	add_child(parent)
	var ring_tex := _tex("res://assets/generated/lab_ring.png")
	for i in RING_COUNT:
		var ring := MeshInstance3D.new()
		var torus := TorusMesh.new()
		torus.inner_radius = COLUMN_RADIUS - 0.05
		torus.outer_radius = COLUMN_RADIUS + 0.14
		torus.rings = 18
		torus.ring_segments = 36
		ring.mesh = torus
		ring.position = Vector3(0, 0, -3.0 - float(i) * (COLUMN_LENGTH / float(RING_COUNT)))
		ring.rotation_degrees = Vector3(90, 0, 0)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = COL_STRUCTURE
		if ring_tex:
			mat.albedo_texture = ring_tex
			mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
		mat.metallic = 0.85
		mat.roughness = 0.4
		mat.emission_enabled = true
		mat.emission = Color(0.12, 0.28, 0.45)
		mat.emission_energy_multiplier = 0.28
		ring.material_override = mat
		parent.add_child(ring)
		_rings.append(ring)


func _build_floor() -> void:
	var floor_mesh := MeshInstance3D.new()
	floor_mesh.name = "MobilePhase"
	var box := BoxMesh.new()
	box.size = Vector3(COLUMN_RADIUS * 1.6, 0.07, COLUMN_LENGTH - 3.0)
	floor_mesh.mesh = box
	floor_mesh.position = Vector3(0, FLOOR_Y, -COLUMN_LENGTH * 0.5)
	_floor_mat = StandardMaterial3D.new()
	var floor_tex := _tex("res://assets/generated/mobile_phase_floor.png")
	if floor_tex:
		_floor_mat.albedo_texture = floor_tex
		_floor_mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR
		_floor_mat.uv1_scale = Vector3(1.0, 10.0, 1.0)
	_floor_mat.albedo_color = COL_MOBILE_DEEP
	_floor_mat.emission_enabled = true
	_floor_mat.emission = COL_MOBILE
	_floor_mat.emission_energy_multiplier = 0.8
	_floor_mat.roughness = 0.25
	floor_mesh.material_override = _floor_mat
	add_child(floor_mesh)

	var streak := MeshInstance3D.new()
	var sb := BoxMesh.new()
	sb.size = Vector3(0.5, 0.04, COLUMN_LENGTH - 4.0)
	streak.mesh = sb
	streak.position = Vector3(0, FLOOR_Y + 0.05, -COLUMN_LENGTH * 0.5)
	var sm := StandardMaterial3D.new()
	sm.albedo_color = Color(COL_MOBILE_HI.r, COL_MOBILE_HI.g, COL_MOBILE_HI.b, 0.7)
	sm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	sm.emission_enabled = true
	sm.emission = COL_MOBILE_HI
	sm.emission_energy_multiplier = 1.05
	streak.material_override = sm
	add_child(streak)


func _build_vanishing() -> void:
	var disc := MeshInstance3D.new()
	disc.name = "Vanishing"
	var cyl := CylinderMesh.new()
	cyl.top_radius = 1.5
	cyl.bottom_radius = 1.5
	cyl.height = 0.1
	disc.mesh = cyl
	disc.rotation_degrees = Vector3(90, 0, 0)
	disc.position = Vector3(0, 0.15, -COLUMN_LENGTH + 2.2)
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_color = COL_LIGHT
	mat.emission_enabled = true
	mat.emission = COL_LIGHT
	mat.emission_energy_multiplier = 2.6
	disc.material_override = mat
	add_child(disc)

	var light := OmniLight3D.new()
	light.name = "Detector"
	light.light_color = COL_LIGHT
	light.light_energy = 5.0
	light.omni_range = 26.0
	light.position = Vector3(0, 0.25, -COLUMN_LENGTH + 2.8)
	add_child(light)


func _build_molecules() -> void:
	_molecules = MultiMeshInstance3D.new()
	_molecules.name = "Analytes"
	var mol_tex := _tex("res://assets/generated/analyte_molecule.png")
	var mesh: Mesh
	if mol_tex:
		var q := QuadMesh.new()
		q.size = Vector2(0.35, 0.35)
		mesh = q
	else:
		var s := SphereMesh.new()
		s.radius = 0.1
		s.height = 0.2
		mesh = s
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = mesh
	mm.instance_count = MOLECULE_COUNT
	var mat := StandardMaterial3D.new()
	if mol_tex:
		mat.albedo_texture = mol_tex
		mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
		mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
		mat.alpha_scissor_threshold = 0.1
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.vertex_color_use_as_albedo = true
	mat.emission_enabled = true
	mat.emission = Color.WHITE
	mat.emission_energy_multiplier = 0.7
	_molecules.material_override = mat

	var rng := RandomNumberGenerator.new()
	rng.seed = 77
	var colors := [
		Color(0.0, 0.85, 1.0),
		Color(1.0, 0.31, 0.85),
		Color(1.0, 0.62, 0.11),
		Color(1.0, 0.82, 0.4),
	]
	_mol_speeds.resize(MOLECULE_COUNT)
	for i in MOLECULE_COUNT:
		var xf := Transform3D(
			Basis.from_scale(Vector3.ONE * rng.randf_range(0.6, 1.3)),
			Vector3(rng.randf_range(-1.5, 1.5), rng.randf_range(FLOOR_Y + 0.6, 1.6), rng.randf_range(-COLUMN_LENGTH + 4.0, -4.0))
		)
		mm.set_instance_transform(i, xf)
		mm.set_instance_color(i, colors[i % colors.size()])
		_mol_speeds[i] = rng.randf_range(0.5, 1.2)
	_molecules.multimesh = mm
	add_child(_molecules)


func _animate_rings() -> void:
	for i in _rings.size():
		var mat := _rings[i].material_override as StandardMaterial3D
		if mat:
			mat.emission_energy_multiplier = 0.22 + absf(sin(_elapsed * 1.0 - float(i) * 0.25)) * 0.18


func _animate_molecules(delta: float) -> void:
	if _molecules == null:
		return
	var mm := _molecules.multimesh
	for i in mm.instance_count:
		var xf := mm.get_instance_transform(i)
		xf.origin.z += scroll_speed * delta * _mol_speeds[i] * 0.5
		if xf.origin.z > -2.0:
			xf.origin.z -= COLUMN_LENGTH - 6.0
		mm.set_instance_transform(i, xf)


func _update_sector() -> void:
	var dist := fmod(_elapsed * scroll_speed, COLUMN_LENGTH)
	var next := 0
	if dist > COLUMN_LENGTH * 0.66:
		next = 2
	elif dist > COLUMN_LENGTH * 0.33:
		next = 1
	if next == _sector:
		return
	_sector = next
	var env := _world_env.environment
	match _sector:
		0:
			env.fog_light_color = Color(0.32, 0.35, 0.55)
			env.fog_density = 0.011
		1:
			env.fog_light_color = Color(0.42, 0.28, 0.55)
			env.fog_density = 0.015
		2:
			env.fog_light_color = Color(0.45, 0.32, 0.62)
			env.fog_density = 0.018
	sector_changed.emit(_sector, SECTOR_NAMES[_sector])
