#!/usr/bin/env python
import subprocess
import json

with open('/sys/class/thermal/thermal_zone0/temp') as f:
    cpu = float(f.read()) / 1000.0

gpu = subprocess.check_output("/opt/vc/bin/vcgencmd measure_temp", shell=True)
gpu = gpu.replace("temp=", "").replace("'C\n", "")
gpu = float(gpu)

print(json.dumps({"cpu": cpu, "gpu": gpu}))
