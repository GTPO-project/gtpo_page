"""Build the synchronized, 2x screw-driving gallery clip; preserve both inputs."""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('wide', type=Path)
parser.add_argument('closeup', type=Path)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
output = Path(__file__).resolve().parents[1] / 'dist/assets/videos/drive-screw-2x-v2.mp4'
output.parent.mkdir(parents=True, exist_ok=True)

# Audio correlation at separate intervals gives +1.039 to +1.052 seconds.
# LED onset independently confirms ~32.2s wide / ~33.3s closeup.
# Crop the earlier-starting closeup to the shared event timeline before speeding up.
# The 27.5%-width, flush bottom-left inset matches the Solder clip.
filters = (
    '[0:v]setpts=(PTS-STARTPTS)/2,setsar=1[wide];'
    '[1:v]trim=start=1.05,setpts=(PTS-STARTPTS)/2,'
    'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,'
    'tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,'
    'scale=528:298,setsar=1,format=yuv420p[inset];'
    '[wide][inset]overlay=x=0:y=H-h:shortest=1,'
    'fps=60000/1001,format=yuv420p[video]'
)
subprocess.run([
    args.ffmpeg, '-hide_banner', '-i', str(args.wide), '-i', str(args.closeup),
    '-filter_complex', filters, '-map', '[video]', '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart',
    '-map_metadata', '-1', '-shortest', '-y', str(output),
], check=True)
subprocess.run([
    args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', str(output),
    '-ss', '15', '-frames:v', '1', '-vf', 'scale=1280:720', '-q:v', '2',
    '-y', str(output.parent / 'drive-screw-v1.jpg'),
], check=True)
