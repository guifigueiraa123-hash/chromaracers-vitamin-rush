extends Node3D
class_name ColumnEnvironment
## HPLC glass-column race environment aligned to CHROMARACERS_VISUAL_TARGET.
## Skills: godot-game (MultiMesh/sprites), art bible — glass + purple silica + blue floor.

signal sector_changed(sector_index: int, sector_name: String)

const COLUMN_RADIUS := 4.0
const COLUMN_LENGTH := 80.0
const SILICA_RADIUS := 3.72
const GLASS_RADIUS := 4.05
const RING_COUNT := 12
const SILICA_COUNT := 3400
const INTERIOR_MOLECULE_COUNT := 90
const FLOOR_Y := -COLUMN_RADIUS + 0.62

# Visual Target palette §11
const COL_MOBILE := Color(0.0, 0.682, 0.937) # #00AEEF
const COL_MOBILE_DEEP := Color(0.0, 0.4, 0.8) # #0066CC
const COL_MOBILE_HI := Color(0.098, 0.851, 1.0) # #19D9FF
const COL_STATIONARY := Color(0.318, 0.125, 0.659) # #5120A8
const COL_STATIONARY_HI := Color(0.608, 0.482, 0.910) # #9B7BE8
const COL_STRUCTURE := Color(0.063, 0.169, 0.333) # #102B55
const COL_LIGHT := Color(0.435, 0.918, 1.0) # #6FEAFF

@export var scroll_speed: float = 14.0
@export var show_exterior_traffic: bool = false

var _elapsed: float = 0.0
var _sector: int = 0
var _floor_mat: StandardMaterial3D
var _rings: Array[MeshInstance3D] = []
var _world_env: WorldEnvironment
var _interior_mmi: MultiMeshInstance3D
var _molecule_bases: Array[Transform3D] = []
var _molecule_speeds: PackedFloat32Array = PackedFloat32Array()

const SECTOR_NAMES := [
	"INTRODUÇÃO — fluxo laminar",
	"SEPARAÇÃO — packed bed ativo",
	"DETECTOR — convergência UV/Vis",
]


func _ready() -> void:
	_build_environment()
	_build_glass()
	_build_silica_sprites()
	_build_lab_rings()
	_build_mobile_floor()
	_build_vanishing_point()
	_build_interior_molecules()
	if show_exterior_traffic:
		_build_exterior_traffic_dim()
	_build_soft_dust()
	print("[column] Visual Target tunnel ready — silica=%d molecules=%d" % [SILICA_COUNT, INTERIOR_MOLECULE_COUNT])


func _process(delta: float) -> void:
	_elapsed += delta
	_animate_floor()
	_animate_rings()
	_animate_molecules(delta)
	_update_sector()


func _build_environment() -> void:
	_world_env = WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.08, 0.05, 0.16)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.28, 0.18, 0.42)
	env.ambient_light_energy = 0.65
	env.fog_enabled = true
	env.fog_light_color = Color(0.42, 0.28, 0.62)
	env.fog_density = 0.012
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	# Controlled bloom — player must stay readable (Visual Target §14).
	env.glow_enabled = true
	env.glow_intensity = 0.18
	env.glow_bloom = 0.06
	env.glow_hdr_threshold = 1.1
	_world_env.environment = env
	add_child(_world_env)

	var key := DirectionalLight3D.new()
	key.light_color = Color(0.7, 0.8, 1.0)
	key.light_energy = 0.55
	key.rotation_degrees = Vector3(-40, 20, 0)
	add_child(key)

	var fill := OmniLight3D.new()
	fill.light_color = COL_MOBILE_HI
	fill.light_energy = 0.9
	fill.omni_range = 24.0
	fill.position = Vector3(0, 0.5, 5.0)
	add_child(fill)


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
	mat.albedo_color = Color(0.65, 0.85, 1.0, 0.07)
	mat.roughness = 0.08
	mat.metallic = 0.2
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.emission_enabled = true
	mat.emission = Color(0.2, 0.35, 0.5)
	mat.emission_energy_multiplier = 0.08
	glass.material_override = mat
	add_child(glass)


func _make_silica_material(tex_path: String, tint: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	var tex := load(tex_path) as Texture2D
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
	mat.emission_energy_multiplier = 0.55
	return mat


func _build_silica_sprites() -> void:
	## Packed purple stationary phase on walls — coat + billboard sprites.
	var parent := Node3D.new()
	parent.name = "SilicaPackedBed"
	add_child(parent)

	# Soft purple coat (mass of packed bed) so walls read purple even far away.
	var coat := MeshInstance3D.new()
	coat.name = "SilicaCoat"
	var coat_mesh := CylinderMesh.new()
	coat_mesh.top_radius = SILICA_RADIUS + 0.05
	coat_mesh.bottom_radius = SILICA_RADIUS + 0.05
	coat_mesh.height = COLUMN_LENGTH - 2.0
	coat_mesh.radial_segments = 48
	coat.mesh = coat_mesh
	coat.rotation_degrees = Vector3(90, 0, 0)
	coat.position = Vector3(0, 0, -COLUMN_LENGTH * 0.5)
	var coat_mat := StandardMaterial3D.new()
	coat_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	coat_mat.albedo_color = Color(0.196, 0.106, 0.447, 0.55)
	coat_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	coat_mat.roughness = 0.85
	coat_mat.emission_enabled = true
	coat_mat.emission = COL_STATIONARY
	coat_mat.emission_energy_multiplier = 0.2
	coat.material_override = coat_mat
	parent.add_child(coat)

	var batches := [
		{"path": "res://assets/silica/silica-cluster-large.png", "count": 900, "size": 0.72, "tint": Color(0.443, 0.220, 0.831)},
		{"path": "res://assets/silica/silica-cluster-medium.png", "count": 1100, "size": 0.5, "tint": COL_STATIONARY_HI},
		{"path": "res://assets/silica/silica-particle-large.png", "count": 800, "size": 0.36, "tint": Color(0.55, 0.35, 0.9)},
		{"path": "res://assets/silica/silica-particle-medium.png", "count": 600, "size": 0.26, "tint": Color(0.65, 0.5, 0.95)},
	]

	var rng := RandomNumberGenerator.new()
	rng.seed = 4691
	var placed := 0
	for batch in batches:
		var mmi := MultiMeshInstance3D.new()
		var quad := QuadMesh.new()
		var s: float = batch["size"]
		quad.size = Vector2(s, s)
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.mesh = quad
		mm.instance_count = int(batch["count"])
		mmi.multimesh = mm
		mmi.material_override = _make_silica_material(batch["path"], batch["tint"])
		parent.add_child(mmi)

		for i in int(batch["count"]):
			var z := rng.randf_range(-COLUMN_LENGTH + 1.0, -1.0)
			# Bias packing to upper/side walls; keep floor corridor clear.
			var ang := rng.randf_range(0.35, TAU - 0.35)
			if absf(ang - PI) < 0.45 and rng.randf() < 0.7:
				ang += PI * 0.55 * signf(rng.randf() - 0.5)
			var r := SILICA_RADIUS + rng.randf_range(-0.35, 0.2)
			var x := cos(ang) * r
			var y := sin(ang) * r
			if y < FLOOR_Y + 0.45:
				y = FLOOR_Y + 0.45 + rng.randf_range(0.0, 1.8)
				var side := 1.0 if rng.randf() > 0.5 else -1.0
				x = side * sqrt(maxf(SILICA_RADIUS * SILICA_RADIUS - y * y, 0.4))
			var scale_j := rng.randf_range(0.7, 1.55)
			var pos := Vector3(x, y, z)
			var basis := Basis.from_scale(Vector3.ONE * scale_j)
			mm.set_instance_transform(i, Transform3D(basis, pos))
			placed += 1
	print("[column] silica sprites placed=", placed)


func _build_lab_rings() -> void:
	var parent := Node3D.new()
	parent.name = "LabRings"
	add_child(parent)
	for i in RING_COUNT:
		var ring := MeshInstance3D.new()
		var torus := TorusMesh.new()
		torus.inner_radius = COLUMN_RADIUS - 0.06
		torus.outer_radius = COLUMN_RADIUS + 0.12
		torus.rings = 20
		torus.ring_segments = 40
		ring.mesh = torus
		var z := -3.0 - float(i) * (COLUMN_LENGTH / float(RING_COUNT))
		ring.position = Vector3(0, 0, z)
		ring.rotation_degrees = Vector3(90, 0, 0)

		var mat := StandardMaterial3D.new()
		mat.albedo_color = COL_STRUCTURE
		mat.metallic = 0.85
		mat.roughness = 0.35
		mat.emission_enabled = true
		mat.emission = Color(0.15, 0.35, 0.55)
		mat.emission_energy_multiplier = 0.35
		ring.material_override = mat
		parent.add_child(ring)
		_rings.append(ring)


func _build_mobile_floor() -> void:
	var floor_mesh := MeshInstance3D.new()
	floor_mesh.name = "MobilePhaseFloor"
	var box := BoxMesh.new()
	# Wide river — primary race surface (replaces thin neon lanes).
	box.size = Vector3(COLUMN_RADIUS * 1.55, 0.06, COLUMN_LENGTH - 3.0)
	floor_mesh.mesh = box
	floor_mesh.position = Vector3(0, FLOOR_Y, -COLUMN_LENGTH * 0.5)

	_floor_mat = StandardMaterial3D.new()
	_floor_mat.albedo_color = COL_MOBILE_DEEP
	_floor_mat.emission_enabled = true
	_floor_mat.emission = COL_MOBILE
	_floor_mat.emission_energy_multiplier = 0.85
	_floor_mat.roughness = 0.2
	_floor_mat.metallic = 0.05
	_floor_mat.uv1_scale = Vector3(1.0, 18.0, 1.0)
	floor_mesh.material_override = _floor_mat
	add_child(floor_mesh)

	# Center highlight streak for forward direction.
	var streak := MeshInstance3D.new()
	streak.name = "FloorStreak"
	var streak_box := BoxMesh.new()
	streak_box.size = Vector3(0.55, 0.04, COLUMN_LENGTH - 4.0)
	streak.mesh = streak_box
	streak.position = Vector3(0, FLOOR_Y + 0.04, -COLUMN_LENGTH * 0.5)
	var streak_mat := StandardMaterial3D.new()
	streak_mat.albedo_color = COL_MOBILE_HI
	streak_mat.emission_enabled = true
	streak_mat.emission = COL_MOBILE_HI
	streak_mat.emission_energy_multiplier = 1.1
	streak_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	streak_mat.albedo_color.a = 0.75
	streak.material_override = streak_mat
	_lane_mats_compat(streak_mat)
	add_child(streak)


var _extra_floor_mats: Array[StandardMaterial3D] = []


func _lane_mats_compat(mat: StandardMaterial3D) -> void:
	_extra_floor_mats.append(mat)


func _build_vanishing_point() -> void:
	var disc := MeshInstance3D.new()
	disc.name = "VanishingCyan"
	var cyl := CylinderMesh.new()
	cyl.top_radius = 1.6
	cyl.bottom_radius = 1.6
	cyl.height = 0.12
	cyl.radial_segments = 32
	disc.mesh = cyl
	disc.rotation_degrees = Vector3(90, 0, 0)
	disc.position = Vector3(0, 0.2, -COLUMN_LENGTH + 2.5)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = COL_LIGHT
	mat.emission_enabled = true
	mat.emission = COL_LIGHT
	mat.emission_energy_multiplier = 2.8
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	disc.material_override = mat
	add_child(disc)

	var detector := OmniLight3D.new()
	detector.name = "DetectorGlow"
	detector.light_color = COL_LIGHT
	detector.light_energy = 5.5
	detector.omni_range = 28.0
	detector.position = Vector3(0, 0.3, -COLUMN_LENGTH + 3.0)
	add_child(detector)


func _build_interior_molecules() -> void:
	_interior_mmi = MultiMeshInstance3D.new()
	_interior_mmi.name = "InteriorMolecules"
	var sphere := SphereMesh.new()
	sphere.radius = 0.11
	sphere.height = 0.22
	sphere.radial_segments = 10
	sphere.rings = 6

	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.emission_enabled = true
	mat.emission = Color(1, 1, 1)
	mat.emission_energy_multiplier = 0.9
	mat.roughness = 0.35

	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = sphere
	mm.instance_count = INTERIOR_MOLECULE_COUNT

	var rng := RandomNumberGenerator.new()
	rng.seed = 2026
	var colors := [
		Color(0.0, 0.851, 1.0),
		Color(1.0, 0.31, 0.847),
		Color(1.0, 0.622, 0.11),
		Color(1.0, 0.82, 0.4),
		Color(0.659, 0.333, 0.969),
	]
	_molecule_bases.clear()
	_molecule_speeds = PackedFloat32Array()
	_molecule_speeds.resize(INTERIOR_MOLECULE_COUNT)

	for i in INTERIOR_MOLECULE_COUNT:
		var x := rng.randf_range(-1.6, 1.6)
		var y := rng.randf_range(FLOOR_Y + 0.5, 1.8)
		var z := rng.randf_range(-COLUMN_LENGTH + 4.0, -4.0)
		var s := rng.randf_range(0.55, 1.35)
		var xf := Transform3D(Basis.from_scale(Vector3.ONE * s), Vector3(x, y, z))
		mm.set_instance_transform(i, xf)
		mm.set_instance_color(i, colors[i % colors.size()])
		_molecule_bases.append(xf)
		_molecule_speeds[i] = rng.randf_range(0.45, 1.25)

	_interior_mmi.multimesh = mm
	_interior_mmi.material_override = mat
	add_child(_interior_mmi)

	# Simple 2–3 node clusters (visual Target §6) as child meshes on a few leaders.
	for c in 12:
		var cluster := Node3D.new()
		cluster.name = "MoleculeCluster_%d" % c
		var base_z := -8.0 - float(c) * 5.5
		cluster.position = Vector3(rng.randf_range(-1.2, 1.2), rng.randf_range(0.2, 1.4), base_z)
		var col: Color = colors[c % colors.size()]
		for n in 3:
			var node := MeshInstance3D.new()
			var sm := SphereMesh.new()
			sm.radius = 0.09
			sm.height = 0.18
			node.mesh = sm
			node.position = Vector3(n * 0.16 - 0.16, sin(float(n)) * 0.08, 0)
			var nm := StandardMaterial3D.new()
			nm.albedo_color = col
			nm.emission_enabled = true
			nm.emission = col
			nm.emission_energy_multiplier = 0.85
			node.material_override = nm
			cluster.add_child(node)
		add_child(cluster)


func _build_exterior_traffic_dim() -> void:
	## Optional subordinate exterior flow — off by default until composition locks.
	var mmi := MultiMeshInstance3D.new()
	mmi.name = "ExteriorMoleculesDim"
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.06
	capsule.height = 0.2
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = capsule
	mm.instance_count = 40
	var rng := RandomNumberGenerator.new()
	rng.seed = 99
	for i in 40:
		var ang := rng.randf() * TAU
		var r := GLASS_RADIUS + rng.randf_range(0.4, 1.2)
		var z := rng.randf_range(-COLUMN_LENGTH + 2.0, -2.0)
		mm.set_instance_transform(i, Transform3D(Basis.IDENTITY, Vector3(cos(ang) * r, sin(ang) * r, z)))
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.7, 0.5, 1.0, 0.35)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.emission_enabled = true
	mat.emission = Color(0.5, 0.3, 0.8)
	mat.emission_energy_multiplier = 0.3
	mmi.multimesh = mm
	mmi.material_override = mat
	add_child(mmi)


func _build_soft_dust() -> void:
	var dust := GPUParticles3D.new()
	dust.name = "FlowDust"
	dust.amount = 180
	dust.lifetime = 5.0
	dust.preprocess = 1.5
	dust.visibility_aabb = AABB(Vector3(-6, -6, -COLUMN_LENGTH), Vector3(12, 12, COLUMN_LENGTH + 4))
	var mat := ParticleProcessMaterial.new()
	mat.direction = Vector3(0, 0, 1)
	mat.spread = 12.0
	mat.initial_velocity_min = 1.5
	mat.initial_velocity_max = 5.0
	mat.gravity = Vector3.ZERO
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(1.8, 1.2, COLUMN_LENGTH * 0.4)
	mat.color = Color(0.4, 0.75, 1.0, 0.35)
	dust.process_material = mat
	var pm := SphereMesh.new()
	pm.radius = 0.025
	pm.height = 0.05
	dust.draw_pass_1 = pm
	dust.position = Vector3(0, FLOOR_Y + 0.8, -COLUMN_LENGTH * 0.5)
	add_child(dust)


func _animate_floor() -> void:
	if _floor_mat:
		_floor_mat.uv1_offset = Vector3(0, fmod(_elapsed * scroll_speed * 0.12, 1.0), 0)
		_floor_mat.emission_energy_multiplier = 0.75 + sin(_elapsed * 2.2) * 0.12
	for mat in _extra_floor_mats:
		mat.emission_energy_multiplier = 1.0 + sin(_elapsed * 2.5) * 0.15


func _animate_rings() -> void:
	for i in _rings.size():
		var mat := _rings[i].material_override as StandardMaterial3D
		if mat == null:
			continue
		# Subtle pulse only — rings stay subordinate to player/floor.
		var phase := _elapsed * 1.1 - float(i) * 0.3
		mat.emission_energy_multiplier = 0.25 + absf(sin(phase)) * 0.2


func _animate_molecules(delta: float) -> void:
	if _interior_mmi == null:
		return
	var mm := _interior_mmi.multimesh
	for i in mm.instance_count:
		var xf := mm.get_instance_transform(i)
		xf.origin.z += scroll_speed * delta * _molecule_speeds[i] * 0.55
		if xf.origin.z > -2.0:
			xf.origin.z -= COLUMN_LENGTH - 6.0
		xf.origin.x += sin(_elapsed * 1.4 + float(i)) * delta * 0.15
		mm.set_instance_transform(i, xf)

	# Drift named clusters toward camera (positive Z).
	for child in get_children():
		if child is Node3D and str(child.name).begins_with("MoleculeCluster_"):
			var n := child as Node3D
			n.position.z += scroll_speed * delta * 0.5
			if n.position.z > -2.0:
				n.position.z -= COLUMN_LENGTH - 10.0


func _update_sector() -> void:
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
			env.fog_light_color = Color(0.3, 0.35, 0.55)
			env.fog_density = 0.012
		1:
			env.fog_light_color = Color(0.4, 0.28, 0.55)
			env.fog_density = 0.016
		2:
			env.fog_light_color = Color(0.45, 0.35, 0.65)
			env.fog_density = 0.02
