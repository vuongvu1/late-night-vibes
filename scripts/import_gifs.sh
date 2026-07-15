#!/usr/bin/env bash
# Import animated backgrounds from a staging folder into src/assets/.
# Handles: dedupe vs repo, gap-fill numbering (vibe-NNN), size-based optimization
# (gif2webp / downscale), mp4->animated-webp conversion, infinite-loop normalization,
# static first-frame generation, and source cleanup.
#
# Usage:  bash scripts/import_gifs.sh [IMPORT_DIR]   (default: ~/Desktop/gifs)
#
# Requires: ImageMagick (magick), gif2webp + webpmux (libwebp), ffmpeg/ffprobe, python3.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GIFS="$ROOT/src/assets/gifs"; STATIC="$ROOT/src/assets/static"
IMPORT="${1:-$HOME/Desktop/gifs}"
LARGE=2500000        # bytes: optimize above this
CAP=1920             # max dimension for optimized output
OVERSIZE=2560        # force-optimize (downscale) if maxdim exceeds this, regardless of size
TMP="$(mktemp -d)"
cd "$ROOT"

[ -d "$IMPORT" ] || { echo "no import dir: $IMPORT"; exit 0; }

# md5 of everything already imported (to skip re-copied duplicates)
find "$GIFS" -type f \( -name '*.gif' -o -name '*.webp' \) -exec md5 -q {} \; | sort -u > "$TMP/repomd5"

# free vibe numbers, gaps first then beyond max (zero-padded later)
# NOTE: coerce with +0 so "007" keys as 7, not "007" — else zero-padded names read as free and clobber existing files.
free=$(ls "$GIFS" | grep -oE '[0-9]+' | sort -nu | \
  awk '{n=$1+0; e[n]=1; if(n>mx)mx=n} END{c=0; for(i=1;i<=mx+9999;i++) if(!(i in e)){print i; if(++c>=9999)exit}}')
IFS=$'\n' freearr=($free); unset IFS
fi=0
created=""

opt_gif() {  # $1 src gif  $2 out webp ; echoes size or "0" on inflate/fail
  local f="$1" out="$2" w h
  read w h <<<"$(magick identify -ping -format '%w %h' "${f}[0]" 2>/dev/null)"
  if [ "${w:-0}" -gt "$CAP" ] || [ "${h:-0}" -gt "$CAP" ]; then
    magick "$f" -coalesce -resize "${CAP}x${CAP}>" "$TMP/r.gif" 2>/dev/null
    gif2webp -lossy -q 68 -m 4 "$TMP/r.gif" -o "$out" 2>/dev/null
  else
    gif2webp -lossy -q 68 -m 4 "$f" -o "$out" 2>/dev/null
  fi
}

convert_mp4() {  # $1 src mp4  $2 out webp
  local m="$1" out="$2" rfr fps dur trim
  rfr=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 "$m")
  fps=$(awk -F/ '{x=(NF==2)?$1/$2:$1; print (x>20)?20:x}' <<<"$rfr")
  dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$m")
  trim=$(awk -v d="$dur" 'BEGIN{print (d>30)?"-t 30":""}')
  ffmpeg -y $trim -i "$m" -vf "fps=$fps,scale='min(1280,iw)':-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" "$TMP/m.gif" 2>/dev/null
  gif2webp -lossy -q 60 -m 4 "$TMP/m.gif" -o "$out" 2>/dev/null
  # heavy clip fallback: downscale + lower quality
  if [ "$(stat -f%z "$out" 2>/dev/null || echo 0)" -gt 6000000 ]; then
    local ftrim; ftrim=$(awk -v d="$dur" 'BEGIN{print (d>20)?"-t 20":""}')
    ffmpeg -y $ftrim -i "$m" -vf "fps=15,scale='min(960,iw)':-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" "$TMP/m.gif" 2>/dev/null
    gif2webp -lossy -q 52 -m 4 "$TMP/m.gif" -o "$out" 2>/dev/null
  fi
}

for f in "$IMPORT"/*; do
  [ -f "$f" ] || continue
  bn="$(basename "$f")"
  kind="$(file -b "$f" 2>/dev/null)"
  case "$kind" in GIF*|RIFF*|ISO\ Media*) ;; *) continue ;; esac   # skip pdf/png/etc
  if grep -qx "$(md5 -q "$f")" "$TMP/repomd5"; then echo "DUP-skip  $bn"; continue; fi

  n="${freearr[$fi]}"; fi=$((fi+1)); nnn="$(printf '%03d' "$n")"
  case "$kind" in
    ISO\ Media*)                       # mp4/video -> webp
      convert_mp4 "$f" "$GIFS/vibe-$nnn.webp"
      echo "MP4   vibe-$nnn.webp <= $bn ($(( $(stat -f%z "$GIFS/vibe-$nnn.webp")/1024 ))KB)" ;;
    *)                                 # gif or webp
      sz=$(stat -f%z "$f")
      read w h <<<"$(magick identify -ping -format '%w %h' "${f}[0]" 2>/dev/null)"
      maxd=$w; [ "${h:-0}" -gt "${w:-0}" ] && maxd=$h
      if [ "$sz" -gt "$LARGE" ] || [ "${maxd:-0}" -gt "$OVERSIZE" ]; then
        out="$GIFS/vibe-$nnn.webp"
        if [ "$kind" != "${kind#GIF}" ]; then opt_gif "$f" "$out"
        else magick "$f" -coalesce -resize "${CAP}x${CAP}>" -quality 70 -define webp:method=4 "$out" 2>/dev/null; fi
        osz=$(stat -f%z "$out" 2>/dev/null || echo 0)
        if [ "$osz" -ge "$sz" ] || [ "$osz" -eq 0 ]; then      # never inflate: keep original
          ext="${bn##*.}"; [ "$ext" = gifv ] && ext=gif
          cp "$f" "$GIFS/vibe-$nnn.$ext"; find "$GIFS" -name "vibe-$nnn.webp" ! -name "vibe-$nnn.$ext" -delete 2>/dev/null
          echo "KEEP  vibe-$nnn.$ext <= $bn (opt $((osz/1024))>=orig $((sz/1024))KB)"
        else echo "OPT   vibe-$nnn.webp <= $bn ($((sz/1024))->$((osz/1024))KB)"; fi
      else
        ext="${bn##*.}"; [ "$ext" = gifv ] && ext=gif
        cp "$f" "$GIFS/vibe-$nnn.$ext"; echo "COPY  vibe-$nnn.$ext <= $bn ($((sz/1024))KB)"
      fi ;;
  esac
  created="$created $nnn"
done

[ -z "$created" ] && { echo "nothing new to import."; exit 0; }

# static first frames
python3 scripts/generate_static.py >/dev/null 2>&1

# normalize every new asset to infinite loop
for nnn in $created; do
  for a in "$GIFS/vibe-$nnn.gif" "$GIFS/vibe-$nnn.webp"; do
    [ -f "$a" ] || continue
    fin=$(python3 - "$a" <<'PY'
import sys,struct
b=open(sys.argv[1],'rb').read()
if sys.argv[1].endswith('.gif'):
    i=b.find(b'NETSCAPE2.0'); j=i+11
    print(1 if (i<0 or (b[j]==3 and struct.unpack('<H',b[j+2:j+4])[0]!=0)) else 0)
else:
    i=b.find(b'ANIM'); print(1 if (i>=0 and struct.unpack('<H',b[i+12:i+14])[0]!=0) else 0)
PY
)
    [ "$fin" = 1 ] || continue
    if [ "${a##*.}" = webp ]; then webpmux -set loop 0 "$a" -o "$TMP/l.webp" 2>/dev/null && mv "$TMP/l.webp" "$a"
    else magick "$a" -loop 0 "$TMP/l.gif" 2>/dev/null && mv "$TMP/l.gif" "$a"; fi
    echo "loop-fixed vibe-$nnn"
  done
done

# remove consumed sources
find "$IMPORT" -type f \( -name '*.gif' -o -name '*.gifv' -o -name '*.webp' -o -name '*.mp4' \) -delete

g=$(ls "$GIFS"/*.gif "$GIFS"/*.webp 2>/dev/null | wc -l | tr -d ' ')
s=$(ls "$STATIC"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
unpaired=$(comm -3 <(ls "$GIFS"|sed -E 's/\.(gif|webp)$//'|sort -u) <(ls "$STATIC"|sed 's/\.jpg$//'|sort -u) | tr '\n' ' ')
echo "---"
echo "added:$created"
echo "gifs $g / statics $s | unpaired: ${unpaired:-none}"
