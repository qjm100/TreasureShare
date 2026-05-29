#!/bin/bash
# Build script: compile all LaTeX (TikZ) diagrams to PNG
# Requires: pdflatex, pdftoppm (from poppler-utils), or imagemagick
# Install on Arch: sudo pacman -S texlive-latexextra texlive-fontsextra poppler imagemagick
# Install on Ubuntu: sudo apt install texlive-latex-extra texlive-fonts-recommended poppler-utils imagemagick

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/images"
TEX_DIR="$OUT_DIR"  # .tex files are already in images/

echo "==> Compiling LaTeX diagrams to PNG..."
echo "    Source: $TEX_DIR"
echo "    Output: $OUT_DIR"
echo ""

cd "$TEX_DIR"

# List of tex files (01-15)
TEX_FILES=(
  "01-gantt"
  "02-function-arch"
  "03-use-case"
  "04-dfd"
  "05-flowchart"
  "06-module-structure"
  "07-matrix"
  "08-er-diagram"
  "09-table-relations"
  "10-program-structure"
  "11-sequence-login"
  "12-order-lifecycle"
  "13-deployment"
  "14-test-arch"
  "15-interface-arch"
)

for name in "${TEX_FILES[@]}"; do
  echo "    Compiling $name.tex ..."
  pdflatex -interaction=nonstopmode -halt-on-error "$name.tex" > /dev/null 2>&1
  pdflatex -interaction=nonstopmode -halt-on-error "$name.tex" > /dev/null 2>&1  # second pass for TikZ

  # Convert PDF to PNG (prefer pdftoppm, fallback to imagemagick)
  if command -v pdftoppm &>/dev/null; then
    pdftoppm -png -r 300 "$name.pdf" "$name" > /dev/null 2>&1
    mv "${name}-1.png" "${name}.png" 2>/dev/null || mv "${name}*.png" "${name}.png" 2>/dev/null || true
  elif command -v convert &>/dev/null; then
    convert -density 300 "$name.pdf" -quality 95 "${name}.png" > /dev/null 2>&1
  else
    echo "    WARNING: pdftoppm or imagemagick required for PNG conversion. PDF only: $name.pdf"
  fi

  echo "    Done: $name.png"
done

# Cleanup auxiliary files
rm -f *.aux *.log *.out 2>/dev/null || true
rm -f *.pdf 2>/dev/null || true

echo ""
echo "==> All done! Images in $OUT_DIR/"
ls -la "$OUT_DIR"/*.png 2>/dev/null || echo "    (PNG files not generated - check pdftoppm or imagemagick)"
