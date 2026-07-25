extends Node2D

const BG := Color("0a0e1a")
const BG_DEEP := Color("06090f")
const SURFACE := Color("0f1424")
const SURFACE_RAISED := Color("161d33")
const INK := Color("edf1f7")
const MUTED := Color("a9b4c7")
const LINE := Color(0.588, 0.784, 1.0, 0.18)
const LINE_FAINT := Color(0.588, 0.784, 1.0, 0.08)
const ACCENT := Color("ffb86b")
const FLOW := Color("63d9ff")
const VERIFIED := Color("b8f26d")

var phase := 0.04
var target_phase := -1.0
var active_stage := 0
var reduced_motion := false
var navigation_hold := 0.0
var selected_node := "context"
var hovered_node := ""
var path_running := false
var path_target_phase := 0.88
var is_visible := true
var journey_running := false
var journey_progress := 0.0
var journey_stage := -1
var journey_target := "issuelab"
var journey_duration := 6.4
var project_run_running := false
var project_view_active := false
var project_run_progress := 0.0
var project_run_stage := -1
var project_run_duration := 6.8
var hit_areas: Dictionary = {}
var message_callback

func _ready() -> void:
	get_viewport().size_changed.connect(_on_viewport_size_changed)
	_setup_web_bridge()
	queue_redraw()
	await get_tree().process_frame
	_send_parent({"type": "gqy:run:ready", "section": "about"})

func _process(delta: float) -> void:
	if not is_visible:
		return

	if journey_running:
		journey_progress = minf(1.0, journey_progress + delta / journey_duration)
		phase = journey_progress
		var next_journey_stage := clampi(int(floor(journey_progress * 4.0)), 0, 3)
		if next_journey_stage != journey_stage:
			journey_stage = next_journey_stage
			_send_journey_stage()
		active_stage = next_journey_stage
		if journey_progress >= 1.0:
			_finish_journey(false)
		queue_redraw()
		return

	if project_run_running:
		project_run_progress = minf(1.0, project_run_progress + delta / project_run_duration)
		phase = project_run_progress
		var next_project_stage := clampi(int(floor(project_run_progress * 4.0)), 0, 3)
		if next_project_stage != project_run_stage:
			project_run_stage = next_project_stage
			_send_project_stage()
		if project_run_progress >= 1.0:
			_finish_project_run()
		queue_redraw()
		return

	if path_running:
		phase = move_toward(phase, path_target_phase, delta * 0.34)
		var path_stage := clampi(int(floor(phase * 4.0)), 0, 3)
		if path_stage != active_stage:
			active_stage = path_stage
			_send_active_stage()
		if abs(phase - path_target_phase) < 0.002:
			phase = path_target_phase
			path_running = false
			navigation_hold = 5.0
			_send_parent({"type": "gqy:run:path-complete", "node": selected_node})
		queue_redraw()
		return

	if reduced_motion:
		queue_redraw()
		return

	if navigation_hold > 0.0:
		navigation_hold = maxf(0.0, navigation_hold - delta)
		queue_redraw()
		return

	if target_phase >= 0.0:
		phase = move_toward(phase, target_phase, delta * 0.72)
		if abs(phase - target_phase) < 0.002:
			target_phase = -1.0
	else:
		phase = fmod(phase + delta * 0.055, 1.0)

	var next_stage := clampi(int(floor(phase * 4.0)), 0, 3)
	if next_stage != active_stage:
		active_stage = next_stage
		_send_active_stage()

	queue_redraw()

func _draw() -> void:
	var size := get_viewport_rect().size
	if size.x < 2.0 or size.y < 2.0:
		return

	draw_rect(Rect2(Vector2.ZERO, size), BG)
	if journey_running:
		_draw_journey_world(size)
		return
	if project_run_running or project_view_active:
		_draw_project_run_world(size)
		return
	_draw_grid(size)
	hit_areas.clear()

	if size.x < 720.0 or size.y > size.x * 1.05:
		_draw_compact_world(size)
	else:
		_draw_wide_world(size)

func _draw_grid(size: Vector2) -> void:
	var spacing := 96.0
	var x := 0.0
	while x <= size.x:
		draw_line(Vector2(x, 0), Vector2(x, size.y), Color(LINE_FAINT, 0.045), 1.0)
		x += spacing
	var y := 0.0
	while y <= size.y:
		draw_line(Vector2(0, y), Vector2(size.x, y), Color(LINE_FAINT, 0.045), 1.0)
		y += spacing

func _draw_journey_grid(size: Vector2, camera_x: float) -> void:
	var spacing := 72.0
	var offset_x := fmod(-camera_x * 0.09, spacing)
	var x := offset_x - spacing
	while x <= size.x + spacing:
		draw_line(Vector2(x, 0), Vector2(x, size.y), Color(LINE_FAINT, 0.055), 1.0)
		x += spacing
	var horizon := size.y * 0.52
	for index in range(1, 8):
		var distance := float(index * index) * 15.0
		draw_line(Vector2(0, horizon - distance), Vector2(size.x, horizon - distance), Color(LINE_FAINT, 0.04), 1.0)
		draw_line(Vector2(0, horizon + distance), Vector2(size.x, horizon + distance), Color(LINE_FAINT, 0.04), 1.0)

func _draw_journey_world(size: Vector2) -> void:
	var spacing := maxf(860.0, size.x * 0.74)
	var eased_progress := journey_progress * journey_progress * (3.0 - 2.0 * journey_progress)
	var camera_x := eased_progress * spacing * 3.0
	_draw_journey_grid(size, camera_x)

	var module_width := clampf(size.x * 0.36, 380.0, 540.0)
	var module_height := clampf(size.y * 0.36, 220.0, 330.0)
	var module_size := Vector2(module_width, module_height)
	var context_rect := Rect2(Vector2(-module_width * 0.5, -module_height * 0.5), module_size)
	var memory_rect := Rect2(Vector2(spacing - module_width * 0.5, -module_height * 0.5), module_size)
	var tools_rect := Rect2(Vector2(spacing * 2.0 - module_width * 0.5, -module_height * 0.5), module_size)
	var work_size := Vector2(module_width * 0.72, module_height * 0.62)
	var output_x := spacing * 3.0
	var works := [
		Rect2(Vector2(output_x - work_size.x * 0.5, -work_size.y * 1.75), work_size),
		Rect2(Vector2(output_x - work_size.x * 0.5, -work_size.y * 0.5), work_size),
		Rect2(Vector2(output_x - work_size.x * 0.5, work_size.y * 0.75), work_size),
	]

	draw_set_transform(Vector2(size.x * 0.5 - camera_x, size.y * 0.52), 0.0, Vector2.ONE)

	var route := PackedVector2Array([
		context_rect.get_center(),
		Vector2(context_rect.end.x, 0.0),
		Vector2(memory_rect.position.x, 0.0),
		memory_rect.get_center(),
		Vector2(memory_rect.end.x, 0.0),
		Vector2(tools_rect.position.x, 0.0),
		tools_rect.get_center(),
		Vector2(tools_rect.end.x, 0.0),
		Vector2(works[1].position.x, 0.0),
		works[1].get_center(),
	])
	draw_polyline(route, Color(FLOW, 0.38), 2.0, true)
	for rect in [context_rect, memory_rect, tools_rect, works[1]]:
		_draw_port(rect.get_center(), FLOW)

	_draw_context_module(context_rect, active_stage == 0, journey_stage == 0)
	_draw_memory_module(memory_rect, active_stage == 1, journey_stage == 1)
	_draw_tools_module(tools_rect, active_stage == 2, journey_stage == 2)
	_draw_work_module(works[0], "TrumanWorld", false, false)
	_draw_work_module(works[1], "IssueLab", active_stage == 3, journey_stage == 3)
	_draw_work_module(works[2], "article-mcp", false, false)
	_draw_context_capsule(route)

	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_rect(Rect2(Vector2(0, 0), Vector2(size.x, size.y * 0.16)), Color(BG_DEEP, 0.62))
	draw_rect(Rect2(Vector2(0, size.y * 0.84), Vector2(size.x, size.y * 0.16)), Color(BG_DEEP, 0.72))

func _project_stage_progress(stage_index: int) -> float:
	return clampf(project_run_progress * 4.0 - float(stage_index), 0.0, 1.0)

func _ease_out_expo(value: float) -> float:
	var safe_value := clampf(value, 0.0, 1.0)
	if safe_value >= 1.0:
		return 1.0
	return 1.0 - pow(2.0, -10.0 * safe_value)

func _ease_in_out_cubic(value: float) -> float:
	var safe_value := clampf(value, 0.0, 1.0)
	if safe_value < 0.5:
		return 4.0 * safe_value * safe_value * safe_value
	return 1.0 - pow(-2.0 * safe_value + 2.0, 3.0) / 2.0

func _rect_lerp(from_rect: Rect2, to_rect: Rect2, weight: float) -> Rect2:
	var safe_weight := clampf(weight, 0.0, 1.0)
	return Rect2(from_rect.position.lerp(to_rect.position, safe_weight), from_rect.size.lerp(to_rect.size, safe_weight))

func _draw_project_atmosphere(size: Vector2) -> void:
	var stage_centers := [
		Vector2(size.x * 0.18, size.y * 0.5),
		Vector2(size.x * 0.5, size.y * 0.5),
		Vector2(size.x * 0.56, size.y * 0.5),
		Vector2(size.x * 0.84, size.y * 0.5),
	]
	var safe_stage := clampi(project_run_stage, 0, stage_centers.size() - 1)
	var local_progress := _project_stage_progress(safe_stage)
	var focus: Vector2 = stage_centers[safe_stage]
	var stage_color := VERIFIED if safe_stage == 3 else ACCENT if safe_stage == 0 else FLOW

	for ring in range(4):
		var radius := 32.0 + float(ring) * 42.0 + local_progress * 72.0
		var alpha := maxf(0.0, 0.12 - float(ring) * 0.021) * (1.0 - local_progress * 0.72)
		draw_arc(focus, radius, 0.0, TAU, 64, Color(stage_color, alpha), 1.0, true)

	var scan_x := lerpf(-size.x * 0.12, size.x * 1.12, fmod(project_run_progress * 3.0, 1.0))
	draw_line(Vector2(scan_x, size.y * 0.12), Vector2(scan_x, size.y * 0.88), Color(stage_color, 0.055), 1.0)
	for offset in [-18.0, 18.0]:
		draw_line(Vector2(0.0, focus.y + offset), Vector2(size.x, focus.y + offset), Color(stage_color, 0.026), 1.0)

func _draw_role_node(point: Vector2, label: String, color: Color, intensity: float, radius := 27.0) -> void:
	var safe_intensity := clampf(intensity, 0.0, 1.0)
	draw_circle(point, radius + 9.0, Color(color, 0.025 + safe_intensity * 0.055))
	draw_circle(point, radius, Color(SURFACE_RAISED, 0.88 + safe_intensity * 0.1))
	draw_arc(point, radius, -PI * 0.45, PI * (1.15 + safe_intensity * 0.7), 32, Color(color, 0.3 + safe_intensity * 0.68), 2.0, true)
	draw_circle(point, 3.5 + safe_intensity * 2.0, color)
	_draw_label(point + Vector2(-float(label.length()) * 2.7, radius + 22.0), label, 9, Color(MUTED, 0.68 + safe_intensity * 0.3))

func _draw_packet(from: Vector2, to: Vector2, progress: float, color: Color, size := 5.0) -> void:
	var safe_progress := clampf(progress, 0.0, 1.0)
	if safe_progress <= 0.001:
		return
	var point := from.lerp(to, _ease_in_out_cubic(safe_progress))
	var previous := from.lerp(to, _ease_in_out_cubic(maxf(0.0, safe_progress - 0.08)))
	draw_line(previous, point, Color(color, 0.36), 2.0, true)
	draw_rect(Rect2(point - Vector2(size, size), Vector2(size * 2.0, size * 2.0)), color, true)

func _draw_project_run_world(size: Vector2) -> void:
	hit_areas.clear()
	_draw_journey_grid(size, project_run_progress * size.x * 0.42)
	_draw_project_atmosphere(size)
	match selected_node:
		"trumanworld": _draw_truman_run(size)
		"article-mcp": _draw_article_run(size)
		_: _draw_issuelab_run(size)

func _draw_truman_run(size: Vector2) -> void:
	var center := Vector2(size.x * 0.53, size.y * 0.51)
	var event_target := Rect2(Vector2(size.x * 0.065, center.y - 68.0), Vector2(size.x * 0.205, 136.0))
	var event_start := Rect2(Vector2(-event_target.size.x - 20.0, event_target.position.y), event_target.size)
	var event_progress := _ease_out_expo(_project_stage_progress(0))
	var event_rect := _rect_lerp(event_start, event_target, event_progress)
	var ledger_target := Rect2(Vector2(size.x * 0.785, center.y - 112.0), Vector2(size.x * 0.17, 224.0))
	var agent_targets := [
		center + Vector2(-92.0, -116.0),
		center + Vector2(104.0, -88.0),
		center + Vector2(126.0, 92.0),
		center + Vector2(-104.0, 112.0),
	]

	_draw_module_shell(event_rect, project_run_stage == 0, true, project_run_stage == 0)
	_draw_label(event_rect.position + Vector2(18.0, 30.0), "WORLD EVENT", 12, ACCENT)
	_draw_label(event_rect.position + Vector2(18.0, 58.0), "A NEW SIGNAL", 17, INK)
	_draw_label(event_rect.position + Vector2(18.0, 84.0), "enters the timeline", 11, MUTED)

	draw_line(event_rect.get_center(), center, Color(ACCENT, 0.18 + event_progress * 0.5), 1.5, true)
	for packet_index in range(4):
		var packet_progress := clampf(_project_stage_progress(0) * 1.35 - float(packet_index) * 0.12, 0.0, 1.0)
		_draw_packet(event_rect.get_center(), center, packet_progress, ACCENT, 3.0 + float(packet_index % 2))

	var agent_progress := _project_stage_progress(1)
	var agents: Array[Vector2] = []
	for index in range(agent_targets.size()):
		var split := _ease_out_expo(clampf(agent_progress * 1.25 - float(index) * 0.09, 0.0, 1.0))
		var point: Vector2 = center.lerp(agent_targets[index], split)
		agents.append(point)
		if split > 0.001:
			draw_line(center, point, Color(FLOW, 0.16 + split * 0.44), 1.4, true)
			_draw_role_node(point, "A%02d" % (index + 1), FLOW, split, 19.0)

	draw_circle(center, 36.0 + agent_progress * 8.0, Color(ACCENT, 0.08))
	draw_arc(center, 36.0 + agent_progress * 8.0, -PI * 0.5, PI * (1.1 + agent_progress), 42, ACCENT, 2.0, true)
	_draw_label(center + Vector2(-21.0, 5.0), "STATE", 10, INK)

	var governance_progress := _project_stage_progress(2)
	if governance_progress > 0.001:
		for ring in range(3):
			var radius := 58.0 + float(ring) * 42.0 + sin(governance_progress * PI + float(ring)) * 10.0
			draw_arc(center, radius, -PI * 0.5 + governance_progress * float(ring + 1), PI * (0.45 + governance_progress * 1.5), 56, Color(FLOW, (0.26 - float(ring) * 0.052) * governance_progress), 1.4, true)
		for index in range(agents.size()):
			var next_index := (index + 1) % agents.size()
			draw_line(agents[index], agents[next_index], Color(ACCENT, 0.5 * governance_progress), 1.4, true)
			_draw_packet(agents[index], agents[next_index], fmod(governance_progress * 1.6 + float(index) * 0.19, 1.0), ACCENT, 2.5)

	var evidence_progress := _project_stage_progress(3)
	var ledger_seed := Rect2(center - Vector2(20.0, 20.0), Vector2(40.0, 40.0))
	var ledger_rect := _rect_lerp(ledger_seed, ledger_target, _ease_out_expo(evidence_progress))
	if evidence_progress > 0.001:
		for agent in agents:
			draw_line(agent, ledger_rect.get_center(), Color(VERIFIED, evidence_progress * 0.32), 1.2, true)
		_draw_module_shell(ledger_rect, project_run_stage == 3, false, evidence_progress > 0.88)
		_draw_label(ledger_rect.position + Vector2(16.0, 28.0), "WORLD LEDGER", 11, FLOW)
		for row in range(5):
			var row_y := ledger_rect.position.y + 54.0 + float(row) * 28.0
			var row_progress := clampf(evidence_progress * 1.45 - float(row) * 0.1, 0.0, 1.0)
			draw_rect(Rect2(Vector2(ledger_rect.position.x + 16.0, row_y), Vector2(6.0, 6.0)), Color(VERIFIED if row < 3 else FLOW, row_progress))
			draw_line(Vector2(ledger_rect.position.x + 32.0, row_y + 3.0), Vector2(lerpf(ledger_rect.position.x + 32.0, ledger_rect.end.x - 18.0, row_progress), row_y + 3.0), Color(MUTED, 0.72 * row_progress), 1.0)
		_draw_label(Vector2(ledger_rect.position.x + 16.0, ledger_rect.end.y - 18.0), "STATE COMMITTED", 10, Color(VERIFIED, evidence_progress))
		if evidence_progress > 0.72:
			var seal_progress := (evidence_progress - 0.72) / 0.28
			draw_arc(ledger_rect.get_center(), 42.0 + seal_progress * 32.0, 0.0, TAU, 48, Color(VERIFIED, 0.62 * (1.0 - seal_progress)), 2.0, true)

func _draw_issuelab_run(size: Vector2) -> void:
	var center_y := size.y * 0.5
	var hub := Vector2(size.x * 0.535, center_y)
	var issue_target := Rect2(Vector2(size.x * 0.055, center_y - 94.0), Vector2(size.x * 0.22, 188.0))
	var issue_start := Rect2(Vector2(-issue_target.size.x - 24.0, issue_target.position.y), issue_target.size)
	var issue_progress := _ease_out_expo(_project_stage_progress(0))
	var issue_rect := _rect_lerp(issue_start, issue_target, issue_progress)
	var result_target := Rect2(Vector2(size.x * 0.79, center_y - 108.0), Vector2(size.x * 0.165, 216.0))
	var agent_targets := [
		Vector2(size.x * 0.49, center_y - 128.0),
		Vector2(size.x * 0.625, center_y),
		Vector2(size.x * 0.49, center_y + 128.0),
	]

	_draw_module_shell(issue_rect, project_run_stage == 0, true, project_run_stage == 0)
	_draw_label(issue_rect.position + Vector2(18.0, 30.0), "GITHUB ISSUE / 188", 11, ACCENT)
	for row in range(4):
		var width := issue_rect.size.x * (0.72 if row == 0 else 0.54 + float(row % 2) * 0.12)
		var row_progress := clampf(issue_progress * 1.35 - float(row) * 0.1, 0.0, 1.0)
		draw_line(issue_rect.position + Vector2(18.0, 62.0 + row * 20.0), issue_rect.position + Vector2(18.0 + width * row_progress, 62.0 + row * 20.0), Color(MUTED, 0.62), 1.3)
	_draw_label(issue_rect.position + Vector2(18.0, issue_rect.size.y - 20.0), "RESEARCH QUESTION", 10, FLOW)

	draw_line(issue_rect.get_center(), hub, Color(ACCENT, 0.16 + issue_progress * 0.45), 1.5, true)
	for packet_index in range(5):
		var packet_progress := clampf(_project_stage_progress(0) * 1.4 - float(packet_index) * 0.1, 0.0, 1.0)
		_draw_packet(issue_rect.get_center(), hub, packet_progress, ACCENT if packet_index < 2 else FLOW, 3.0)
	var intake_ring := 18.0 + issue_progress * 24.0
	draw_arc(hub, intake_ring, -PI * 0.5, PI * (0.5 + issue_progress * 1.5), 40, Color(ACCENT, 0.82), 2.0, true)
	_draw_label(hub + Vector2(-31.0, 5.0), "DISPATCH", 9, INK)

	var agent_progress := _project_stage_progress(1)
	var agent_labels := ["RESEARCH", "REVIEW", "SYNTHESIS"]
	var agents: Array[Vector2] = []
	for index in range(agent_targets.size()):
		var split := _ease_out_expo(clampf(agent_progress * 1.3 - float(index) * 0.12, 0.0, 1.0))
		var point: Vector2 = hub.lerp(agent_targets[index], split)
		agents.append(point)
		if split > 0.001:
			draw_line(hub, point, Color(FLOW, 0.12 + split * 0.44), 1.4, true)
			_draw_role_node(point, agent_labels[index], FLOW if index != 1 else ACCENT, split)
		if split < 1.0 and split > 0.05:
			draw_circle(hub.lerp(point, 0.48), 2.5, Color(FLOW, split))

	var debate_progress := _project_stage_progress(2)
	if debate_progress > 0.001:
		for index in range(agents.size()):
			var next_index := (index + 1) % agents.size()
			draw_line(agents[index], agents[next_index], Color(ACCENT, 0.12 + debate_progress * 0.62), 2.0, true)
			for pulse_index in range(2):
				var pulse_progress := fmod(debate_progress * 1.8 + float(index) * 0.23 + float(pulse_index) * 0.52, 1.0)
				_draw_packet(agents[index], agents[next_index], pulse_progress, FLOW if pulse_index == 0 else ACCENT, 2.5)
	var claim_offsets := [Vector2(-44.0, -18.0), Vector2(20.0, -42.0), Vector2(18.0, 34.0), Vector2(-52.0, 48.0)]
	for claim_index in range(claim_offsets.size()):
		var claim_progress := clampf(debate_progress * 1.5 - float(claim_index) * 0.12, 0.0, 1.0)
		var claim_position: Vector2 = hub + claim_offsets[claim_index] * _ease_out_expo(claim_progress)
		var claim_color := VERIFIED if claim_index == 1 else ACCENT if claim_index == 3 else FLOW
		if claim_progress > 0.001:
			draw_rect(Rect2(claim_position - Vector2(12.0, 4.0), Vector2(24.0, 8.0)), Color(claim_color, 0.12 + claim_progress * 0.16), true)
			draw_line(claim_position - Vector2(8.0, 0.0), claim_position + Vector2(8.0, 0.0), Color(claim_color, claim_progress), 1.2)
	if debate_progress > 0.0:
		draw_arc(hub, 48.0 + sin(debate_progress * PI) * 12.0, debate_progress * PI, debate_progress * PI + PI * 1.45, 42, Color(ACCENT, debate_progress * 0.72), 2.0, true)
		_draw_label(hub + Vector2(-29.0, 74.0), "MODERATOR", 9, Color(MUTED, debate_progress))

	var result_progress := _project_stage_progress(3)
	var result_seed := Rect2(hub - Vector2(20.0, 20.0), Vector2(40.0, 40.0))
	var result_rect := _rect_lerp(result_seed, result_target, _ease_out_expo(result_progress))
	var decision_point := hub.lerp(result_rect.get_center(), _ease_in_out_cubic(result_progress))
	if result_progress > 0.001:
		for agent in agents:
			draw_line(agent, decision_point, Color(VERIFIED, result_progress * 0.42), 1.5, true)
			draw_circle(agent.lerp(decision_point, _ease_in_out_cubic(result_progress)), 3.0, VERIFIED)
		draw_line(hub, result_rect.get_center(), Color(VERIFIED, 0.18 + result_progress * 0.68), 2.2, true)
		_draw_module_shell(result_rect, project_run_stage == 3, false, result_progress > 0.84)
		_draw_label(result_rect.position + Vector2(16.0, 30.0), "VERIFIED THREAD", 11, FLOW)
		for row in range(4):
			var row_y := result_rect.position.y + 62.0 + float(row) * 26.0
			var row_progress := clampf(result_progress * 1.5 - float(row) * 0.1, 0.0, 1.0)
			draw_rect(Rect2(Vector2(result_rect.position.x + 16.0, row_y - 4.0), Vector2(7.0, 7.0)), Color(VERIFIED if row == 3 else ACCENT, row_progress))
			draw_line(Vector2(result_rect.position.x + 34.0, row_y), Vector2(lerpf(result_rect.position.x + 34.0, result_rect.end.x - 18.0, row_progress), row_y), Color(MUTED, 0.75 * row_progress), 1.2)
		_draw_label(result_rect.position + Vector2(16.0, result_rect.size.y - 18.0), "PUBLIC EVIDENCE", 10, Color(VERIFIED, result_progress))
		if result_progress > 0.7:
			var seal_progress := (result_progress - 0.7) / 0.3
			for ring in range(3):
				draw_arc(result_rect.get_center(), 34.0 + float(ring) * 20.0 + seal_progress * 26.0, 0.0, TAU, 48, Color(VERIFIED, (0.38 - float(ring) * 0.08) * (1.0 - seal_progress)), 1.6, true)

func _draw_article_run(size: Vector2) -> void:
	var center_y := size.y * 0.5
	var query_target := Rect2(Vector2(size.x * 0.05, center_y - 62.0), Vector2(size.x * 0.18, 124.0))
	var query_start := Rect2(Vector2(-query_target.size.x - 20.0, query_target.position.y), query_target.size)
	var query_progress := _ease_out_expo(_project_stage_progress(0))
	var query_rect := _rect_lerp(query_start, query_target, query_progress)
	var filter_center := Vector2(size.x * 0.61, center_y)
	var response_target := Rect2(Vector2(size.x * 0.78, center_y - 106.0), Vector2(size.x * 0.17, 212.0))
	var source_x := size.x * 0.36

	_draw_module_shell(query_rect, project_run_stage == 0, true, project_run_stage == 0)
	_draw_label(query_rect.position + Vector2(16.0, 28.0), "SEARCH INTENT", 11, ACCENT)
	_draw_label(query_rect.position + Vector2(16.0, 61.0), "agent memory", 14, INK)
	_draw_label(query_rect.position + Vector2(16.0, 86.0), "AND retrieval", 11, MUTED)

	var source_progress := _project_stage_progress(1)
	var source_labels := ["CROSSREF", "PUBMED", "OPENALEX"]
	var source_rects: Array[Rect2] = []
	for index in range(3):
		var source_target := Rect2(Vector2(source_x, center_y - 116.0 + float(index) * 82.0), Vector2(size.x * 0.15, 58.0))
		var source_stage := _ease_out_expo(clampf(source_progress * 1.35 - float(index) * 0.14, 0.0, 1.0))
		var source_seed := Rect2(query_rect.get_center() - Vector2(18.0, 12.0), Vector2(36.0, 24.0))
		var source_rect := _rect_lerp(source_seed, source_target, source_stage)
		source_rects.append(source_rect)
		if source_stage > 0.001:
			_draw_module_shell(source_rect, project_run_stage == 1, false, false)
			_draw_label(source_rect.position + Vector2(14.0, 24.0), source_labels[index], 10, Color(MUTED, source_stage))
			_draw_label(source_rect.position + Vector2(14.0, 44.0), "%02d records" % (23 - index * 5), 9, Color(FLOW, source_stage))
			draw_line(query_rect.get_center(), source_rect.get_center(), Color(FLOW, 0.12 + source_stage * 0.48), 1.2, true)
			_draw_packet(query_rect.get_center(), source_rect.get_center(), source_stage, FLOW, 2.5)

	var filter_progress := _project_stage_progress(2)
	var funnel := PackedVector2Array([
		filter_center + Vector2(-44.0, -64.0),
		filter_center + Vector2(44.0, -64.0),
		filter_center + Vector2(16.0, 14.0),
		filter_center + Vector2(16.0, 62.0),
		filter_center + Vector2(-16.0, 62.0),
		filter_center + Vector2(-16.0, 14.0),
	])
	var funnel_closed := PackedVector2Array(funnel)
	funnel_closed.append(funnel[0])
	if filter_progress > 0.001:
		draw_colored_polygon(funnel, Color(FLOW, 0.035 + filter_progress * 0.06))
		draw_polyline(funnel_closed, Color(FLOW, 0.25 + filter_progress * 0.62), 1.8, true)
		_draw_label(filter_center + Vector2(-31.0, -82.0), "FILTER", 10, Color(FLOW, filter_progress))
		_draw_label(filter_center + Vector2(-24.0, 2.0), "DEDUP", 9, Color(MUTED, filter_progress))
		for source_index in range(source_rects.size()):
			var source_center: Vector2 = source_rects[source_index].get_center()
			draw_line(source_center, filter_center + Vector2(0.0, -54.0), Color(FLOW, filter_progress * 0.42), 1.2, true)
			for particle_index in range(2):
				var particle_progress := fmod(filter_progress * 1.7 + float(source_index) * 0.21 + float(particle_index) * 0.48, 1.0)
				_draw_packet(source_center, filter_center + Vector2(0.0, -54.0), particle_progress, FLOW if particle_index == 0 else ACCENT, 2.0)
		for particle_index in range(5):
			var drop_progress := fmod(filter_progress * 1.8 + float(particle_index) * 0.17, 1.0)
			var drop_from := filter_center + Vector2(0.0, -48.0)
			var drop_to := filter_center + Vector2(0.0, 58.0)
			_draw_packet(drop_from, drop_to, drop_progress, VERIFIED if particle_index == 4 else FLOW, 2.0)

	var response_progress := _project_stage_progress(3)
	var response_seed := Rect2(filter_center - Vector2(18.0, 18.0), Vector2(36.0, 36.0))
	var response_rect := _rect_lerp(response_seed, response_target, _ease_out_expo(response_progress))
	if response_progress > 0.001:
		draw_line(filter_center + Vector2(16.0, 62.0), response_rect.get_center(), Color(VERIFIED, 0.16 + response_progress * 0.72), 2.0, true)
		_draw_packet(filter_center + Vector2(16.0, 62.0), response_rect.get_center(), response_progress, VERIFIED, 4.0)
		_draw_module_shell(response_rect, project_run_stage == 3, false, response_progress > 0.92)
		_draw_label(response_rect.position + Vector2(16.0, 28.0), "STRUCTURED RESULT", 10, Color(FLOW, response_progress))
		for row in range(5):
			var row_y := response_rect.position.y + 56.0 + float(row) * 25.0
			var row_progress := clampf(response_progress * 1.45 - float(row) * 0.09, 0.0, 1.0)
			draw_line(Vector2(response_rect.position.x + 16.0, row_y), Vector2(lerpf(response_rect.position.x + 16.0, response_rect.end.x - 18.0 - float(row % 2) * 22.0, row_progress), row_y), Color(MUTED, 0.76 * row_progress), 1.2)
		_draw_label(response_rect.position + Vector2(16.0, response_rect.size.y - 18.0), "RETURN TO AGENT", 10, Color(VERIFIED, response_progress))

func _draw_wide_world(size: Vector2) -> void:
	var top := maxf(74.0, size.y * 0.13)
	var module_height := minf(340.0, size.y * 0.54)
	var context_rect := Rect2(Vector2(size.x * 0.045, top + module_height * 0.16), Vector2(size.x * 0.13, module_height * 0.72))
	var memory_rect := Rect2(Vector2(size.x * 0.255, top), Vector2(size.x * 0.18, module_height))
	var tools_rect := Rect2(Vector2(size.x * 0.505, top), Vector2(size.x * 0.18, module_height))
	var work_width := size.x * 0.15
	var work_height := module_height * 0.265
	var work_x := size.x * 0.805
	var work_gap := module_height * 0.105
	var works := [
		Rect2(Vector2(work_x, top), Vector2(work_width, work_height)),
		Rect2(Vector2(work_x, top + work_height + work_gap), Vector2(work_width, work_height)),
		Rect2(Vector2(work_x, top + (work_height + work_gap) * 2.0), Vector2(work_width, work_height)),
	]

	_draw_flow_wide(context_rect, memory_rect, tools_rect, works)
	_draw_context_module(context_rect, active_stage == 0, selected_node == "context")
	_draw_memory_module(memory_rect, active_stage == 1, selected_node == "memory")
	_draw_tools_module(tools_rect, active_stage == 2, selected_node == "tools")
	_draw_work_module(works[0], "TrumanWorld", active_stage == 3, selected_node == "trumanworld")
	_draw_work_module(works[1], "IssueLab", active_stage == 3, selected_node == "issuelab")
	_draw_work_module(works[2], "article-mcp", active_stage == 3, selected_node == "article-mcp")

	hit_areas = {
		"context": context_rect,
		"memory": memory_rect,
		"tools": tools_rect,
		"trumanworld": works[0],
		"issuelab": works[1],
		"article-mcp": works[2],
	}

func _draw_compact_world(size: Vector2) -> void:
	var margin := maxf(24.0, size.x * 0.07)
	var width := size.x - margin * 2.0
	var context_rect := Rect2(Vector2(margin, size.y * 0.06), Vector2(width, size.y * 0.14))
	var memory_rect := Rect2(Vector2(margin, size.y * 0.25), Vector2(width, size.y * 0.17))
	var tools_rect := Rect2(Vector2(margin, size.y * 0.47), Vector2(width, size.y * 0.17))
	var available_bottom := size.y - 32.0
	var work_y := size.y * 0.71
	var work_height := maxf(72.0, minf(size.y * 0.16, available_bottom - work_y))
	var work_width := (width - 20.0) / 3.0
	var works := [
		Rect2(Vector2(margin, work_y), Vector2(work_width, work_height)),
		Rect2(Vector2(margin + work_width + 10.0, work_y), Vector2(work_width, work_height)),
		Rect2(Vector2(margin + (work_width + 10.0) * 2.0, work_y), Vector2(work_width, work_height)),
	]

	_draw_flow_compact(context_rect, memory_rect, tools_rect, works)
	_draw_context_module(context_rect, active_stage == 0, selected_node == "context", true)
	_draw_memory_module(memory_rect, active_stage == 1, selected_node == "memory", true)
	_draw_tools_module(tools_rect, active_stage == 2, selected_node == "tools", true)
	_draw_work_module(works[0], "Truman", active_stage == 3, selected_node == "trumanworld", true)
	_draw_work_module(works[1], "IssueLab", active_stage == 3, selected_node == "issuelab", true)
	_draw_work_module(works[2], "article", active_stage == 3, selected_node == "article-mcp", true)

	hit_areas = {
		"context": context_rect,
		"memory": memory_rect,
		"tools": tools_rect,
		"trumanworld": works[0],
		"issuelab": works[1],
		"article-mcp": works[2],
	}

func _draw_flow_wide(context_rect: Rect2, memory_rect: Rect2, tools_rect: Rect2, works: Array) -> void:
	var c_out := Vector2(context_rect.end.x, context_rect.get_center().y)
	var m_in := Vector2(memory_rect.position.x, memory_rect.get_center().y)
	var m_out := Vector2(memory_rect.end.x, memory_rect.get_center().y)
	var t_in := Vector2(tools_rect.position.x, tools_rect.get_center().y)
	var t_out := Vector2(tools_rect.end.x, tools_rect.get_center().y)
	var branch_x := lerpf(t_out.x, works[0].position.x, 0.48)

	_draw_signal_segment(c_out, m_in)
	_draw_signal_segment(m_out, t_in)
	for work in works:
		var w_in := Vector2(work.position.x, work.get_center().y)
		var branch_points := PackedVector2Array([t_out, Vector2(branch_x, t_out.y), Vector2(branch_x, w_in.y), w_in])
		draw_polyline(branch_points, FLOW, 2.0, true)
		_draw_port(w_in)
	_draw_port(c_out, ACCENT)
	_draw_port(m_in)
	_draw_port(t_in)
	_draw_port(t_out)

	var selected_work := _selected_work_index()
	var route := PackedVector2Array([
		c_out,
		m_in,
		m_out,
		t_in,
		t_out,
		Vector2(branch_x, t_out.y),
		Vector2(branch_x, works[selected_work].get_center().y),
		Vector2(works[selected_work].position.x, works[selected_work].get_center().y),
	])
	_draw_context_capsule(route)

func _draw_flow_compact(context_rect: Rect2, memory_rect: Rect2, tools_rect: Rect2, works: Array) -> void:
	var c_out := Vector2(context_rect.get_center().x, context_rect.end.y)
	var m_in := Vector2(memory_rect.get_center().x, memory_rect.position.y)
	var m_out := Vector2(memory_rect.get_center().x, memory_rect.end.y)
	var t_in := Vector2(tools_rect.get_center().x, tools_rect.position.y)
	var t_out := Vector2(tools_rect.get_center().x, tools_rect.end.y)
	var branch_y := lerpf(t_out.y, works[0].position.y, 0.5)

	_draw_signal_segment(c_out, m_in)
	_draw_signal_segment(m_out, t_in)
	for work in works:
		var w_in := Vector2(work.get_center().x, work.position.y)
		var points := PackedVector2Array([t_out, Vector2(t_out.x, branch_y), Vector2(w_in.x, branch_y), w_in])
		draw_polyline(points, FLOW, 2.0, true)
		_draw_port(w_in)
	_draw_port(c_out, ACCENT)
	_draw_port(m_in)
	_draw_port(t_in)
	_draw_port(t_out)

	var selected_work := _selected_work_index()
	var route := PackedVector2Array([c_out, m_in, m_out, t_in, t_out, Vector2(t_out.x, branch_y), Vector2(works[selected_work].get_center().x, branch_y), Vector2(works[selected_work].get_center().x, works[selected_work].position.y)])
	_draw_context_capsule(route)

func _draw_signal_segment(from: Vector2, to: Vector2) -> void:
	draw_line(from, to, FLOW, 2.0, true)

func _draw_context_capsule(route: PackedVector2Array) -> void:
	var point := _point_on_route(route, phase)
	for index in range(5, 0, -1):
		var trail_phase := maxf(0.0, phase - float(index) * 0.012)
		var trail := _point_on_route(route, trail_phase)
		var alpha := (6.0 - float(index)) / 12.0
		draw_rect(Rect2(trail - Vector2(3, 3), Vector2(6, 6)), Color(FLOW, alpha))

	draw_style_box(_capsule_style(), Rect2(point - Vector2(21, 12), Vector2(42, 24)))
	draw_rect(Rect2(point - Vector2(12, 5), Vector2(24, 10)), ACCENT)

func _point_on_route(route: PackedVector2Array, ratio: float) -> Vector2:
	if route.size() < 2:
		return Vector2.ZERO
	var lengths: Array[float] = []
	var total := 0.0
	for index in range(route.size() - 1):
		var length := route[index].distance_to(route[index + 1])
		lengths.append(length)
		total += length
	var distance := clampf(ratio, 0.0, 1.0) * total
	for index in range(lengths.size()):
		if distance <= lengths[index]:
			return route[index].lerp(route[index + 1], distance / maxf(lengths[index], 0.001))
		distance -= lengths[index]
	return route[route.size() - 1]

func _draw_context_module(rect: Rect2, active: bool, selected: bool, compact := false) -> void:
	_draw_module_shell(rect, active, true, selected)
	_draw_label(Vector2(rect.position.x, rect.position.y - 15.0), "CONTEXT", 14 if compact else 16, ACCENT)
	var pad := 18.0 if compact else 22.0
	var y := rect.position.y + pad
	for index in range(4 if compact else 6):
		var length := rect.size.x * (0.62 if index % 2 == 0 else 0.44)
		draw_line(Vector2(rect.position.x + pad, y), Vector2(rect.position.x + pad + length, y), ACCENT if index == 0 else Color(ACCENT, 0.58), 1.4)
		y += 11.0 if compact else 16.0
	if not compact:
		_draw_dot_matrix(Rect2(Vector2(rect.position.x + pad, rect.end.y - 66.0), Vector2(rect.size.x - pad * 2.0, 38.0)), ACCENT)

func _draw_memory_module(rect: Rect2, active: bool, selected: bool, compact := false) -> void:
	_draw_module_shell(rect, active, false, selected)
	_draw_module_header(rect, "MEMORY", compact)
	var center := rect.get_center()
	var icon_width := minf(rect.size.x * 0.32, 58.0)
	var icon_y := center.y - (8.0 if compact else 26.0)
	for index in range(3):
		var offset := float(index) * 10.0
		var diamond := PackedVector2Array([
			Vector2(center.x, icon_y + offset - 14.0),
			Vector2(center.x + icon_width, icon_y + offset),
			Vector2(center.x, icon_y + offset + 14.0),
			Vector2(center.x - icon_width, icon_y + offset),
			Vector2(center.x, icon_y + offset - 14.0),
		])
		draw_polyline(diamond, Color(MUTED, 0.75), 1.3, true)

func _draw_tools_module(rect: Rect2, active: bool, selected: bool, compact := false) -> void:
	_draw_module_shell(rect, active, false, selected)
	_draw_module_header(rect, "TOOLS", compact)
	var center := rect.get_center()
	var spread := minf(48.0, rect.size.x * 0.24)
	var y := center.y - (4.0 if compact else 20.0)
	draw_line(Vector2(center.x - spread, y + 24.0), Vector2(center.x, y - 14.0), Color(MUTED, 0.78), 2.0, true)
	draw_line(Vector2(center.x, y - 14.0), Vector2(center.x + spread, y + 18.0), Color(MUTED, 0.78), 2.0, true)
	for point in [Vector2(center.x - spread, y + 24.0), Vector2(center.x, y - 14.0), Vector2(center.x + spread, y + 18.0)]:
		draw_circle(point, 6.0, SURFACE_RAISED)
		draw_arc(point, 6.0, 0, TAU, 16, Color(MUTED, 0.9), 1.5, true)

func _draw_work_module(rect: Rect2, title: String, active: bool, selected: bool, compact := false) -> void:
	_draw_module_shell(rect, active, false, selected)
	var font_size := 10 if compact else 11
	_draw_label(rect.position + Vector2(14.0, 24.0), title, font_size, INK)
	var doc_rect := Rect2(Vector2(rect.get_center().x - 13.0, rect.position.y + rect.size.y * 0.36), Vector2(26.0, 30.0 if compact else 38.0))
	draw_rect(doc_rect, Color(MUTED, 0.72), false, 1.2)
	for line_index in range(3):
		var line_y := doc_rect.position.y + 8.0 + float(line_index) * 7.0
		draw_line(Vector2(doc_rect.position.x + 6.0, line_y), Vector2(doc_rect.end.x - 6.0, line_y), Color(MUTED, 0.55), 1.0)

func _draw_module_shell(rect: Rect2, active: bool, context := false, selected := false) -> void:
	var outline := ACCENT if selected else FLOW if active else Color(ACCENT, 0.66) if context else LINE
	var fill := Color(ACCENT, 0.065) if selected else Color(FLOW, 0.025) if active else Color(SURFACE, 0.84)
	var points := _chamfer_points(rect, minf(10.0, rect.size.x * 0.07))
	draw_colored_polygon(points, fill)
	var closed := PackedVector2Array(points)
	closed.append(points[0])
	draw_polyline(closed, outline, 2.4 if selected else 1.8 if active else 1.2, true)

func _draw_module_header(rect: Rect2, title: String, compact: bool) -> void:
	var font_size := 12 if compact else 14
	_draw_label(rect.position + Vector2(18.0, 28.0), title, font_size, MUTED)

func _draw_dot_matrix(rect: Rect2, color: Color) -> void:
	var columns := 8
	var rows := 4
	for row in range(rows):
		for column in range(columns):
			var point := Vector2(rect.position.x + float(column) * rect.size.x / float(columns - 1), rect.position.y + float(row) * rect.size.y / float(rows - 1))
			draw_circle(point, 1.2, Color(color, 0.55))

func _draw_port(position: Vector2, color := FLOW) -> void:
	draw_rect(Rect2(position - Vector2(5, 5), Vector2(10, 10)), BG, true)
	draw_rect(Rect2(position - Vector2(5, 5), Vector2(10, 10)), color, false, 1.5)

func _draw_label(position: Vector2, text: String, size: int, color: Color) -> void:
	draw_string(ThemeDB.fallback_font, position, text, HORIZONTAL_ALIGNMENT_LEFT, -1.0, size, color)

func _chamfer_points(rect: Rect2, cut: float) -> PackedVector2Array:
	return PackedVector2Array([
		Vector2(rect.position.x + cut, rect.position.y),
		Vector2(rect.end.x - cut, rect.position.y),
		Vector2(rect.end.x, rect.position.y + cut),
		Vector2(rect.end.x, rect.end.y - cut),
		Vector2(rect.end.x - cut, rect.end.y),
		Vector2(rect.position.x + cut, rect.end.y),
		Vector2(rect.position.x, rect.end.y - cut),
		Vector2(rect.position.x, rect.position.y + cut),
	])

func _capsule_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = BG_DEEP
	style.border_color = ACCENT
	style.set_border_width_all(2)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	return style

func _gui_input_position(event) -> Vector2:
	if event is InputEventMouseButton:
		return event.position
	if event is InputEventScreenTouch:
		return event.position
	return Vector2(-1, -1)

func _node_at_position(position: Vector2) -> String:
	for node in hit_areas:
		if hit_areas[node].has_point(position):
			return node
	return ""

func _unhandled_input(event) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_send_parent({"type": "gqy:run:exit"})
		get_viewport().set_input_as_handled()
		return
	if journey_running or project_run_running:
		return

	if event is InputEventMouseMotion:
		var next_hover := _node_at_position(event.position)
		if next_hover != hovered_node:
			hovered_node = next_hover
			Input.set_default_cursor_shape(Input.CURSOR_POINTING_HAND if hovered_node != "" else Input.CURSOR_ARROW)
			queue_redraw()

	var pressed: bool = (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT) or (event is InputEventScreenTouch and event.pressed)
	if not pressed:
		return
	var position := _gui_input_position(event)
	var node := _node_at_position(position)
	if node != "":
		_select_node(node)
		get_viewport().set_input_as_handled()

func _selected_work_index() -> int:
	if selected_node == "trumanworld":
		return 0
	if selected_node == "article-mcp":
		return 2
	return 1

func _node_target(node: String) -> float:
	match node:
		"context": return 0.04
		"memory": return 0.34
		"tools": return 0.62
		"trumanworld", "issuelab", "article-mcp": return 0.98
		_: return 0.04

func _node_section(node: String) -> String:
	if node == "memory" or node == "tools":
		return "stack"
	if node == "trumanworld" or node == "issuelab" or node == "article-mcp":
		return "work"
	return "about"

func _select_node(node: String) -> void:
	selected_node = node
	path_running = false
	project_run_running = false
	project_view_active = false
	target_phase = _node_target(node)
	active_stage = clampi(int(floor(target_phase * 4.0)), 0, 3)
	navigation_hold = 4.0
	_send_parent({"type": "gqy:run:select", "node": node})
	_send_parent({"type": "gqy:run:active", "section": _node_section(node)})
	queue_redraw()

func _run_path(node: String) -> void:
	journey_running = false
	project_run_running = false
	project_view_active = false
	selected_node = node
	phase = 0.02
	target_phase = -1.0
	path_target_phase = _node_target(node)
	active_stage = 0
	navigation_hold = 0.0
	_send_parent({"type": "gqy:run:active", "section": "about"})
	if reduced_motion:
		phase = path_target_phase
		active_stage = clampi(int(floor(phase * 4.0)), 0, 3)
		_send_active_stage()
		_send_parent({"type": "gqy:run:path-complete", "node": selected_node})
	else:
		path_running = true
	queue_redraw()

func _start_project_run(node: String) -> void:
	if node != "trumanworld" and node != "issuelab" and node != "article-mcp":
		_run_path(node)
		return
	journey_running = false
	path_running = false
	selected_node = node
	project_run_progress = 0.0
	project_run_stage = 0
	project_run_running = true
	project_view_active = true
	target_phase = -1.0
	navigation_hold = 0.0
	_send_project_stage()
	if reduced_motion:
		project_run_progress = 1.0
		project_run_stage = 3
		_send_project_stage()
		_finish_project_run()
	queue_redraw()

func _finish_project_run() -> void:
	project_run_running = false
	project_view_active = true
	project_run_progress = 1.0
	project_run_stage = 3
	phase = 1.0
	_send_parent({"type": "gqy:run:project-complete", "node": selected_node})
	queue_redraw()

func _send_project_stage() -> void:
	_send_parent({
		"type": "gqy:run:project-stage",
		"node": selected_node,
		"stage": project_run_stage,
	})

func _start_journey(node: String) -> void:
	journey_target = node if node == "trumanworld" or node == "issuelab" or node == "article-mcp" else "issuelab"
	selected_node = journey_target
	journey_progress = 0.0
	journey_stage = 0
	phase = 0.0
	active_stage = 0
	path_running = false
	project_run_running = false
	project_view_active = false
	target_phase = -1.0
	navigation_hold = 0.0
	journey_running = true
	_send_journey_stage()
	if reduced_motion:
		journey_progress = 1.0
		_finish_journey(false)
	queue_redraw()

func _finish_journey(skipped: bool) -> void:
	journey_running = false
	selected_node = journey_target
	phase = _node_target(journey_target)
	target_phase = -1.0
	active_stage = 3
	navigation_hold = 5.0
	_send_parent({"type": "gqy:run:journey-complete", "node": journey_target, "skipped": skipped})
	queue_redraw()

func _send_journey_stage() -> void:
	var stage_names := ["context", "memory", "tools", "output"]
	var safe_stage := clampi(journey_stage, 0, stage_names.size() - 1)
	_send_parent({
		"type": "gqy:run:journey-stage",
		"stage": stage_names[safe_stage],
		"index": safe_stage,
	})

func _navigate_to(section: String) -> void:
	match section:
		"about": _select_node("context")
		"stack": _select_node("memory")
		"work": _select_node("issuelab")
		_: return

func _send_active_stage() -> void:
	var section := "about"
	if active_stage == 1 or active_stage == 2:
		section = "stack"
	elif active_stage == 3:
		section = "work"
	_send_parent({"type": "gqy:run:active", "section": section})

func _setup_web_bridge() -> void:
	if not OS.has_feature("web"):
		return
	message_callback = JavaScriptBridge.create_callback(_on_web_message)
	var window := JavaScriptBridge.get_interface("window")
	window.addEventListener("message", message_callback)

func _on_web_message(arguments: Array) -> void:
	if arguments.is_empty():
		return
	var event = arguments[0]
	var payload = JSON.parse_string(str(event.data))
	if typeof(payload) != TYPE_DICTIONARY:
		return
	match payload.get("type", ""):
		"gqy:run:navigate":
			_navigate_to(str(payload.get("section", "about")))
		"gqy:run:select":
			_select_node(str(payload.get("node", "context")))
		"gqy:run:path":
			_run_path(str(payload.get("node", "issuelab")))
		"gqy:run:project-run":
			_start_project_run(str(payload.get("node", "issuelab")))
		"gqy:run:journey":
			_start_journey(str(payload.get("node", "issuelab")))
		"gqy:run:journey-skip":
			journey_target = str(payload.get("node", journey_target))
			_finish_journey(true)
		"gqy:run:visibility":
			is_visible = bool(payload.get("visible", true))
			set_process(is_visible)
			if is_visible:
				queue_redraw()
		"gqy:run:preferences":
			reduced_motion = bool(payload.get("reducedMotion", false))
			if reduced_motion:
				phase = _node_target(selected_node)
			queue_redraw()

func _send_parent(payload: Dictionary) -> void:
	if not OS.has_feature("web"):
		return
	var window := JavaScriptBridge.get_interface("window")
	window.parent.postMessage(JSON.stringify(payload), "*")

func _on_viewport_size_changed() -> void:
	queue_redraw()
