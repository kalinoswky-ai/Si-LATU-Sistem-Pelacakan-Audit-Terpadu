/**
 * Lambang sementara — ganti dengan logo resmi Kabupaten Sumba Barat
 * (letakkan file gambar di folder /public, lalu ganti isi komponen ini
 * dengan <img src="/logo-sumba-barat.png" ... />) bila sudah tersedia.
 */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={className} aria-hidden="true">
      <path
        d="M20 1 L37 7 V20 C37 31 30 39 20 43 C10 39 3 31 3 20 V7 Z"
        fill="#1F3864"
        stroke="#C99A3E"
        strokeWidth="1.5"
      />
      <path d="M20 8 L20 36 M11 16 L29 16" stroke="#C99A3E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="16" r="3.4" fill="#F4F1EA" />
    </svg>
  );
}
