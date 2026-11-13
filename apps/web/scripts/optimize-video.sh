#!/usr/bin/env bash
# Сжатие видео для сайта: MP4 (H.264, faststart) + WebM (VP9) + постер WebP, без звука.
# Автоплей на iOS/Android требует muted + playsinline — звук всё равно не нужен.
#
#   bash apps/web/scripts/optimize-video.sh ~/Downloads/17655450569288.mp4 hero
#   → apps/web/public/video/hero-720.mp4, hero-720.webm, hero-mobile.mp4, hero-poster.webp
#
# Цель: ≤ 2–3 МБ для hero (быстрый старт даже на 3G/4G).
set -euo pipefail
IN="${1:?Укажите исходный файл}"
NAME="${2:-hero}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/video"
mkdir -p "$OUT"
DUR="${MAX_SECONDS:-15}"   # hero-луп: первые 15 секунд достаточно

# 720p для десктопа
ffmpeg -y -i "$IN" -t "$DUR" -an -vf "scale=-2:720:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  "$OUT/$NAME-720.mp4"
ffmpeg -y -i "$IN" -t "$DUR" -an -vf "scale=-2:720:flags=lanczos,fps=30" \
  -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good -cpu-used 2 \
  "$OUT/$NAME-720.webm"
# 480p для телефонов (вертикальный кроп не делаем — object-cover на сайте)
ffmpeg -y -i "$IN" -t "$DUR" -an -vf "scale=-2:480:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 30 -profile:v main -pix_fmt yuv420p -movflags +faststart \
  "$OUT/$NAME-mobile.mp4"
# постер = первый кадр
ffmpeg -y -i "$IN" -frames:v 1 -vf "scale=-2:900:flags=lanczos" -c:v libwebp -quality 78 "$OUT/$NAME-poster.webp"

ls -lh "$OUT"/"$NAME"*
