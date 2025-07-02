import { Transform } from 'class-transformer';

// Hàm helper để chuyển đổi chuỗi thành slug
export function slugify(value: string): string {
  return value
    .toString()
    .toLowerCase()
    .trim() // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ các ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Loại bỏ dấu gạch ngang thừa
}

// Decorator để chuyển đổi thành slug
export function ToSlug() {
  return Transform(({ value }) => (typeof value === 'string' ? slugify(value) : value));
}
