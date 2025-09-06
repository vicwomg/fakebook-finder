#!/bin/bash
# Advanced batch optimizer with options
# requires gs (ghostscript)

SOURCE_DIR="${1:-.}"          # First argument or current directory
DEST_DIR="${2:-optimized}"    # Second argument or 'optimized'
QUALITY="${3:-/ebook}"        # Third argument or '/ebook'

echo "📁 Source: $SOURCE_DIR"
echo "📁 Output: $DEST_DIR" 
echo "🎚️  Quality: $QUALITY"
echo

mkdir -p "$DEST_DIR"

count=0
for pdf in "$SOURCE_DIR"/*.pdf; do
    if [ -f "$pdf" ]; then
        filename=$(basename "$pdf")
        echo "⏳ Processing $filename..."
        
        # Get original file size
        original_size=$(stat -f%z "$pdf" 2>/dev/null || stat -c%s "$pdf" 2>/dev/null)
        
        gs -sDEVICE=pdfwrite \
           -dCompatibilityLevel=1.4 \
           -dPDFSETTINGS="$QUALITY" \
           -dNOPAUSE \
           -dQUIET \
           -dBATCH \
           -sOutputFile="$DEST_DIR/$filename" \
           "$pdf"
        
        # Get new file size and calculate savings
        if [ -f "$DEST_DIR/$filename" ]; then
            new_size=$(stat -f%z "$DEST_DIR/$filename" 2>/dev/null || stat -c%s "$DEST_DIR/$filename" 2>/dev/null)
            savings=$(echo "scale=1; ($original_size - $new_size) * 100 / $original_size" | bc 2>/dev/null || echo "N/A")
            echo "✅ $filename: $(echo $original_size | numfmt --to=iec 2>/dev/null || echo ${original_size}B) → $(echo $new_size | numfmt --to=iec 2>/dev/null || echo ${new_size}B) (${savings}% saved)"
        fi
        
        ((count++))
    fi
done

echo
echo "🎉 Optimized $count PDFs in '$DEST_DIR/'"