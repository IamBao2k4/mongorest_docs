#!/bin/bash

# Script để convert React source thành format cho Sandpack
# Usage: ./convert-to-sandpack.sh [folder1] [folder2] ...
# Example: ./convert-to-sandpack.sh src/components/ui src/helpers

# Các folder cần convert (có thể truyền vào qua arguments hoặc định nghĩa ở đây)
if [ $# -eq 0 ]; then
    # Nếu không có arguments, sử dụng default folders
    FOLDERS=(
        "src/components/ui"
        "src/helpers"
        "src/lib"
        "src/services"
        "src/hooks"
    )
else
    # Sử dụng arguments được truyền vào
    FOLDERS=("$@")
fi

OUTPUT_DIR="convert-sandpack"
INDEX_FILE="$OUTPUT_DIR/index.js"

# Tạo thư mục output
echo "Creating output directory: $OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Hiển thị folders sẽ được process
echo "Folders to process:"
for folder in "${FOLDERS[@]}"; do
    if [ -d "$folder" ]; then
        echo "  ✓ $folder"
    else
        echo "  ✗ $folder (not found)"
    fi
done
echo ""

# Function để convert full path thành valid variable name
get_var_name() {
    local filepath="$1"
    # Loại bỏ prefix src/ nếu có
    local clean_path=$(echo "$filepath" | sed 's|^src/||')
    # Lấy path, loại bỏ extension, replace / và special chars với _
    local name=$(echo "$clean_path" | sed 's/\.[^.]*$//' | sed 's/[^a-zA-Z0-9]/_/g' | sed 's/^_*//' | sed 's/_*$//')
    # Đảm bảo không bắt đầu bằng số
    if [[ $name =~ ^[0-9] ]]; then
        name="file_$name"
    fi
    echo "$name"
}

# Function để replace environment variables với giá trị thực tế
replace_env_vars() {
    local content="$1"
    
    # Replace các biến môi trường dạng ${...}
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_API_URL}/https:\/\/tav.mangoads.com.vn/g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_API_PREFIX}/api/g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_MINIO_CDN}/https:\/\/minio.mangoads.com.vn/g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_MINIO_BUCKET}/tav/g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_REPLACE_MEDIA}/\/media\//g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.VITE_REPLACE_FILE}/\/files\//g')
    content=$(echo "$content" | sed 's/\${import\.meta\.env\.NODE_ENV}/'"'"'production'"'"'/g')
    
    # Replace dạng không có dấu {} - với quoted values
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_API_URL/'"'"'https:\/\/tav.mangoads.com.vn'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_API_PREFIX/'"'"'api'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_MINIO_CDN/'"'"'https:\/\/minio.mangoads.com.vn'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_MINIO_BUCKET/'"'"'tav'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_REPLACE_MEDIA/'"'"'\/media\/'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_REPLACE_FILE/'"'"'\/files\/'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.NODE_ENV/'"'"'production'"'"'/g')
    
    # Replace dạng || default values (ví dụ: import.meta.env.VITE_REPLACE_MEDIA || '/media/')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_REPLACE_MEDIA || '"'"'\/media\/'"'"'/'"'"'\/media\/'"'"'/g')
    content=$(echo "$content" | sed 's/import\.meta\.env\.VITE_REPLACE_FILE || '"'"'\/files\/'"'"'/'"'"'\/files\/'"'"'/g')
    
    echo "$content"
}

# Function để escape content cho JavaScript string (giữ nguyên format)
escape_content() {
    local content="$1"
    
    # 1. Replace environment variables trước
    content=$(replace_env_vars "$content")
    
    # 2. Escape các ký tự đặc biệt
    # - Escape backslashes trước
    # - Escape backticks  
    # - Escape dollar signs (để tránh variable substitution)
    # - Replace @/ thành / (để fix path imports)
    printf '%s' "$content" | sed 's/\\/\\\\/g' | sed 's/`/\\`/g' | sed 's/\$/\\$/g' | sed 's/@\//\//g'
}

# Arrays để lưu thông tin cho index file
declare -a var_names=()
declare -a file_paths=()
declare -a import_statements=()

echo "Processing files..."

# Process từng folder được chỉ định
for folder in "${FOLDERS[@]}"; do
    if [ ! -d "$folder" ]; then
        echo "⚠️  Folder not found: $folder"
        continue
    fi
    
    echo "📁 Processing folder: $folder"
    
    # Tìm tất cả files trong folder hiện tại
    find "$folder" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.json" \) | while read -r file; do
        echo "  Processing: $file"
        
        # Lấy relative path và loại bỏ prefix src/
        relative_path=$(echo "$file" | sed 's|^src/|/|')
        # Nếu không bắt đầu bằng /, thêm vào
        if [[ ! $relative_path =~ ^/ ]]; then
            relative_path="/$relative_path"
        fi
        
        # Tạo variable name dựa trên path đã clean
        var_name=$(get_var_name "$file")
        
        # Đọc content của file
        if [ -f "$file" ]; then
            # Đọc file một cách an toàn
            content=$(<"$file")
            escaped_content=$(escape_content "$content")
            
            # Tạo file output với tên unique
            output_file="$OUTPUT_DIR/${var_name}.js"
            
            # Kiểm tra nếu file đã tồn tại (trùng variable name)
            counter=1
            original_var_name="$var_name"
            while [ -f "$output_file" ]; do
                var_name="${original_var_name}_${counter}"
                output_file="$OUTPUT_DIR/${var_name}.js"
                counter=$((counter + 1))
            done
            
            # Tạo file với content được escape đúng cách
            printf 'export const %s = `%s`;' "$var_name" "$escaped_content" > "$output_file"
            
            # Lưu thông tin cho index file
            echo "$var_name|$relative_path|$var_name" >> "$OUTPUT_DIR/temp_index_data.txt"
            
            echo "  Created: $output_file (var: $var_name)"
        fi
    done
done

echo "Creating index file..."

# Tạo index file
{
    echo "// Auto-generated index file for Sandpack"
    echo ""
    
    # Tạo import statements
    while IFS='|' read -r var_name file_path var_export; do
        echo "import { $var_export } from './${var_name}.js';"
    done < "$OUTPUT_DIR/temp_index_data.txt"
    
    echo ""
    echo "export const files = {"
    
    # Tạo object entries với format mới
    while IFS='|' read -r var_name file_path var_export; do
        echo "  '$file_path': {"
        echo "    code: $var_export,"
        echo "    active: true,"
        echo "  },"
    done < "$OUTPUT_DIR/temp_index_data.txt"
    
    echo "};"
    echo ""
    echo "export default files;"
    
} > "$INDEX_FILE"

# Cleanup temp file
rm -f "$OUTPUT_DIR/temp_index_data.txt"

echo ""
echo "✅ Conversion completed!"
echo "📁 Output directory: $OUTPUT_DIR"
echo "📄 Index file: $INDEX_FILE"
echo ""
echo ""
echo "Usage examples:"
echo "1. Use default folders:"
echo "   ./convert-to-sandpack.sh"
echo ""
echo "2. Specify custom folders:"
echo "   ./convert-to-sandpack.sh src/components/ui src/helpers"
echo "   ./convert-to-sandpack.sh src/components src/utils src/hooks"
echo ""
echo "3. Import in your code:"
echo "   import { files } from './convert-sandpack/index.js';"
echo "   // files object contains all your source files as strings"
echo ""
echo "File structure:"
echo "convert-sandpack/"
echo "├── index.js           # Main export file"
echo "├── [component1].js    # Individual file exports"
echo "├── [component2].js"
echo "└── ..."