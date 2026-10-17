extends Node3D
## Chromaracers Godot lab — HPLC column environment preview.
## Skills: godot-game, godot-project-setup; visual brief = Van Deemter glass tunnel.

@onready var column: Node3D = $ColumnEnvironment
@onready var camera: Camera3D = $Camera3D
@onready var hud_label: Label = $UI/SectorLabel

var _bob: float = 0.0


func _ready() -> void:
	if column and column.has_signal("sector_changed"):
		column.sector_changed.connect(_on_sector_changed)
	print("[godot-lab] Chromaracers column environment main ready")
	if hud_label:
		hud_label.text = "SECTOR 1 — INTRODUÇÃO"


func _process(delta: float) -> void:
	_bob += delta
	# Subtle camera drift down the column for a living preview (no full race yet).
	if camera:
		camera.position.z = 4.5 + sin(_bob * 0.35) * 0.4
		camera.position.y = 0.35 + sin(_bob * 0.7) * 0.08
		camera.look_at(Vector3(0, 0, -18.0), Vector3.UP)


func _on_sector_changed(sector_index: int, sector_name: String) -> void:
	if hud_label:
		hud_label.text = "SECTOR %d — %s" % [sector_index + 1, sector_name]
