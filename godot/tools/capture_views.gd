extends SceneTree
## Headless composition captures at near / mid / far scroll proxies.
## Usage: godot --path godot --headless --script res://tools/capture_views.gd


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var err := change_scene_to_file("res://scenes/main.tscn")
	if err != OK:
		push_error("Failed to load main.tscn: %s" % err)
		quit(1)
		return
	await process_frame
	await process_frame
	var root := get_root()
	var main := root.get_child(root.get_child_count() - 1)
	if main == null:
		push_error("No main scene root")
		quit(1)
		return

	var out_dir := "user://captures"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(out_dir))
	# Also write next to project for walkthrough artifacts.
	var project_out := ProjectSettings.globalize_path("res://").path_join("../.godot_captures")
	DirAccess.make_dir_recursive_absolute(project_out)

	var labels := ["near", "mid", "far"]
	for i in labels.size():
		# Advance simulated time by pumping frames.
		for _f in 45 * (i + 1):
			await process_frame
		var img := root.get_viewport().get_texture().get_image()
		if img == null:
			push_warning("No viewport image at %s" % labels[i])
			continue
		var path := "%s/composition_%s.png" % [project_out, labels[i]]
		var save_err := img.save_png(path)
		print("[capture] %s -> %s (err=%s)" % [labels[i], path, save_err])

	quit(0)
