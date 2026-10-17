extends Node3D
## From-scratch Godot lab entry — Visual Target camera + new Vita art only.

@onready var column: Node3D = $ColumnLab
@onready var camera: Camera3D = $Camera3D
@onready var hud: Label = $UI/SectorLabel
@onready var vita: Node3D = $Vita

const FOLLOW_BACK := 3.3
const FOLLOW_HEIGHT := 1.4
const LOOK_AHEAD := 15.0
const FRAME_W := 64
const FRAME_H := 64

var _t: float = 0.0
var _sprite: Sprite3D
var _atlas: AtlasTexture
var _frame_count: int = 8
var _floor_y: float = -3.5


func _ready() -> void:
	_setup_vita()
	if column and column.has_signal("sector_changed"):
		column.sector_changed.connect(_on_sector)
	if hud:
		hud.text = "SECTOR 1 — INTRODUÇÃO"
	print("[godot-lab] from-scratch main ready")


func _setup_vita() -> void:
	vita.position = Vector3(0.0, _floor_y, 1.15)
	_sprite = Sprite3D.new()
	_sprite.name = "VitaSprite"
	_sprite.pixel_size = 0.03
	_sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_sprite.shaded = false
	_sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	_sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	_sprite.position = Vector3(0, 0.55, 0)

	var path := "res://assets/generated/vita_c_run.png"
	if ResourceLoader.exists(path):
		var sheet := load(path) as Texture2D
		if sheet:
			_atlas = AtlasTexture.new()
			_atlas.atlas = sheet
			# Infer frame count from aspect (wide sheet → N square-ish frames).
			var w := sheet.get_width()
			var h := maxi(sheet.get_height(), 1)
			_frame_count = clampi(int(round(float(w) / float(h))), 4, 12)
			var fw := int(w / _frame_count)
			_atlas.region = Rect2(0, 0, fw, h)
			_sprite.texture = _atlas
			vita.add_child(_sprite)
			print("[godot-lab] Vita loaded from generated art frames=%d" % _frame_count)
			return

	# Temporary stand-in until Muapi generates vita_c_run.png (not prior repo sheets).
	var cap := MeshInstance3D.new()
	var mesh := CapsuleMesh.new()
	mesh.radius = 0.2
	mesh.height = 0.65
	cap.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.55, 0.15)
	cap.material_override = mat
	vita.add_child(cap)
	print("[godot-lab] Vita placeholder (awaiting assets/generated/vita_c_run.png)")


func _process(delta: float) -> void:
	_t += delta
	if _atlas and _sprite:
		var sheet := _atlas.atlas
		var w := sheet.get_width()
		var h := sheet.get_height()
		var fw := int(w / _frame_count)
		var frame := int(floor(_t * 10.0)) % _frame_count
		_atlas.region = Rect2(frame * fw, 0, fw, h)
	if vita:
		vita.position.y = _floor_y + sin(_t * 8.0) * 0.035
		vita.position.x = sin(_t * 0.55) * 0.07
	_follow_cam()


func _follow_cam() -> void:
	if camera == null or vita == null:
		return
	var target := vita.global_position
	camera.global_position = target + Vector3(0.0, FOLLOW_HEIGHT, FOLLOW_BACK)
	camera.look_at(target + Vector3(0.0, 0.5, -LOOK_AHEAD), Vector3.UP)


func _on_sector(idx: int, sector_name: String) -> void:
	if hud:
		hud.text = "SECTOR %d — %s" % [idx + 1, sector_name]
