extends Node3D
## Chromaracers Godot lab — Visual Target composition preview.
## Camera behind Vita (lower-middle), looking toward cyan vanishing point.

@onready var column: Node3D = $ColumnEnvironment
@onready var camera: Camera3D = $Camera3D
@onready var hud_label: Label = $UI/SectorLabel
@onready var vita: Node3D = $Vita

const FOLLOW_BACK := 3.2
const FOLLOW_HEIGHT := 1.35
const LOOK_AHEAD := 14.0
const FRAME_W := 64
const FRAME_H := 64
const FRAME_COUNT := 8

var _bob: float = 0.0
var _anim_t: float = 0.0
var _vita_sprite: Sprite3D
var _atlas: AtlasTexture


func _ready() -> void:
	_setup_vita()
	if column and column.has_signal("sector_changed"):
		column.sector_changed.connect(_on_sector_changed)
	print("[godot-lab] Visual Target main ready")
	if hud_label:
		hud_label.text = "SECTOR 1 — INTRODUÇÃO"


func _setup_vita() -> void:
	if vita == null:
		vita = Node3D.new()
		vita.name = "Vita"
		add_child(vita)
	# Stand on mobile-phase floor (FLOOR_Y ≈ -3.38).
	vita.position = Vector3(0.0, -3.05, 1.2)

	_vita_sprite = Sprite3D.new()
	_vita_sprite.name = "VitaSprite"
	_vita_sprite.pixel_size = 0.028
	_vita_sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_vita_sprite.shaded = false
	_vita_sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	_vita_sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	_vita_sprite.position = Vector3(0, 0.55, 0)

	var sheet := load("res://assets/characters/vita-c-run-final-spritesheet.png") as Texture2D
	if sheet:
		_atlas = AtlasTexture.new()
		_atlas.atlas = sheet
		_atlas.region = Rect2(0, 0, FRAME_W, FRAME_H)
		_vita_sprite.texture = _atlas
	else:
		push_warning("Vita spritesheet missing — using placeholder capsule")
		var cap := MeshInstance3D.new()
		var mesh := CapsuleMesh.new()
		mesh.radius = 0.22
		mesh.height = 0.7
		cap.mesh = mesh
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(1.0, 0.55, 0.15)
		cap.material_override = mat
		vita.add_child(cap)
		return

	vita.add_child(_vita_sprite)


func _process(delta: float) -> void:
	_bob += delta
	_anim_t += delta
	_animate_vita()
	_follow_camera()


func _animate_vita() -> void:
	if _atlas == null:
		return
	var frame := int(floor(_anim_t * 10.0)) % FRAME_COUNT
	_atlas.region = Rect2(frame * FRAME_W, 0, FRAME_W, FRAME_H)
	if vita:
		vita.position.y = -3.05 + sin(_bob * 8.0) * 0.04
		vita.position.x = sin(_bob * 0.6) * 0.08


func _follow_camera() -> void:
	if camera == null or vita == null:
		return
	var target := vita.global_position
	var cam_pos := target + Vector3(0.0, FOLLOW_HEIGHT, FOLLOW_BACK)
	cam_pos.y += sin(_bob * 0.7) * 0.03
	camera.global_position = cam_pos
	var look := target + Vector3(0.0, 0.45, -LOOK_AHEAD)
	camera.look_at(look, Vector3.UP)


func _on_sector_changed(sector_index: int, sector_name: String) -> void:
	if hud_label:
		hud_label.text = "SECTOR %d — %s" % [sector_index + 1, sector_name]
